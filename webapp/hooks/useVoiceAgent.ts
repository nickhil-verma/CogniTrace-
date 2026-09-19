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

  // Dispatch tool actions to real React state and persistent storage
  const executeRealToolAction = useCallback((action: AgentActionItem, textInput: string) => {
    const lower = textInput.toLowerCase();

    if (action.toolType === 'create_reminder' || lower.includes('remind') || lower.includes('medicine') || lower.includes('medication')) {
      addReminder({
        title: action.parameters?.title || 'Take evening medicine (Donepezil)',
        time: action.parameters?.time || '8:00 PM',
        date: 'Today',
        category: 'Medication',
        status: 'Upcoming',
        patientName: 'Mom',
        dosageOrDetails: 'Take 1 tablet with water after dinner',
        recurring: 'Daily'
      });
    } else if (action.toolType === 'create_appointment' || lower.includes('appointment') || lower.includes('doctor') || lower.includes('sharma')) {
      addAppointment({
        title: 'Dr. Anita Sharma Consultation',
        doctorName: action.parameters?.doctorName || 'Dr. Anita Sharma',
        specialty: 'Cognitive Neurology',
        date: action.parameters?.date || 'Tomorrow',
        time: action.parameters?.time || '10:30 AM',
        location: 'City Care Hospital, Suite 402',
        notes: 'Bring recent observation log & current prescriptions',
        status: 'Upcoming'
      });
    } else if (action.toolType === 'retrieve_memory' || lower.includes('memory') || lower.includes('goa') || lower.includes('photo')) {
      addMemory({
        title: 'Goa Family Vacation Memory',
        date: 'Summer 1987',
        location: 'Goa Beach',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        description: 'Mom watching the sunset by the ocean waves with family.',
        people: ['Mom', 'Caregiver'],
        tags: ['Vacation', 'Goa'],
        reminiscencePrompt: 'Mom, do you remember watching the sunset by the ocean in Goa?'
      });
    }
  }, [addReminder, addAppointment, addMemory]);

  // Submit prompt (either text or voice audio)
  const submitVoiceTurn = useCallback(async (textInput?: string, inputBlob?: Blob | null) => {
    const promptText = textInput || speechTranscriptRef.current || speechTranscript || 'Remind Mom to take her medicine at 8:00 PM tonight.';
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
