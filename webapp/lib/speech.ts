'use client';

import {
  dispatchSpeechStart,
  dispatchSpeechProgress,
  dispatchSpeechEnd
} from './speechManager';

export function speakText(text: string, lang: string = 'en-US') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Calm, reassuring pace for senior patient access
    utterance.pitch = 1.0;

    const totalChars = text.length;
    let fallbackTimer: any = null;
    let currentChar = 0;

    utterance.onstart = () => {
      dispatchSpeechStart(text);
      // Fallback timer estimating speech progress if boundary events are slow
      const estimatedMs = Math.max(2000, (totalChars / 12) * 1000);
      const stepIntervalMs = Math.max(100, estimatedMs / 50);
      const increment = Math.max(1, Math.ceil(totalChars / 50));

      fallbackTimer = setInterval(() => {
        if (window.speechSynthesis.paused) return;
        currentChar = Math.min(totalChars, currentChar + increment);
        dispatchSpeechProgress(currentChar, totalChars);
        if (currentChar >= totalChars && fallbackTimer) {
          clearInterval(fallbackTimer);
        }
      }, stepIntervalMs);
    };

    utterance.onboundary = (event) => {
      if (event.charIndex !== undefined) {
        currentChar = Math.max(currentChar, event.charIndex);
        dispatchSpeechProgress(currentChar, totalChars);
      }
    };

    utterance.onend = () => {
      if (fallbackTimer) clearInterval(fallbackTimer);
      dispatchSpeechProgress(totalChars, totalChars);
      dispatchSpeechEnd();
    };

    utterance.onerror = () => {
      if (fallbackTimer) clearInterval(fallbackTimer);
      dispatchSpeechEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Text-to-Speech Error:', e);
  }
}
