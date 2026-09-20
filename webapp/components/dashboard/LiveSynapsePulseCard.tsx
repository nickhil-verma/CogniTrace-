'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Activity, Wind, CheckCircle2, BatteryCharging, Zap, RefreshCw, X } from 'lucide-react';

export function LiveSynapsePulseCard({
  caregiverName = 'Priya',
  patientName = 'Sunita'
}: {
  caregiverName?: string;
  patientName?: string;
}) {
  // Breath Pulse Modal / Expansion state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathStage, setBreathStage] = useState<'INHALE' | 'HOLD' | 'EXHALE'>('INHALE');
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [breathCompleted, setBreathCompleted] = useState(false);

  // Dynamic dual-wave pulse frequency
  const [pulseFrequency, setPulseFrequency] = useState(1);

  // 30-Second Guided Breath Cycle (Inhale 4s -> Hold 4s -> Exhale 6s = 14s cycle)
  useEffect(() => {
    let timer: any = null;
    let cycleTimer: any = null;

    if (isBreathing && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsBreathing(false);
            setBreathCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Breath phase state machine
      const runCycle = () => {
        setBreathStage('INHALE');
        setTimeout(() => {
          setBreathStage('HOLD');
          setTimeout(() => {
            setBreathStage('EXHALE');
          }, 4000);
        }, 4000);
      };

      runCycle();
      cycleTimer = setInterval(runCycle, 14000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (cycleTimer) clearInterval(cycleTimer);
    };
  }, [isBreathing, secondsLeft]);

  const startBreathPulse = () => {
    setSecondsLeft(30);
    setBreathCompleted(false);
    setIsBreathing(true);
  };

  const stopBreathPulse = () => {
    setIsBreathing(false);
  };

  return (
    <>
      {/* Background Dimming Overlay when Breath Pulse is Active */}
      <AnimatePresence>
        {isBreathing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-40 pointer-events-none transition-opacity duration-500 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Main Dark Forest Teal Canvas Card (#164E48) */}
      <div className={`relative rounded-3xl bg-[#164E48] text-white p-6 shadow-xl border-2 border-white/20 overflow-hidden transition-all duration-500 ${
        isBreathing ? 'z-50 ring-4 ring-[#E8F4F1] scale-[1.02]' : ''
      }`}>
        {/* Ambient Glowing Halo background */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#3E9C87]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#BFDCD6]/10 blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center shadow-md shrink-0">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-extrabold tracking-tight">Live Synapse Pulse</h3>
                  <span className="text-[10px] font-bold bg-white/20 text-[#E8F4F1] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Dyad Health Radar
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium">
                  Real-time emotional equilibrium between {caregiverName} & {patientName}
                </p>
              </div>
            </div>

            {/* Live Status Badge */}
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-200 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Dyad Synced • Real-Time</span>
            </div>
          </div>

          {/* Glowing Dual Waveform Canvas Animation */}
          <div className="relative h-12 w-full bg-black/20 rounded-2xl p-2 flex items-center overflow-hidden border border-white/10">
            <div className="absolute inset-0 flex items-center justify-around opacity-30 pointer-events-none">
              {[30, 65, 45, 90, 75, 40, 85, 55, 95, 35, 70, 50, 80, 45, 90].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ['20%', `${h}%`, '20%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.07 }}
                  className="w-1 bg-[#E8F4F1] rounded-full"
                />
              ))}
            </div>
            <div className="relative z-10 flex items-center justify-between w-full px-4 text-xs font-bold text-white/90">
              <span className="flex items-center"><Heart className="w-3.5 h-3.5 mr-1.5 text-rose-300 fill-current" /> {patientName}&apos;s Resonance</span>
              <span className="flex items-center"><Zap className="w-3.5 h-3.5 mr-1.5 text-amber-300" /> {caregiverName}&apos;s Energy Vector</span>
            </div>
          </div>

          {/* DUAL-SIDE RADAR GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* LEFT SIDE: Sunita's Cognitive Grounding Ring */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#BFDCD6]">
                  {patientName}&apos;s Grounding Index
                </span>
                <span className="text-xs font-bold bg-emerald-400/20 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  94% Stable
                </span>
              </div>

              <div className="flex items-center space-x-4 pt-1">
                {/* Glowing SVG Ring Gauge */}
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.15)" strokeWidth="5" fill="none" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#BFDCD6"
                      strokeWidth="5"
                      strokeDasharray="163"
                      strokeDashoffset="10"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute text-xs font-extrabold text-[#E8F4F1]">94%</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Calm & Receptive</h4>
                  <p className="text-xs text-white/80 leading-snug">
                    Morning Grounded • Voice tone steady with zero agitation cues.
                  </p>
                  <div className="flex items-center space-x-2 text-[10px] text-emerald-300 font-semibold pt-0.5">
                    <span>✓ Tasks 3/4 Complete</span>
                    <span>•</span>
                    <span>✓ Memory Reminiscence Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Priya's Care Reserve Battery Meter */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#BFDCD6]">
                  {caregiverName}&apos;s Care Reserve
                </span>
                <span className="text-xs font-bold bg-teal-400/20 text-teal-200 px-2.5 py-0.5 rounded-full border border-teal-400/30 flex items-center">
                  <BatteryCharging className="w-3.5 h-3.5 mr-1" />
                  84% Reserve
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-white/90 font-semibold">
                  <span>Caregiver Load: Optimal</span>
                  <span className="text-[#BFDCD6]">Rest Window Due in 45m</span>
                </div>

                {/* Battery Meter Bar */}
                <div className="h-3.5 w-full bg-black/30 rounded-full p-0.5 border border-white/20">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-300 via-emerald-300 to-[#E8F4F1] w-[84%] transition-all duration-500 shadow-sm" />
                </div>

                <p className="text-xs text-white/80 leading-snug">
                  3 Tasks Monitored • Burnout risk low. Taking short rest windows keeps your energy steady.
                </p>
              </div>
            </div>
          </div>

          {/* THE INTERACTIVE ONE-TAP "CAREGIVER RESET" BREATH PULSE */}
          <div className="pt-2 border-t border-white/15">
            {!isBreathing ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center">
                    <Wind className="w-4 h-4 mr-1.5 text-[#BFDCD6]" />
                    30-Second Caregiver Reset Pulse
                  </h4>
                  <p className="text-xs text-white/80">
                    Tap to trigger a guided tactile breathing visual right on your dashboard.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startBreathPulse}
                  className="px-5 py-3 rounded-2xl bg-[#E8F4F1] text-[#164E48] hover:bg-white font-extrabold text-xs shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-[#164E48] animate-spin-slow" />
                  <span>{breathCompleted ? 'Repeat 30s Reset Pulse' : 'Start Caregiver Reset Pulse'}</span>
                </button>
              </div>
            ) : (
              /* Expanded Guided Breathing Halo State */
              <div className="p-6 rounded-2xl bg-black/40 border-2 border-[#E8F4F1]/60 text-center space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-xs font-bold text-white/90">
                  <span className="flex items-center text-[#BFDCD6]">
                    <Wind className="w-4 h-4 mr-1 animate-pulse" />
                    Tactile Caregiver Breath Reset
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-extrabold text-amber-200">
                      {secondsLeft}s remaining
                    </span>
                    <button
                      type="button"
                      onClick={stopBreathPulse}
                      className="p-1 rounded-full text-white/70 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanding Breathing Halo Ring */}
                <div className="py-4 flex justify-center items-center relative">
                  <motion.div
                    animate={{
                      scale: breathStage === 'INHALE' ? [1, 1.45] : (breathStage === 'HOLD' ? [1.45, 1.45] : [1.45, 1]),
                      opacity: breathStage === 'HOLD' ? [0.9, 0.7, 0.9] : [0.5, 0.95],
                    }}
                    transition={{
                      duration: breathStage === 'EXHALE' ? 6 : 4,
                      repeat: 0,
                      ease: 'easeInOut',
                    }}
                    className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#BFDCD6] via-[#E8F4F1] to-white opacity-80 blur-md flex items-center justify-center shadow-2xl"
                  >
                    <div className="w-24 h-24 rounded-full bg-[#164E48] border-2 border-white flex flex-col items-center justify-center text-center p-2 shadow-inner">
                      <span className="text-xs font-black text-white tracking-widest uppercase">
                        {breathStage}
                      </span>
                      <span className="text-[10px] text-[#BFDCD6] font-semibold mt-0.5">
                        {breathStage === 'INHALE' ? 'Inhale 4s' : (breathStage === 'HOLD' ? 'Hold 4s' : 'Exhale 6s')}
                      </span>
                    </div>
                  </motion.div>
                </div>

                <p className="text-sm font-bold text-[#E8F4F1]">
                  {breathStage === 'INHALE' && 'Inhale softly through your nose... fill your chest.'}
                  {breathStage === 'HOLD' && 'Hold gently... feel your calm center.'}
                  {breathStage === 'EXHALE' && 'Release slowly through your lips... let all stress flow away.'}
                </p>

                <button
                  type="button"
                  onClick={stopBreathPulse}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
                >
                  End Early
                </button>
              </div>
            )}

            {breathCompleted && !isBreathing && (
              <div className="mt-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-xs font-bold text-emerald-200 flex items-center justify-between animate-in fade-in duration-300">
                <span className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-300" />
                  Mindful Rest Completed 🌿 Care Reserve Restored (+10%)
                </span>
                <span className="text-[10px] text-white/80">Refreshed just now</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
