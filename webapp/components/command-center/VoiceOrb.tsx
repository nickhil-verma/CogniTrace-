'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { VoiceState } from '@/types/agent';
import { Mic, Volume2, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

interface VoiceOrbProps {
  state: VoiceState;
  volumeLevel?: number;
  onClick?: () => void;
}

export function VoiceOrb({ state, volumeLevel = 0, onClick }: VoiceOrbProps) {
  // Orb dynamic styling & Framer Motion variants
  const getOrbStateContent = () => {
    switch (state) {
      case 'LISTENING':
        return {
          label: 'Listening...',
          sublabel: 'Speak naturally to CogniTrace',
          icon: <Mic className="w-8 h-8 text-white animate-pulse" />,
          color: 'from-[#17665B] to-[#3E9C87]',
        };
      case 'PROCESSING':
        return {
          label: 'Reasoning...',
          sublabel: 'Understanding intent & checking care logs',
          icon: <Cpu className="w-8 h-8 text-white animate-spin" />,
          color: 'from-[#17665B] to-[#BFDCD6]',
        };
      case 'EXECUTING':
        return {
          label: 'Executing action...',
          sublabel: 'Updating schedule & care records',
          icon: <CheckCircle2 className="w-8 h-8 text-white" />,
          color: 'from-[#3E9C87] to-[#17665B]',
        };
      case 'SPEAKING':
        return {
          label: 'CogniTrace responding...',
          sublabel: 'Voice feedback active',
          icon: <Volume2 className="w-8 h-8 text-white" />,
          color: 'from-[#17665B] to-[#C85C82]',
        };
      case 'ERROR':
        return {
          label: 'Tap to try again',
          sublabel: 'Couldn’t process request',
          icon: <AlertCircle className="w-8 h-8 text-white" />,
          color: 'from-[#C85C82] to-[#E7A23B]',
        };
      case 'IDLE':
      default:
        return {
          label: 'Tap to speak',
          sublabel: '"Remind Mom to take her medicine at 8 tonight"',
          icon: <Mic className="w-8 h-8 text-[#123B35]" />,
          color: 'from-[#BFDCD6] to-[#F7DDE5]',
        };
    }
  };

  const content = getOrbStateContent();

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-6 select-none">
      <div className="relative flex items-center justify-center">
        {/* Concentric Expanding Ring 1 for Listening State */}
        {state === 'LISTENING' && (
          <motion.div
            animate={{
              scale: [1, 1.4 + volumeLevel / 100, 1],
              opacity: [0.6, 0.1, 0.6],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-56 h-56 rounded-full bg-[#BFDCD6]/40 blur-sm pointer-events-none"
          />
        )}

        {/* Concentric Expanding Ring 2 */}
        {(state === 'LISTENING' || state === 'SPEAKING') && (
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-44 h-44 rounded-full bg-[#17665B]/20 pointer-events-none"
          />
        )}

        {/* Outer Breathing Halo */}
        <motion.div
          animate={{
            scale: state === 'IDLE' ? [1, 1.05, 1] : [1, 1.1, 1],
            rotate: state === 'PROCESSING' ? [0, 180, 360] : 0,
          }}
          transition={{
            duration: state === 'PROCESSING' ? 4 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`w-36 h-36 rounded-full bg-gradient-to-tr ${content.color} p-1 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95`}
          onClick={onClick}
          role="button"
          aria-label={content.label}
        >
          {/* Inner Interactive Core */}
          <div className="w-full h-full rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-inner relative overflow-hidden">
            {/* Waveform graphic for Speaking state */}
            {state === 'SPEAKING' && (
              <div className="absolute inset-0 flex items-center justify-center space-x-1 opacity-20">
                {[40, 70, 30, 90, 50, 80, 40].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ['20%', `${h}%`, '20%'] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 bg-[#17665B] rounded-full"
                  />
                ))}
              </div>
            )}

            <div className="z-10 flex flex-col items-center justify-center">
              <div
                className={`p-3 rounded-full ${
                  state === 'IDLE' ? 'bg-[#BFDCD6]/40' : 'bg-[#17665B]'
                }`}
              >
                {content.icon}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Voice Status Text */}
      <div className="text-center space-y-1 max-w-sm px-4">
        <h3 className="text-xl font-bold text-[#123B35] tracking-tight">
          {content.label}
        </h3>
        <p className="text-sm text-[#66736F] leading-relaxed">
          {content.sublabel}
        </p>
      </div>
    </div>
  );
}
