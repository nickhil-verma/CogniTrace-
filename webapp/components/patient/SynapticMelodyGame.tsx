'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Music,
  Volume2,
  Sparkles,
  Heart,
  Sun,
  RotateCcw,
  CheckCircle2,
  Play,
  Trophy,
  HelpCircle,
  Brain,
  ShieldCheck
} from 'lucide-react';
import { speakText } from '@/lib/speech';
import { api } from '@/lib/api';

interface TileConfig {
  id: number;
  label: string;
  colorName: string;
  bgNormal: string;
  bgActive: string;
  borderColor: string;
  textColor: string;
  freq: number;
  icon: React.ElementType;
}

const GAME_TILES: TileConfig[] = [
  {
    id: 0,
    label: 'Rose Blossom',
    colorName: 'Rose Red',
    bgNormal: 'bg-rose-100/90 text-rose-900 border-rose-300',
    bgActive: 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-300 scale-105 shadow-lg',
    borderColor: 'border-rose-300',
    textColor: 'text-rose-700',
    freq: 261.63, // C4
    icon: Heart
  },
  {
    id: 1,
    label: 'Garden Mint',
    colorName: 'Emerald Mint',
    bgNormal: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
    bgActive: 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-300 scale-105 shadow-lg',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    freq: 329.63, // E4
    icon: Sun
  },
  {
    id: 2,
    label: 'Sunlight Gold',
    colorName: 'Warm Gold',
    bgNormal: 'bg-amber-100/90 text-amber-900 border-amber-300',
    bgActive: 'bg-amber-500 text-white border-amber-600 ring-4 ring-amber-300 scale-105 shadow-lg',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-700',
    freq: 392.00, // G4
    icon: Sparkles
  },
  {
    id: 3,
    label: 'Periwinkle Sky',
    colorName: 'Royal Periwinkle',
    bgNormal: 'bg-indigo-100/90 text-indigo-900 border-indigo-300',
    bgActive: 'bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-300 scale-105 shadow-lg',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-700',
    freq: 523.25, // C5
    icon: Music
  }
];

// Helper to synthesize soft musical chime notes via Web Audio API
function playChimeNote(freq: number, durationMs: number = 400) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Smooth envelope for gentle non-harsh tone
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (durationMs / 1000));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (durationMs / 1000));
  } catch {
    // Fallback if audio blocked
  }
}

export function SynapticMelodyGame() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStepIndex, setUserStepIndex] = useState<number>(0);
  const [activeTileId, setActiveTileId] = useState<number | null>(null);
  
  // Game states: DEMO (showing pattern), USER_TURN (patient tapping), SUCCESS (level complete), GENTLE_RETRY (gentle guidance)
  const [phase, setPhase] = useState<'IDLE' | 'DEMO' | 'USER_TURN' | 'SUCCESS' | 'GENTLE_RETRY'>('IDLE');
  const [level, setLevel] = useState<number>(1);
  const [highestLevel, setHighestLevel] = useState<number>(1);
  const [roundsCompletedToday, setRoundsCompletedToday] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Tap "Start Melody Challenge" to listen and play!');
  const [startTime, setStartTime] = useState<number>(Date.now());

  const isPlayingDemoRef = useRef<boolean>(false);

  // Playback sequence automatically tile-by-tile
  const playDemoSequence = useCallback((targetSeq: number[]) => {
    if (targetSeq.length === 0 || isPlayingDemoRef.current) return;
    isPlayingDemoRef.current = true;
    setPhase('DEMO');
    setUserStepIndex(0);
    setStatusMessage('🎶 Listen and watch Aria play the pattern...');

    let step = 0;
    const interval = setInterval(() => {
      if (step >= targetSeq.length) {
        clearInterval(interval);
        setActiveTileId(null);
        isPlayingDemoRef.current = false;
        setPhase('USER_TURN');
        setStartTime(Date.now());
        setStatusMessage('👉 Your turn! Tap the tiles in the same order.');
        return;
      }

      const tileId = targetSeq[step];
      setActiveTileId(tileId);
      const tile = GAME_TILES[tileId];
      if (tile) {
        playChimeNote(tile.freq, 450);
      }

      step++;
    }, 850);
  }, []);

  // Start new game or start next level
  const startNextLevel = useCallback((targetLevel: number) => {
    // Generate sequence of length = level + 1 (starts at length 2)
    const seqLen = targetLevel + 1;
    const newSeq: number[] = [];
    for (let i = 0; i < seqLen; i++) {
      newSeq.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSeq);
    setLevel(targetLevel);
    if (targetLevel > highestLevel) setHighestLevel(targetLevel);
    playDemoSequence(newSeq);
  }, [highestLevel, playDemoSequence]);

  // Replay current sequence
  const replayCurrentSequence = () => {
    if (sequence.length > 0) {
      playDemoSequence(sequence);
    }
  };

  // Handle patient tile tap
  const handleTileTap = (tileId: number) => {
    if (phase !== 'USER_TURN' || sequence.length === 0) return;

    // Light up tile & play musical chime tone
    setActiveTileId(tileId);
    const tile = GAME_TILES[tileId];
    if (tile) {
      playChimeNote(tile.freq, 400);
    }

    setTimeout(() => {
      setActiveTileId(null);
    }, 300);

    const expectedTileId = sequence[userStepIndex];

    // Correct Tap!
    if (tileId === expectedTileId) {
      const nextStep = userStepIndex + 1;
      setUserStepIndex(nextStep);

      // Entire Sequence Completed Correctly!
      if (nextStep >= sequence.length) {
        setPhase('SUCCESS');
        setRoundsCompletedToday((prev) => prev + 1);
        setStatusMessage('🌟 Wonderful memory! You recalled the full melody sequence!');
        speakText('Wonderful memory! You recalled the full chime pattern perfectly!');

        const duration_s = (Date.now() - startTime) / 1000;
        api.submitMemoryTriviaRound({
          round_id: `synaptic_mel_${Date.now()}`,
          selected_index: tileId,
          is_correct: true,
          duration_s
        }).catch(() => {});
      }
    } else {
      // Gentle Miss - No harsh red error screens or loud buzzers!
      setPhase('GENTLE_RETRY');
      setStatusMessage('🌿 That is okay! Let us listen to the chime pattern together again.');
      speakText("That's okay! Let's listen to the chime pattern together again.");

      const duration_s = (Date.now() - startTime) / 1000;
      api.submitMemoryTriviaRound({
        round_id: `synaptic_mel_${Date.now()}`,
        selected_index: tileId,
        is_correct: false,
        duration_s
      }).catch(() => {});
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300 select-none">
      
      {/* Clinical Significance Banner */}
      <Card className="p-6 bg-gradient-to-r from-[#4F46E5] via-[#4338CA] to-[#3730A3] text-white rounded-3xl shadow-xl relative overflow-hidden border-0">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold">
              <Brain className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Dual-Sensory Cognitive Memory Trainer</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Synaptic Melody & Pattern Recall
            </h2>
            <p className="text-xs md:text-sm text-white/90 font-medium max-w-lg leading-relaxed">
              Stimulates working memory & pentatonic chime pathways. Retaining dual auditory-visual patterns directly exercises hippocampal resonance without cognitive fatigue.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/30 p-3.5 rounded-2xl flex flex-col items-center shrink-0 shadow-inner min-w-[120px]">
            <span className="text-xs font-bold text-white/80 uppercase">Highest Level</span>
            <span className="text-2xl font-black text-amber-300">Level {highestLevel}</span>
            <span className="text-[10px] text-white/90 font-semibold">{roundsCompletedToday} Completed Today</span>
          </div>
        </div>
      </Card>

      {/* Main Interactive Stage */}
      <Card className="p-6 md:p-8 bg-white border border-[#C7D2FE] rounded-3xl shadow-md space-y-6 text-center">
        
        {/* Status Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="lavender" className="px-3.5 py-1 text-xs font-bold">
              {phase === 'DEMO' ? '🎶 Aria Playing Pattern...' : phase === 'USER_TURN' ? '👉 Your Turn to Recall' : 'Memory Challenge'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => speakText(statusMessage)}
              className="h-8 w-8 rounded-full p-0 bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]"
              title="Listen to status"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-[#1E1B4B]">
            {statusMessage}
          </h3>

          {phase === 'USER_TURN' && sequence.length > 0 && (
            <p className="text-xs font-bold text-[#475569]">
              Progress: Step {userStepIndex + 1} of {sequence.length}
            </p>
          )}
        </div>

        {/* 4 Oversized Tactile Musical Tiles */}
        <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
          {GAME_TILES.map((tile) => {
            const TileIcon = tile.icon;
            const isActive = activeTileId === tile.id;
            const style = isActive ? tile.bgActive : `${tile.bgNormal} hover:scale-102`;

            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileTap(tile.id)}
                disabled={phase === 'DEMO'}
                className={`min-h-[120px] md:min-h-[140px] p-6 rounded-3xl border-2 flex flex-col items-center justify-center space-y-2.5 transition-all duration-150 cursor-pointer active:scale-95 shadow-sm ${style}`}
              >
                <div className={`p-3 rounded-2xl ${isActive ? 'bg-white/30 text-white' : 'bg-white/80'} shadow-inner`}>
                  <TileIcon className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="text-center">
                  <span className="font-extrabold text-base md:text-lg block tracking-tight">{tile.label}</span>
                  <span className="text-[11px] font-bold opacity-80 uppercase tracking-micro">{tile.colorName}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Replay Buttons */}
        <div className="pt-4 border-t border-[#E0E7FF] flex flex-wrap items-center justify-center gap-3">
          {phase === 'IDLE' && (
            <Button
              onClick={() => startNextLevel(1)}
              size="lg"
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-base py-6 px-8 rounded-full shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <Play className="w-5 h-5 fill-current mr-1" />
              <span>Start Melody Challenge (Level 1)</span>
            </Button>
          )}

          {phase === 'USER_TURN' && (
            <Button
              onClick={replayCurrentSequence}
              variant="outline"
              className="px-5 py-3 rounded-full border-[#C7D2FE] text-[#4F46E5] font-bold text-xs hover:bg-[#EEF2FF]"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              <span>Listen to Pattern Again</span>
            </Button>
          )}

          {phase === 'SUCCESS' && (
            <Button
              onClick={() => startNextLevel(level + 1)}
              size="lg"
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-base py-6 px-8 rounded-full shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95 animate-bounce-short"
            >
              <Sparkles className="w-5 h-5 mr-1" />
              <span>Advance to Level {level + 1}</span>
            </Button>
          )}

          {phase === 'GENTLE_RETRY' && (
            <Button
              onClick={replayCurrentSequence}
              size="lg"
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-base py-6 px-8 rounded-full shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-5 h-5 mr-1" />
              <span>Listen & Replay Level {level}</span>
            </Button>
          )}
        </div>
      </Card>

      {/* Dementia Clinical Memory Benefits Footer */}
      <Card className="p-5 bg-[#F5F3FF] border border-[#C7D2FE] rounded-3xl space-y-2 text-xs text-[#1E1B4B]">
        <div className="flex items-center space-x-2 font-extrabold text-[#4F46E5] uppercase tracking-micro">
          <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
          <span>Why Dual-Sensory Pattern Games Work for Dementia Care</span>
        </div>
        <p className="font-semibold text-[#475569] leading-relaxed">
          Pentatonic musical frequencies (C4–C5) bypass cognitive barriers and stimulate auditory memory retention. Coupled with visual spatial cues, this gentle exercise builds neural connections while remaining calm, non-frustrating, and encouraging.
        </p>
      </Card>
    </div>
  );
}
