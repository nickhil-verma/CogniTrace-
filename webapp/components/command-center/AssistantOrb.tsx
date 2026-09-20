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
          solidBg: 'bg-[#164E48]',
          glowColor: 'bg-[#E8F4F1]',
        };
      case 'PROCESSING':
        return {
          label: t('commandCenter.orbReasoning') || 'Reasoning & Slot Filling...',
          sublabel: t('commandCenter.orbReasoningSub') || 'Analyzing intent and patient schedule',
          icon: <Cpu className="w-8 h-8 text-[#E8F4F1] animate-spin" />,
          solidBg: 'bg-[#164E48]',
          glowColor: 'bg-[#E8F4F1]/60',
        };
      case 'EXECUTING':
        return {
          label: t('commandCenter.orbExecuting') || 'Executing Care Action...',
          sublabel: t('commandCenter.orbExecutingSub') || 'Updating care schedule and state',
          icon: <CheckCircle2 className="w-8 h-8 text-white" />,
          solidBg: 'bg-[#164E48]',
          glowColor: 'bg-[#E8F4F1]',
        };
      case 'SPEAKING':
        return {
          label: t('commandCenter.orbSpeaking') || 'AI Assistant Speaking...',
          sublabel: t('commandCenter.orbSpeakingSub') || 'Tap orb anytime to interrupt (Barge-In)',
          icon: <Volume2 className="w-8 h-8 text-white" />,
          solidBg: 'bg-[#164E48]',
          glowColor: 'bg-[#E8F4F1]/70',
        };
      case 'ERROR':
        return {
          label: t('commandCenter.orbError') || 'Connection Interrupted',
          sublabel: t('commandCenter.orbErrorSub') || 'Tap orb to try again',
          icon: <AlertCircle className="w-8 h-8 text-white" />,
          solidBg: 'bg-[#164E48]',
          glowColor: 'bg-[#E8F4F1]/30',
        };
      case 'IDLE':
      default:
        return {
          label: t('commandCenter.orbIdle') || 'Tap Assistant Orb to Speak',
          sublabel: t('commandCenter.orbIdleSub') || '"Remind me..." or "Show my family photos"',
          icon: <Mic className="w-8 h-8 text-white" />,
          solidBg: 'bg-[#164E48]',
          glowColor: 'bg-[#E8F4F1]/40',
        };
    }
  };

  const content = getOrbStateContent();

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 py-6 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outermost Soft Mint Ambient Halo (Solid mint opacity blur, NO neon, NO gradient) */}
        <motion.div
          animate={{
            scale: currentState === 'LISTENING' ? [1.2, 1.4 + volumeLevel / 80, 1.2] : (currentState === 'SPEAKING' ? [1.15, 1.3, 1.15] : [1, 1.08, 1]),
            opacity: currentState === 'LISTENING' ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
          }}
          transition={{
            scale: { duration: currentState === 'LISTENING' ? 0.8 : 2.5, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`absolute w-60 h-60 rounded-full ${content.glowColor} blur-2xl pointer-events-none`}
        />

        {/* Secondary Soft Ambient Ring (NO gradient, solid mint tint blur) */}
        <motion.div
          animate={{
            scale: currentState === 'LISTENING' ? [1, 1.2, 1] : [1, 1.05, 1],
          }}
          transition={{
            duration: currentState === 'PROCESSING' ? 1.5 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-48 h-48 rounded-full bg-[#E8F4F1]/40 blur-xl pointer-events-none"
        />

        {/* Dynamic Ripple Ring for Listening & Speaking */}
        {(currentState === 'LISTENING' || currentState === 'SPEAKING') && (
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.6, 0.1, 0.6],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-44 h-44 rounded-full border-2 border-[#164E48]/30 pointer-events-none"
          />
        )}

        {/* Primary Interactive Siri Assistant Orb Container (Solid Deep Forest Teal, NO gradient, NO neon) */}
        <motion.div
          animate={{
            scale: currentState === 'IDLE' ? [0.96, 1.02, 0.96] : (currentState === 'LISTENING' ? [1, 1.08, 1] : [1, 1.04, 1]),
          }}
          transition={{
            duration: currentState === 'LISTENING' ? 1 : 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-36 h-36 rounded-full p-1 bg-[#164E48] border-2 border-white/40 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300"
          onClick={onClick}
          role="button"
          aria-label={content.label}
        >
          {/* Solid Deep Forest Teal Lens Core */}
          <div className="w-full h-full rounded-full bg-[#164E48] p-1 relative overflow-hidden flex items-center justify-center shadow-inner">
            {/* Inner Refraction Lens */}
            <div className="absolute inset-1 rounded-full bg-[#164E48] border border-white/20 flex items-center justify-center overflow-hidden">
              
              {/* Waveform for Speaking State */}
              {currentState === 'SPEAKING' && (
                <div className="absolute inset-0 flex items-center justify-center space-x-1 opacity-40 pointer-events-none">
                  {[45, 80, 35, 95, 60, 85, 45].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['25%', `${h}%`, '25%'] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                      className="w-1.5 bg-[#E8F4F1] rounded-full"
                    />
                  ))}
                </div>
              )}

              {/* Pulsing Luminous Core Button */}
              <div className="z-10 flex flex-col items-center justify-center space-y-1">
                <div className="p-3 rounded-full bg-white/10 border border-white/20 shadow-md backdrop-blur-sm">
                  {content.icon}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Live Assistant Status & Typography */}
      <div className="text-center space-y-1.5 max-w-md px-4">
        <div className="inline-flex items-center space-x-1.5 bg-[#164E48]/10 border border-[#164E48]/20 px-3 py-1 rounded-full text-xs font-bold text-[#164E48]">
          <Sparkles className="w-3.5 h-3.5 text-[#164E48]" />
          <span>{content.label}</span>
        </div>
        <p className="text-xs font-semibold text-[#66736F] leading-relaxed">
          {content.sublabel}
        </p>
      </div>
    </div>
  );
}
