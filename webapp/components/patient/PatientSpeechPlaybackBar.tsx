'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Pause, Play, Square, X, Sparkles } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import {
  SpeechEventData,
  pauseSpeechPlayback,
  resumeSpeechPlayback,
  stopSpeechPlayback
} from '@/lib/speechManager';

export function PatientSpeechPlaybackBar() {
  const { isPatient } = useUserRole();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const handleStart = (e: Event) => {
      const detail = (e as CustomEvent<SpeechEventData>).detail;
      setIsSpeaking(true);
      setIsPaused(false);
      setSpeechText(detail?.text || 'Agent Speaking...');
      setProgressPercent(0);
    };

    const handleProgress = (e: Event) => {
      const detail = (e as CustomEvent<SpeechEventData>).detail;
      if (detail && detail.progressPercent !== undefined) {
        setProgressPercent(detail.progressPercent);
      }
    };

    const handlePause = () => {
      setIsPaused(true);
    };

    const handleResume = () => {
      setIsPaused(false);
    };

    const handleEnd = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgressPercent(100);
    };

    window.addEventListener('cognitrace_speech_start', handleStart);
    window.addEventListener('cognitrace_speech_progress', handleProgress);
    window.addEventListener('cognitrace_speech_pause', handlePause);
    window.addEventListener('cognitrace_speech_resume', handleResume);
    window.addEventListener('cognitrace_speech_end', handleEnd);

    return () => {
      window.removeEventListener('cognitrace_speech_start', handleStart);
      window.removeEventListener('cognitrace_speech_progress', handleProgress);
      window.removeEventListener('cognitrace_speech_pause', handlePause);
      window.removeEventListener('cognitrace_speech_resume', handleResume);
      window.removeEventListener('cognitrace_speech_end', handleEnd);
    };
  }, []);

  // Display whenever active speech synthesis is speaking
  if (!isSpeaking) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -25 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#164E48] via-[#17665B] to-[#123B35] text-white shadow-xl border-b-2 border-white/20 px-4 py-3"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Agent Soundwave & Live Utterance Snippet */}
          <div className="flex items-center space-x-3 w-full md:w-auto min-w-0">
            {/* Animated Soundwave / Pause icon */}
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              {isPaused ? (
                <Pause className="w-5 h-5 text-amber-300" />
              ) : (
                <div className="flex items-end space-x-1 h-5">
                  {[40, 90, 60, 100, 50].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['30%', `${h}%`, '30%'] }}
                      transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.08 }}
                      className="w-1 bg-emerald-300 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {isPaused ? 'Voice Companion Paused' : 'Voice Companion Speaking'}
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {progressPercent}% spoken
                </span>
              </div>
              <p className="text-xs font-semibold text-white/95 truncate max-w-md md:max-w-xl">
                &ldquo;{speechText}&rdquo;
              </p>
            </div>
          </div>

          {/* Middle: Progress Bar */}
          <div className="w-full md:w-64 space-y-1">
            <div className="w-full h-2.5 rounded-full bg-black/30 overflow-hidden p-0.5 border border-white/20">
              <motion.div
                className={`h-full rounded-full transition-all duration-150 ${
                  isPaused ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-400 to-teal-200'
                }`}
                style={{ width: `${Math.max(3, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Right: Interactive Pause / Play / Stop Control Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {isPaused ? (
              <button
                type="button"
                onClick={resumeSpeechPlayback}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                title="Resume reading"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Playback</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseSpeechPlayback}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                title="Pause reading"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Voice</span>
              </button>
            )}

            <button
              type="button"
              onClick={stopSpeechPlayback}
              className="p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs transition-colors flex items-center justify-center shadow-md active:scale-95 cursor-pointer"
              title="Stop voice"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
