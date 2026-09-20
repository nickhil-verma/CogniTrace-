'use client';

import { useState, useCallback } from 'react';
import { VoiceState, TimelineStep, AgentActionItem } from '@/types/agent';
import { useAudioRecorder } from './useAudioRecorder';
import { useReminders } from './useReminders';
import { useAppointments } from './useAppointments';
import { useMemories } from './useMemories';
import { useLanguage } from './useLanguage';
import { api } from '@/lib/api';

export function useVoiceAgent() {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [actions, setActions] = useState<AgentActionItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { currentLangObj } = useLanguage();

  const {
    isRecording,
    audioBlob,
    volumeLevel,
    permissionError,
    speechTranscript,
    speechTranscriptRef,
    startRecording,
    stopRecording
  } = useAudioRecorder();

  const { addReminder } = useReminders();
  const { addAppointment } = useAppointments();
  const { addMemory } = useMemories();

  // Speak AI response using Polly audio or Web Speech API synthesis
  const speakWithWebSpeech = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = currentLangObj?.speechLang || 'en-US';
      utterance.onend = () => setVoiceState('IDLE');
      utterance.onerror = () => setVoiceState('IDLE');
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setVoiceState('IDLE'), 2500);
    }
  }, [currentLangObj]);

  const playAudioResponse = useCallback((text: string, audioUrl?: string) => {
    setVoiceState('SPEAKING');
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setVoiceState('IDLE');
      audio.onerror = () => speakWithWebSpeech(text);
      audio.play().catch(() => speakWithWebSpeech(text));
    } else {
      speakWithWebSpeech(text);
    }
  }, [speakWithWebSpeech]);

  const { reminders, toggleComplete } = useReminders();

  // Dispatch tool actions dynamically to real React state and persistent storage
  const executeRealToolAction = useCallback((action: AgentActionItem, textInput: string) => {
    const lower = textInput.toLowerCase();

    // 1. Mark Job Done / Toggle Reminder Complete
    if (action.toolType === 'complete_reminder' || lower.includes('done') || lower.includes('mark completed') || lower.includes('finish')) {
      const match = reminders.find((r) => lower.includes(r.title.toLowerCase().slice(0, 8)));
      if (match) {
        toggleComplete(match.id);
      } else if (reminders.length > 0) {
        toggleComplete(reminders[0].id);
      }
      return;
    }

    // 2. Dynamic Reminder Creation
    if (action.toolType === 'create_reminder' || lower.includes('remind') || lower.includes('medicine') || lower.includes('medication')) {
      const parsedTitle = action.parameters?.title || textInput.replace(/remind (mom|me) to/i, '').trim();
      const timeMatch = textInput.match(/at (\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      
      addReminder({
        title: parsedTitle && parsedTitle.length > 3 ? parsedTitle : 'Take evening medicine',
        time: action.parameters?.time || (timeMatch ? timeMatch[1].toUpperCase() : '8:00 PM'),
        date: action.parameters?.date || 'Today',
        category: lower.includes('medicine') || lower.includes('medication') ? 'Medication' : 'Daily Routine',

        status: 'Upcoming',
        patientName: 'Mom',
        dosageOrDetails: action.parameters?.details || 'Scheduled via Voice AI Assistant',
        recurring: 'Daily'
      });
    } 
    // 3. Dynamic Appointment Creation
    else if (action.toolType === 'create_appointment' || lower.includes('appointment') || lower.includes('doctor')) {
      const docMatch = textInput.match(/dr\.?\s+([a-z\s]+)/i);
      const doctorName = action.parameters?.doctorName || (docMatch ? `Dr. ${docMatch[1].trim()}` : 'Dr. Anita Sharma');
      
      addAppointment({
        title: action.parameters?.title || `${doctorName} Consultation`,
        doctorName: doctorName,
        specialty: action.parameters?.specialty || 'Cognitive Care',
        date: action.parameters?.date || 'Tomorrow',
        time: action.parameters?.time || '10:30 AM',
        location: action.parameters?.location || 'City Care Clinic',
        notes: action.parameters?.notes || 'Scheduled via AI Voice Agent',
        status: 'Upcoming'
      });
    } 
    // 4. Dynamic Memory Retrieval / Album Creation
    else if (action.toolType === 'retrieve_memory' || action.toolType === 'create_memory' || lower.includes('memory') || lower.includes('photo')) {
      addMemory({
        title: action.parameters?.title || 'Family Memory Album',
        date: action.parameters?.date || 'Summer 1987',
        location: action.parameters?.location || 'Family Home',
        imageUrl: action.parameters?.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        description: action.parameters?.description || textInput,
        people: ['Mom', 'Caregiver'],
        tags: ['Vacation', 'Memory'],
        reminiscencePrompt: `Mom, do you remember this special moment: ${textInput}?`
      });
    }
  }, [addReminder, addAppointment, addMemory, reminders, toggleComplete]);


  // Submit prompt (either text or voice audio)
  const submitVoiceTurn = useCallback(async (textInput?: string, inputBlob?: Blob | null) => {
    const promptText = textInput || speechTranscriptRef.current || speechTranscript || 'What should I do next?';
    const targetBlob = inputBlob !== undefined ? inputBlob : audioBlob;

    setErrorMessage(null);
    setVoiceState('PROCESSING');
    setTranscript(promptText);

    try {
      // Step 1: Processing prompt via backend API
      const response = await api.submitAudioTaskTurn(targetBlob || null, promptText);
      
      const finalTranscript = response.transcript || promptText;
      const responseText = response.aiResponseText || (response as any).aiResponse || "Request processed and saved to schedule.";

      setTranscript(finalTranscript);
      setAiResponse(responseText);
      
      if (response.executionTimeline) {
        setTimeline(response.executionTimeline);
      }

      // Step 2: Execute tool actions on app state
      if (response.actions && response.actions.length > 0) {
        setVoiceState('EXECUTING');
        setActions((prev) => [...response.actions, ...prev]);

        for (const act of response.actions) {
          executeRealToolAction(act, finalTranscript);
        }
        await new Promise((res) => setTimeout(res, 600));
      } else {
        const mockAction: AgentActionItem = {
          id: `act_${Date.now()}`,
          toolType: promptText.toLowerCase().includes('appointment') ? 'create_appointment' : (promptText.toLowerCase().includes('remind') ? 'create_reminder' : 'retrieve_memory'),
          title: 'Action Executed',
          description: responseText,
          parameters: {},
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        executeRealToolAction(mockAction, finalTranscript);
        setActions((prev) => [mockAction, ...prev]);
      }

      // Step 3: Speak AI Voice response
      playAudioResponse(responseText, response.audioUrl);
    } catch (err: any) {
      console.error('Voice agent turn error:', err);
      setVoiceState('ERROR');
      setErrorMessage('CogniTrace couldn’t reach the care service. Please try again.');
    }
  }, [audioBlob, speechTranscript, speechTranscriptRef, playAudioResponse, executeRealToolAction]);

  // Handle start listening
  const handleStartListening = useCallback(() => {
    setVoiceState('LISTENING');
    startRecording();
  }, [startRecording]);

  // Handle stop listening & process audio asynchronously
  const handleStopListeningAndSubmit = useCallback(async () => {
    setVoiceState('PROCESSING');
    const result = await stopRecording();
    const liveText = result.speechTranscript || speechTranscriptRef.current || speechTranscript;
    submitVoiceTurn(liveText.trim() ? liveText.trim() : undefined, result.audioBlob);
  }, [stopRecording, submitVoiceTurn, speechTranscriptRef, speechTranscript]);

  // Handle quick suggested command click
  const triggerSuggestedCommand = useCallback((commandText: string) => {
    submitVoiceTurn(commandText);
  }, [submitVoiceTurn]);

  return {
    voiceState,
    isRecording,
    volumeLevel,
    permissionError,
    speechTranscript: speechTranscript || transcript,
    transcript,
    aiResponse,
    timeline,
    actions,
    errorMessage,
    handleStartListening,
    handleStopListeningAndSubmit,
    submitVoiceTurn,
    triggerSuggestedCommand,
    setVoiceState
  };
}
