'use client';

import { useState, useCallback, useRef } from 'react';
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
  const [activeModalAction, setActiveModalAction] = useState<AgentActionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Multi-turn slot filling & conversation history tracking
  const [pendingState, setPendingState] = useState<Record<string, any> | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const pendingStateRef = useRef<Record<string, any> | null>(null);
  const conversationHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const { currentLangObj } = useLanguage();

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

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

  const { addReminder, reminders, toggleComplete } = useReminders();
  const { addAppointment } = useAppointments();
  const { addMemory } = useMemories();

  // Barge-In helper: immediately halt ongoing synthesis
  const cancelSynthesis = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Speak AI response using Web Speech API synthesis
  const speakWithWebSpeech = useCallback((text: string, onEnded?: () => void) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = currentLangObj?.speechLang || 'en-US';
      utterance.onend = () => {
        setVoiceState('IDLE');
        if (onEnded) onEnded();
      };
      utterance.onerror = () => {
        setVoiceState('IDLE');
        if (onEnded) onEnded();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setVoiceState('IDLE');
        if (onEnded) onEnded();
      }, 2500);
    }
  }, [currentLangObj]);

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

  // Handle start listening with immediate barge-in cancellation
  const handleStartListening = useCallback(() => {
    cancelSynthesis();
    setVoiceState('LISTENING');
    startRecording();
  }, [cancelSynthesis, startRecording]);

  // Submit prompt (either text or voice audio) to backend conversational chat endpoint
  const submitVoiceTurn = useCallback(async (textInput?: string, inputBlob?: Blob | null) => {
    cancelSynthesis();

    const promptText = textInput || speechTranscriptRef.current || speechTranscript || 'What should I do next?';

    setErrorMessage(null);
    setVoiceState('PROCESSING');
    setTranscript(promptText);

    // Determine current user role
    let userRole: 'PATIENT' | 'CAREGIVER' = 'CAREGIVER';
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('cognitrace_user_role');
      if (storedRole === 'patient') userRole = 'PATIENT';
    }

    try {
      // Step 1: Execute stateful chat turn via FastAPI endpoint
      const turnResponse = await api.executeVoiceChatTurn({
        transcript: promptText,
        user_role: userRole,
        conversation_history: conversationHistoryRef.current,
        pending_state: pendingStateRef.current,
      });

      const responseText = turnResponse.speech_response;
      const updatedState = turnResponse.updated_state;
      const uiAction = turnResponse.ui_action || {};

      // Update slot state & dialogue memory
      pendingStateRef.current = updatedState;
      setPendingState(updatedState);

      const updatedHistory = [
        ...conversationHistoryRef.current,
        { role: 'user' as const, content: promptText },
        { role: 'assistant' as const, content: responseText },
      ];
      conversationHistoryRef.current = updatedHistory;
      setConversationHistory(updatedHistory);

      setTranscript(promptText);
      setAiResponse(responseText);

      // Step 2: Trigger dynamic verification modal if UI action specified
      if (uiAction.modal_type && uiAction.modal_type !== 'NONE') {
        const modalType = uiAction.modal_type;
        const targetRoute = uiAction.target_route || (modalType === 'MEMORIES_PREVIEW' ? '/memories' : null);

        const modalItem: AgentActionItem = {
          id: `act_${Date.now()}`,
          toolType: modalType === 'VERIFY_COMPLETE' ? 'complete_reminder' : (modalType === 'MEMORIES_PREVIEW' ? 'retrieve_memory' : 'create_reminder'),
          title: modalType === 'VERIFY_COMPLETE' ? 'Task Marked as Completed' : (modalType === 'MEMORIES_PREVIEW' ? 'Family Memory Album' : 'New Reminder Scheduled'),
          description: responseText,
          parameters: uiAction.data || {},
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...( { modalType, targetRoute } as any)
        };

        setActiveModalAction(modalItem);
        setIsModalOpen(true);
        setActions((prev) => [modalItem, ...prev]);
        executeRealToolAction(modalItem, promptText);
      }

      setTimeline((prev) => [
        ...prev,
        {
          id: `step_${Date.now()}`,
          stepName: updatedState?.step ? `Slot Filling: ${updatedState.step}` : 'Conversational Turn',
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          details: responseText,
        }
      ]);

      // Step 3: Speak AI Voice response & handle auto-followup listening if needed
      setVoiceState('SPEAKING');
      speakWithWebSpeech(responseText, () => {
        if (turnResponse.requires_followup) {
          // Auto-re-engage microphone for next turn in slot filling
          setTimeout(() => {
            handleStartListening();
          }, 350);
        } else {
          setVoiceState('IDLE');
        }
      });
    } catch (err: any) {
      console.error('Voice agent turn error:', err);
      setVoiceState('ERROR');
      setErrorMessage('CogniTrace couldn’t reach the care service. Please try again.');
    }
  }, [cancelSynthesis, speechTranscript, speechTranscriptRef, speakWithWebSpeech, executeRealToolAction, handleStartListening]);

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
    activeModalAction,
    isModalOpen,
    closeModal,
    errorMessage,
    pendingState,
    conversationHistory,
    handleStartListening,
    handleStopListeningAndSubmit,
    submitVoiceTurn,
    triggerSuggestedCommand,
    setVoiceState
  };
}

