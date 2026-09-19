'use client';

import { useState, useRef, useCallback } from 'react';
import { useLanguage } from './useLanguage';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');

  const { currentLangObj } = useLanguage();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const speechTranscriptRef = useRef<string>('');
  const stopResolveRef = useRef<((val: { audioBlob: Blob | null; speechTranscript: string }) => void) | null>(null);

  const startRecording = useCallback(async () => {
    setPermissionError(null);
    audioChunksRef.current = [];
    setAudioBlob(null);
    speechTranscriptRef.current = '';
    setSpeechTranscript('');

    const targetLangCode = currentLangObj?.speechLang || 'en-US';

    // 1. Initialize Web Speech API Live Recognition if supported in browser
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = targetLangCode;

          rec.onresult = (event: any) => {
            let currentText = '';
            for (let i = 0; i < event.results.length; i++) {
              currentText += event.results[i][0].transcript;
            }
            const cleanText = currentText.trim();
            speechTranscriptRef.current = cleanText;
            setSpeechTranscript(cleanText);
          };

          rec.onerror = (err: any) => {
            console.warn('SpeechRecognition error:', err);
          };

          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.warn('SpeechRecognition initialization warning:', e);
        }
      }
    }

    // 2. Initialize MediaRecorder audio stream & volume analyzer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalBlob = audioChunksRef.current.length > 0
          ? new Blob(audioChunksRef.current, { type: 'audio/wav' })
          : null;
        
        setAudioBlob(finalBlob);
        setIsRecording(false);
        setVolumeLevel(0);

        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }

        const capturedTranscript = speechTranscriptRef.current || speechTranscript;
        if (stopResolveRef.current) {
          stopResolveRef.current({ audioBlob: finalBlob, speechTranscript: capturedTranscript });
          stopResolveRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.warn('Microphone access refused or unavailable:', err);
      setPermissionError('Microphone access needed for voice commands. You can also type commands below.');
      setIsRecording(false);
    }
  }, [currentLangObj, speechTranscript]);

  const stopRecording = useCallback((): Promise<{ audioBlob: Blob | null; speechTranscript: string }> => {
    return new Promise((resolve) => {
      stopResolveRef.current = resolve;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else {
        const capturedTranscript = speechTranscriptRef.current || speechTranscript;
        resolve({ audioBlob: null, speechTranscript: capturedTranscript });
      }
    });
  }, [speechTranscript]);

  return {
    isRecording,
    audioBlob,
    volumeLevel,
    permissionError,
    speechTranscript,
    speechTranscriptRef,
    startRecording,
    stopRecording
  };
}
