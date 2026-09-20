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

  // Icon & State Configuration
  const getStateConfig = () => {
    switch (state) {
      case 'listening':
        return {
          icon: <Mic className={`${dims.icon} text-[#FFFFFF] animate-pulse`} />,
          meshGradient: 'from-[#164E48] via-[#0D6E63] to-[#10B981]',
          auraBg: 'bg-[#E8F4F1]',
          glowOpacity: 0.8,
          pulseDuration: 0.9,
          scaleRange: [1, 1.15 + normalizedAudio * 0.25, 1],
        };
      case 'processing':
        return {
          icon: <Cpu className={`${dims.icon} text-[#C8ECE4] animate-spin`} />,
          meshGradient: 'from-[#0D6E63] via-[#164E48] to-[#C8ECE4]',
          auraBg: 'bg-[#10B981]',
          glowOpacity: 0.7,
          pulseDuration: 1.2,
          scaleRange: [1, 1.1, 1],
        };
      case 'speaking':
        return {
          icon: <Volume2 className={`${dims.icon} text-[#FFFFFF]`} />,
          meshGradient: 'from-[#10B981] via-[#0D6E63] to-[#164E48]',
          auraBg: 'bg-[#C8ECE4]',
          glowOpacity: 0.85,
          pulseDuration: 0.7,
          scaleRange: [1, 1.2 + normalizedAudio * 0.2, 1],
        };
      case 'idle':
      default:
        return {
          icon: <Sparkles className={`${dims.icon} text-[#FFFFFF]`} />,
          meshGradient: 'from-[#164E48] via-[#0D6E63] to-[#10B981]',
          auraBg: 'bg-[#E8F4F1]',
          glowOpacity: 0.45,
          pulseDuration: 2.8,
          scaleRange: [0.98, 1.05, 0.98],
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
      {/* LAYER 1 (Outer Aura): Expansive, soft-diffuse blur in #E8F4F1 & #164E48/20 */}
      {showGlow && (
        <motion.div
          className={`absolute ${dims.outerAura} rounded-full ${config.auraBg} blur-2xl pointer-events-none -z-10`}
          animate={{
            scale: config.scaleRange,
            opacity: [config.glowOpacity * 0.6, config.glowOpacity, config.glowOpacity * 0.6],
          }}
          transition={{
            duration: config.pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            boxShadow: '0 0 40px rgba(22, 78, 72, 0.2)',
          }}
        />
      )}

      {/* LAYER 2 (Middle Mesh): Smooth rotating radial gradient blending #164E48, #0D6E63, and #10B981 */}
      <motion.div
        className={`relative ${dims.container} rounded-full p-1 shadow-2xl flex items-center justify-center overflow-hidden border-2 border-white/60 bg-gradient-to-tr ${config.meshGradient}`}
        animate={{
          rotate: state === 'processing' ? [0, 360] : [0, 180, 360],
          scale: state === 'listening' ? [1, 1.08 + normalizedAudio * 0.15, 1] : [1, 1.03, 1],
        }}
        transition={{
          rotate: { duration: state === 'processing' ? 2 : 12, repeat: Infinity, ease: 'linear' },
          scale: { duration: config.pulseDuration, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        {/* Swirling Inner Luminous Mesh Ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#10B981]/40 via-transparent to-[#164E48]/60 blur-xs"
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* LAYER 3 (Inner Core): High-luminance pulse node in #FFFFFF / #C8ECE4 with glassmorphism */}
        <div className="relative w-full h-full rounded-full bg-[#164E48]/80 backdrop-blur-md border border-white/40 shadow-inner flex items-center justify-center transition-transform group-hover:scale-105">
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-tr from-[#164E48] via-[#0D6E63] to-[#10B981] flex items-center justify-center"
            animate={{
              scale: [0.95, 1, 0.95],
            }}
            transition={{
              duration: config.pulseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {config.icon}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
