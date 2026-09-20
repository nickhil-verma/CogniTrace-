'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { VoiceState } from '@/types/agent';
import { Mic, Volume2, Cpu, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface AssistantOrbProps {
  status?: VoiceState | 'idle' | 'listening' | 'processing' | 'speaking' | 'executing' | 'error';
  state?: VoiceState;
  volumeLevel?: number;
  onClick?: () => void;
  transcript?: string;
  response?: string;
  className?: string;
}

export function AssistantOrb({
  status,
  state,
  volumeLevel = 0,
  onClick,
  transcript,
  response,
  className = ''
}: AssistantOrbProps) {
  const { t } = useLanguage();

  // Normalize status state
  const currentState: string = (status || state || 'IDLE').toString().toUpperCase();

  const getOrbStateContent = () => {
    switch (currentState) {
      case 'LISTENING':
        return {
          label: t('commandCenter.orbListening') || 'Listening to your voice...',
          sublabel: t('commandCenter.orbListeningSub') || 'Speak your command naturally',
          icon: <Mic className="w-8 h-8 text-white animate-pulse" />,
          meshGradient: 'from-cyan-400 via-blue-500 via-purple-600 to-pink-500',
          glowColor: 'bg-cyan-500/40',
        };
      case 'PROCESSING':
        return {
          label: t('commandCenter.orbReasoning') || 'Reasoning & Slot Filling...',
          sublabel: t('commandCenter.orbReasoningSub') || 'Analyzing intent and patient schedule',
          icon: <Cpu className="w-8 h-8 text-white animate-spin" />,
          meshGradient: 'from-amber-400 via-[#E36C59] via-purple-600 to-indigo-600',
          glowColor: 'bg-amber-500/40',
        };
      case 'EXECUTING':
        return {
          label: t('commandCenter.orbExecuting') || 'Executing Care Action...',
          sublabel: t('commandCenter.orbExecutingSub') || 'Updating care schedule and state',
          icon: <CheckCircle2 className="w-8 h-8 text-white" />,
          meshGradient: 'from-emerald-400 via-teal-500 to-cyan-500',
          glowColor: 'bg-emerald-500/40',
        };
      case 'SPEAKING':
        return {
          label: t('commandCenter.orbSpeaking') || 'AI Assistant Speaking...',
          sublabel: t('commandCenter.orbSpeakingSub') || 'Tap orb anytime to interrupt (Barge-In)',
          icon: <Volume2 className="w-8 h-8 text-white" />,
          meshGradient: 'from-pink-500 via-purple-600 via-indigo-500 to-cyan-400',
          glowColor: 'bg-purple-500/40',
        };
      case 'ERROR':
        return {
          label: t('commandCenter.orbError') || 'Connection Interrupted',
          sublabel: t('commandCenter.orbErrorSub') || 'Tap orb to try again',
          icon: <AlertCircle className="w-8 h-8 text-white" />,
          meshGradient: 'from-rose-500 via-amber-500 to-red-600',
          glowColor: 'bg-rose-500/40',
        };
      case 'IDLE':
      default:
        return {
          label: t('commandCenter.orbIdle') || 'Tap Assistant Orb to Speak',
          sublabel: t('commandCenter.orbIdleSub') || '"Remind me..." or "Show my family photos"',
          icon: <Mic className="w-8 h-8 text-white" />,
          meshGradient: 'from-blue-600 via-indigo-600 via-purple-600 to-pink-500',
          glowColor: 'bg-indigo-500/30',
        };
    }
  };

  const content = getOrbStateContent();

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 py-6 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outermost Concentric Soft-Glow Ambient Halo (blur-2xl) */}
        <motion.div
          animate={{
            scale: currentState === 'LISTENING' ? [1.2, 1.45 + volumeLevel / 80, 1.2] : (currentState === 'SPEAKING' ? [1.15, 1.35, 1.15] : [1, 1.1, 1]),
            opacity: currentState === 'LISTENING' ? [0.6, 0.9, 0.6] : [0.4, 0.7, 0.4],
            rotate: [0, 180, 360],
          }}
          transition={{
            scale: { duration: currentState === 'LISTENING' ? 0.8 : 2.5, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: currentState === 'PROCESSING' ? 4 : 12, repeat: Infinity, ease: 'linear' },
          }}
          className={`absolute w-60 h-60 rounded-full ${content.glowColor} blur-2xl pointer-events-none`}
        />

        {/* Inner Soft-Glow Layer (blur-xl) with Multi-Color Swirling Radial Mesh */}
        <motion.div
          animate={{
            scale: currentState === 'LISTENING' ? [1, 1.25, 1] : [1, 1.1, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: currentState === 'PROCESSING' ? 3 : 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 opacity-60 blur-xl pointer-events-none"
        />

        {/* Dynamic Waveform Ripple Rings for Listening & Speaking */}
        {(currentState === 'LISTENING' || currentState === 'SPEAKING') && (
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 0.1, 0.7],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-44 h-44 rounded-full border-2 border-cyan-300/40 pointer-events-none"
          />
        )}

        {/* Primary Interactive Siri Assistant Orb Container */}
        <motion.div
          animate={{
            scale: currentState === 'IDLE' ? [0.96, 1.02, 0.96] : (currentState === 'LISTENING' ? [1, 1.08, 1] : [1, 1.04, 1]),
          }}
          transition={{
            duration: currentState === 'LISTENING' ? 1 : 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-36 h-36 rounded-full p-[3px] bg-gradient-to-tr from-cyan-400 via-purple-500 via-pink-500 to-amber-400 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300"
          onClick={onClick}
          role="button"
          aria-label={content.label}
        >
          {/* Glowing Swirling Mesh Gradient Core */}
          <div className={`w-full h-full rounded-full bg-gradient-to-tr ${content.meshGradient} p-1 relative overflow-hidden flex items-center justify-center shadow-inner`}>
            {/* Glassmorphic Inner Refraction Lens */}
            <div className="absolute inset-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden">
              
              {/* Rhythmic Oscillating Waveform for Speaking State */}
              {currentState === 'SPEAKING' && (
                <div className="absolute inset-0 flex items-center justify-center space-x-1 opacity-40 pointer-events-none">
                  {[45, 80, 35, 95, 60, 85, 45].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['25%', `${h}%`, '25%'] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                      className="w-1.5 bg-cyan-300 rounded-full"
                    />
                  ))}
                </div>
              )}

              {/* Pulsing Luminous Core Button */}
              <div className="z-10 flex flex-col items-center justify-center space-y-1">
                <div className="p-3 rounded-full bg-white/20 border border-white/30 shadow-md backdrop-blur-sm">
                  {content.icon}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Live Assistant Status & Typography */}
      <div className="text-center space-y-1.5 max-w-md px-4">
        <div className="inline-flex items-center space-x-1.5 bg-[#17665B]/10 border border-[#17665B]/20 px-3 py-1 rounded-full text-xs font-bold text-[#17665B]">
          <Sparkles className="w-3.5 h-3.5 text-[#17665B]" />
          <span>{content.label}</span>
        </div>
        <p className="text-xs font-semibold text-[#66736F] leading-relaxed">
          {content.sublabel}
        </p>
      </div>
    </div>
  );
}
