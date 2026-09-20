'use client';

export interface SpeechEventData {
  text?: string;
  charIndex?: number;
  totalChars?: number;
  progressPercent?: number;
}

export function dispatchSpeechStart(text: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SpeechEventData>('cognitrace_speech_start', {
      detail: { text }
    })
  );
}

export function dispatchSpeechProgress(charIndex: number, totalChars: number) {
  if (typeof window === 'undefined') return;
  const progressPercent = totalChars > 0 ? Math.min(100, Math.round((charIndex / totalChars) * 100)) : 0;
  window.dispatchEvent(
    new CustomEvent<SpeechEventData>('cognitrace_speech_progress', {
      detail: { charIndex, totalChars, progressPercent }
    })
  );
}

export function dispatchSpeechPause() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cognitrace_speech_pause'));
}

export function dispatchSpeechResume() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cognitrace_speech_resume'));
}

export function dispatchSpeechEnd() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cognitrace_speech_end'));
}

export function pauseSpeechPlayback() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.pause();
    dispatchSpeechPause();
  }
}

export function resumeSpeechPlayback() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.resume();
    dispatchSpeechResume();
  }
}

export function stopSpeechPlayback() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    dispatchSpeechEnd();
  }
}
