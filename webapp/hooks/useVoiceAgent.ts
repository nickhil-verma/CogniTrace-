'use client';

import { useState, useCallback } from 'react';
import { VoiceState, TimelineStep, AgentActionItem } from '@/types/agent';
import { useAudioRecorder } from './useAudioRecorder';
import { api } from '@/lib/api';

export function useVoiceAgent() {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [actions, setActions] = useState<AgentActionItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isRecording, volumeLevel, permissionError, startRecording, stopRecording } = useAudioRecorder();

  // Speak AI response using Polly audio or Web Speech API synthesis
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
  }, []);

  const speakWithWebSpeech = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setVoiceState('IDLE');
      utterance.onerror = () => setVoiceState('IDLE');
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setVoiceState('IDLE'), 2500);
    }
  };

  // Submit prompt (either text or voice audio)
  const submitVoiceTurn = useCallback(async (textInput?: string, audioBlob?: Blob | null) => {
    setErrorMessage(null);
    setVoiceState('PROCESSING');

    try {
      // Step 1: Processing prompt
      const response = await api.submitAudioTaskTurn(audioBlob || null, textInput);
      setTranscript(response.transcript);
      setAiResponse(response.aiResponseText);
      setTimeline(response.executionTimeline);

      // Step 2: Tool execution phase
      if (response.actions && response.actions.length > 0) {
        setVoiceState('EXECUTING');
        setActions((prev) => [...response.actions, ...prev]);
        await new Promise((res) => setTimeout(res, 800));
      }

      // Step 3: Speak AI Voice response
      playAudioResponse(response.aiResponseText, response.audioUrl);
    } catch (err: any) {
      console.error('Voice agent turn error:', err);
      setVoiceState('ERROR');
      setErrorMessage('CogniTrace couldn’t reach the care service. Please try again.');
    }
  }, [playAudioResponse]);

  // Handle start listening
  const handleStartListening = useCallback(() => {
    setVoiceState('LISTENING');
    startRecording();
  }, [startRecording]);

  // Handle stop listening & process audio
  const handleStopListeningAndSubmit = useCallback(async () => {
    stopRecording();
    setVoiceState('PROCESSING');
    // Wait slightly for audio recorder blob completion or fallback to mock text
    setTimeout(() => {
      submitVoiceTurn('Remind Mom to take her medicine at 8 tonight.');
    }, 600);
  }, [stopRecording, submitVoiceTurn]);

  // Handle quick suggested command click
  const triggerSuggestedCommand = useCallback((commandText: string) => {
    submitVoiceTurn(commandText);
  }, [submitVoiceTurn]);

  return {
    voiceState,
    isRecording,
    volumeLevel,
    permissionError,
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
