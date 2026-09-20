'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Volume2,
  Sparkles,
  Heart,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Maximize2,
  X,
  Lock,
  Smile
} from 'lucide-react';
import { api } from '@/lib/api';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/hooks/useLanguage';

interface TriviaRoundData {
  round_id: string;
  memory_id: string;
  image_url: string;
  title: string;
  date: string;
  location: string;
  question: string;
  options: string[];
  correct_index: number;
  gentle_hint: string;
  encouragement_fact: string;
}

export default function MemoryTriviaGamePage() {
  const { isPatient, mounted } = useUserRole();
  const { currentLangObj } = useLanguage();

  const [gameState, setGameState] = useState<'LOADING' | 'QUESTION' | 'FEEDBACK_CORRECT' | 'FEEDBACK_HINT' | 'COMPLETED'>('LOADING');
  const [roundData, setRoundData] = useState<TriviaRoundData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showZoomModal, setShowZoomModal] = useState<boolean>(false);
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Speak text aloud using SpeechSynthesis
  const speakAloud = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.lang = currentLangObj?.speechLang || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }, [currentLangObj]);

  // Load new trivia round from backend
  const loadNextRound = useCallback(async () => {
    setGameState('LOADING');
    setSelectedIndex(null);
    setStartTime(Date.now());

    try {
      const data = await api.fetchMemoryTriviaRound('patient_001');
      setRoundData(data);
      setGameState('QUESTION');

      // Auto-read question aloud for patient comfort
      setTimeout(() => {
        speakAloud(`${data.question} Here are your options: ${data.options.join('. ')}`);
      }, 400);
    } catch (err) {
      console.warn('Memory trivia load error:', err);
      setGameState('QUESTION');
    }
  }, [speakAloud]);

  useEffect(() => {
    if (mounted && isPatient) {
      loadNextRound();
    }
  }, [mounted, isPatient, loadNextRound]);

  // Handle option tap
  const handleOptionSelect = async (idx: number) => {
    if (!roundData || gameState === 'FEEDBACK_CORRECT') return;

    setSelectedIndex(idx);
    const duration_s = (Date.now() - startTime) / 1000;
    const isCorrect = idx === roundData.correct_index;

    if (isCorrect) {
      setGameState('FEEDBACK_CORRECT');
      setRoundsCompleted((prev) => prev + 1);
      speakAloud(`Wonderful! That is correct! ${roundData.encouragement_fact}`);

      await api.submitMemoryTriviaRound({
        round_id: roundData.round_id,
        selected_index: idx,
        is_correct: true,
        duration_s
      });
    } else {
      setGameState('FEEDBACK_HINT');
      speakAloud(`Let's think together. Here is a helpful hint: ${roundData.gentle_hint}`);

      await api.submitMemoryTriviaRound({
        round_id: roundData.round_id,
        selected_index: idx,
        is_correct: false,
        duration_s
      });
    }
  };

  // Role Lock Screen for Non-Patients (Caregivers)
  if (mounted && !isPatient) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <Badge variant="warning">Patient Exclusive Reminiscence Game</Badge>
          <h2 className="text-2xl font-bold text-[#123B35]">Patient Memory Journey Locked</h2>
          <p className="text-sm text-[#66736F] leading-relaxed max-w-md mx-auto">
            This interactive trivia game is designed exclusively for patients to recall family photos and moments.
            Caregivers can view observation trends and activity logs in the Caregiver Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300 select-none">
      
      {/* Top Header Badge */}
      <div className="flex items-center justify-between border-b border-[#DDE7E3] pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-2xl bg-[#164E48] text-white shadow-sm">
            <Heart className="w-5 h-5 fill-current text-white" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#164E48] uppercase tracking-wider">Patient Memory Companion</span>
            <h1 className="text-2xl font-extrabold text-[#123B35] tracking-tight">Family Memory Journeys</h1>
          </div>
        </div>

        <Badge variant="accent" className="text-xs px-3 py-1 font-bold">
          {roundsCompleted > 0 ? `${roundsCompleted} Moments Shared` : 'Warm Reminiscence'}
        </Badge>
      </div>

      {/* ================= GAME STATE: LOADING ================= */}
      {gameState === 'LOADING' && (
        <Card className="p-12 text-center space-y-6 card-hero">
          <div className="w-20 h-20 rounded-full bg-[#BFDCD6]/40 text-[#17665B] flex items-center justify-center mx-auto animate-pulse shadow-inner">
            <Sparkles className="w-10 h-10 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#123B35]">Gathering Your Memory Moments...</h3>
            <p className="text-xs text-[#66736F]">Preparing a warm photo memory to share with you.</p>
          </div>
        </Card>
      )}

      {/* ================= GAME STATE: QUESTION / FEEDBACK ================= */}
      {roundData && gameState !== 'LOADING' && gameState !== 'COMPLETED' && (
        <div className="space-y-6">
          
          {/* Main Archival Memory Photo Card */}
          <Card className="overflow-hidden border border-[#DDE7E3] shadow-md bg-white relative">
            <div className="relative h-64 md:h-80 w-full bg-slate-900 overflow-hidden group">
              <img
                src={roundData.image_url}
                alt={roundData.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 text-white">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">{roundData.title}</h3>
                    <p className="text-xs text-white/80 font-semibold">{roundData.location} &bull; {roundData.date}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowZoomModal(true)}
                    className="text-white hover:bg-white/20 text-xs rounded-xl"
                  >
                    <Maximize2 className="w-4 h-4 mr-1" />
                    Zoom Photo
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Question Text & Read Aloud Controls */}
          <Card className="p-6 bg-gradient-to-r from-white via-[#F5F8F6] to-white border-[#DDE7E3] shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#17665B] flex items-center">
                  <Smile className="w-4 h-4 mr-1.5 text-amber-500" />
                  Reminiscence Question
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-[#123B35] leading-snug">
                  {roundData.question}
                </h2>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => speakAloud(`${roundData.question} Here are your options: ${roundData.options.join('. ')}`)}
                className="h-12 w-12 shrink-0 rounded-2xl bg-[#BFDCD6]/30 text-[#17665B] hover:bg-[#BFDCD6] cursor-pointer"
                title="Read question aloud"
              >
                <Volume2 className="w-6 h-6" />
              </Button>
            </div>

            {/* Hint Card when incorrect choice tapped */}
            {gameState === 'FEEDBACK_HINT' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 animate-in fade-in duration-300">
                <span className="font-bold flex items-center text-amber-800">
                  <HelpCircle className="w-4 h-4 mr-1.5 text-amber-600" />
                  Gentle Memory Hint:
                </span>
                <p className="leading-relaxed font-semibold">{roundData.gentle_hint}</p>
                <p className="text-[11px] text-amber-700 pt-1">Take your time and tap another memory choice below!</p>
              </div>
            )}

            {/* Correct Celebration Card */}
            {gameState === 'FEEDBACK_CORRECT' && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-2 animate-in fade-in duration-300">
                <span className="font-bold text-sm flex items-center text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
                  Wonderful Memory Choice!
                </span>
                <p className="text-xs font-semibold leading-relaxed text-emerald-900">{roundData.encouragement_fact}</p>
              </div>
            )}
          </Card>

          {/* Large Accessible Touch Option Buttons */}
          <div className="space-y-3">
            {roundData.options.map((optionText, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrectOption = idx === roundData.correct_index;

              let buttonStyle = "bg-white text-[#123B35] border-[#DDE7E3] hover:border-[#17665B] hover:bg-[#F5F8F6]";
              if (gameState === 'FEEDBACK_CORRECT' && isCorrectOption) {
                buttonStyle = "bg-emerald-600 text-white border-emerald-600 shadow-md";
              } else if (gameState === 'FEEDBACK_HINT' && isSelected) {
                buttonStyle = "bg-amber-100 text-amber-900 border-amber-300 animate-shake";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={gameState === 'FEEDBACK_CORRECT'}
                  className={`w-full p-5 rounded-3xl border-2 text-left font-bold text-base md:text-lg flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs ${buttonStyle}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-[#123B35] flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{optionText}</span>
                  </div>
                  {gameState === 'FEEDBACK_CORRECT' && isCorrectOption && (
                    <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Footer Button for Next Round */}
          {gameState === 'FEEDBACK_CORRECT' && (
            <div className="pt-2 flex justify-center">
              <Button
                onClick={loadNextRound}
                size="lg"
                className="bg-[#17665B] hover:bg-[#123B35] text-white font-bold text-base py-6 px-8 rounded-2xl shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <span>Share Next Memory Moment</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Photo Zoom Modal */}
      {showZoomModal && roundData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowZoomModal(false)}
        >
          <div className="relative max-w-4xl w-full bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setShowZoomModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={roundData.image_url} alt={roundData.title} className="w-full h-auto max-h-[80vh] object-contain mx-auto" />
            <div className="p-4 text-center text-white bg-black/90">
              <h3 className="text-lg font-bold">{roundData.title}</h3>
              <p className="text-xs text-white/80">{roundData.location} &bull; {roundData.date}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
