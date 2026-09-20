'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Volume2, Cpu, Sparkles } from 'lucide-react';

export type OrbState = 'idle' | 'listening' | 'processing' | 'speaking';
export type OrbSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AssistantOrbProps {
  state?: OrbState;
  size?: OrbSize; // sm (48px), md (80px), lg (128px), xl (160px+)
  onClick?: () => void;
  audioLevel?: number; // 0.0 to 1.0 for voice-responsive scaling
  className?: string;
  showGlow?: boolean;
  ariaLabel?: string;
}

const sizeConfig: Record<OrbSize, { container: string; outerAura: string; icon: string }> = {
  sm: {
    container: 'w-12 h-12',
    outerAura: 'w-16 h-16',
    icon: 'w-5 h-5',
  },
  md: {
    container: 'w-20 h-20',
    outerAura: 'w-28 h-28',
    icon: 'w-8 h-8',
  },
  lg: {
    container: 'w-32 h-32',
    outerAura: 'w-44 h-44',
    icon: 'w-12 h-12',
  },
  xl: {
    container: 'w-40 h-40',
    outerAura: 'w-56 h-56',
    icon: 'w-16 h-16',
  },
};

export function AssistantOrb({
  state = 'idle',
  size = 'md',
  onClick,
  audioLevel = 0,
  className = '',
  showGlow = true,
  ariaLabel = 'Voice Assistant Orb',
}: AssistantOrbProps) {
  const normalizedAudio = Math.min(Math.max(audioLevel, 0), 1);
  const dims = sizeConfig[size] || sizeConfig.md;

  const getStateConfig = () => {
    switch (state) {
      case 'listening':
        return {
          icon: <Mic className={`${dims.icon} text-white animate-pulse`} />,
          solidBg: 'bg-[#164E48]',
          auraBg: 'bg-[#E8F4F1]',
          borderColor: 'border-[#164E48]',
          glowOpacity: 0.5,
          pulseDuration: 0.9,
          scaleRange: [1, 1.15 + normalizedAudio * 0.25, 1],
        };
      case 'processing':
        return {
          icon: <Cpu className={`${dims.icon} text-[#E8F4F1] animate-spin`} />,
          solidBg: 'bg-[#164E48]',
          auraBg: 'bg-[#E8F4F1]',
          borderColor: 'border-[#164E48]/80',
          glowOpacity: 0.4,
          pulseDuration: 1.2,
          scaleRange: [1, 1.1, 1],
        };
      case 'speaking':
        return {
          icon: <Volume2 className={`${dims.icon} text-white`} />,
          solidBg: 'bg-[#164E48]',
          auraBg: 'bg-[#E8F4F1]',
          borderColor: 'border-[#164E48]',
          glowOpacity: 0.6,
          pulseDuration: 0.7,
          scaleRange: [1, 1.2 + normalizedAudio * 0.2, 1],
        };
      case 'idle':
      default:
        return {
          icon: <Sparkles className={`${dims.icon} text-white`} />,
          solidBg: 'bg-[#164E48]',
          auraBg: 'bg-[#E8F4F1]',
          borderColor: 'border-[#164E48]/40',
          glowOpacity: 0.3,
          pulseDuration: 2.8,
          scaleRange: [0.98, 1.04, 0.98],
        };
    }
  };

  const config = getStateConfig();

  return (
    <div
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none group ${className}`}
    >
      {/* LAYER 1: Soft Ambient Mint Aura (No neon, no multi-color gradient) */}
      {showGlow && (
        <motion.div
          className={`absolute ${dims.outerAura} rounded-full ${config.auraBg} blur-xl pointer-events-none -z-10`}
          animate={{
            scale: config.scaleRange,
            opacity: [config.glowOpacity * 0.5, config.glowOpacity, config.glowOpacity * 0.5],
          }}
          transition={{
            duration: config.pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* LAYER 2: Solid Deep Forest Teal Core (No gradient, crisp border) */}
      <motion.div
        className={`relative ${dims.container} rounded-full flex items-center justify-center shadow-lg border-2 ${config.borderColor} ${config.solidBg}`}
        animate={{
          scale: state === 'listening' ? [1, 1.08 + normalizedAudio * 0.15, 1] : [1, 1.03, 1],
        }}
        transition={{
          duration: config.pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Subtle Inner Ring Accent */}
        <div className="w-[85%] h-[85%] rounded-full border border-white/20 flex items-center justify-center bg-[#164E48] transition-transform group-hover:scale-105">
          {config.icon}
        </div>
      </motion.div>
    </div>
  );
}
