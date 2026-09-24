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
  Smile,
  Trophy,
  Calendar,
  Brain,
  Music,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '@/lib/api';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/hooks/useLanguage';
import { speakText } from '@/lib/speech';
import { SynapticMelodyGame } from '@/components/patient/SynapticMelodyGame';

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

// Built-in daily trivia question bank (expands backend dynamic pool)
const DAILY_TRIVIA_POOL: TriviaRoundData[] = [
  {
    round_id: 'rnd_goa_001',
    memory_id: 'mem_1',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    title: 'Family Vacation in Goa',
    date: 'Summer 1987',
    location: 'Calangute Beach, Goa',
    question: 'Who joined you on this sunny beach trip to Goa?',
    options: ['Dad (Ramesh) & Priya', 'Doctor Anita', 'Neighbors from next door'],
    correct_index: 0,
    gentle_hint: 'Think about who loved walking along the shoreline with you for sunset ice cream!',
    encouragement_fact: 'Ramesh and Priya loved making sandcastles by the ocean waves with you that afternoon!'
  },
  {
    round_id: 'rnd_garden_002',
    memory_id: 'mem_2',
    image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    title: 'Morning Garden Care',
    date: 'March 2015',
    location: 'Home Garden',
    question: 'What special flowers bloomed so vibrantly in your home garden here?',
    options: ['Yellow & Red Roses', 'Purple Orchids', 'White Tulips'],
    correct_index: 0,
    gentle_hint: 'You spent the morning planting these fragrant blossoms in your backyard garden!',
    encouragement_fact: 'You cared for those rose bushes every single morning and they bloomed beautifully for months!'
  },
  {
    round_id: 'rnd_grad_003',
    memory_id: 'mem_3',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    title: "Ananya's Graduation Day",
    date: 'June 2021',
    location: 'University Auditorium',
    question: "Whose special graduation ceremony were you celebrating on this proud day?",
    options: ['Ananya (Granddaughter)', 'Priya (Caregiver)', 'Rahul (Son)'],
    correct_index: 0,
    gentle_hint: 'Look at who is wearing the black cap and gown in the middle of the photo!',
    encouragement_fact: 'Ananya hugged you tightly right after receiving her engineering diploma!'
  },
  {
    round_id: 'rnd_diwali_004',
    memory_id: 'mem_4',
    image_url: 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?auto=format&fit=crop&w=800&q=80',
    title: 'Diwali Festival Preparation',
    date: 'Diwali 2019',
    location: 'Family Kitchen',
    question: 'What delicious tradition were you preparing together in the kitchen?',
    options: ['Cardamom Festival Sweets', 'Birthday Cake', 'Morning Coffee'],
    correct_index: 0,
    gentle_hint: 'The kitchen was filled with sweet cardamom and almond aromas all afternoon!',
    encouragement_fact: 'Everyone loved your famous home-style kaju katli sweets during the festival!'
  },
  {
    round_id: 'rnd_tea_005',
    memory_id: 'mem_5',
    image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    title: 'Evening Tea & Radio Hits',
    date: 'Autumn 2018',
    location: 'Living Room Balcony',
    question: 'What music was playing on the radio while sipping warm cardamom tea?',
    options: ['Classic Radio Melodies', 'Heavy Metal Drums', 'Loud Electronic Synth'],
    correct_index: 0,
    gentle_hint: 'It was a peaceful vintage melody that Priya hummed along to with you!',
    encouragement_fact: 'Listening to classic radio songs brought bright smiles to the whole balcony that evening!'
  },
  {
    round_id: 'rnd_park_006',
    memory_id: 'mem_6',
    image_url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
    title: 'Sunny Park Walk',
    date: 'Spring 2022',
    location: 'Lodi Botanical Gardens',
    question: 'Where did you take your refreshing morning walk with Priya?',
    options: ['Lodi Botanical Gardens', 'Shopping Mall Parking', 'Busy Airport Terminal'],
    correct_index: 0,
    gentle_hint: 'You loved watching the green trees and singing birds along the paved walking path!',
    encouragement_fact: 'You completed a full 20-minute morning walk under the sunny shade trees!'
  }
];

// Get current date string (YYYY-MM-DD) for 1-day lifetime tracking
function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Retrieve asked question IDs for today from localStorage
function getTodayAskedQuestions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = `cognitrace_asked_questions_${getTodayKey()}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Store asked question ID for today
function markQuestionAskedToday(roundId: string) {
  if (typeof window === 'undefined') return;
  try {
    const asked = getTodayAskedQuestions();
    if (!asked.includes(roundId)) {
      asked.push(roundId);
      const key = `cognitrace_asked_questions_${getTodayKey()}`;
      localStorage.setItem(key, JSON.stringify(asked));
    }
  } catch {
    // ignore
  }
}

// Randomly shuffle options array and update correct_index
function shuffleRoundOptions(round: TriviaRoundData): TriviaRoundData {
  const correctText = round.options[round.correct_index] || round.options[0];
  const shuffled = [...round.options];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const newCorrectIdx = shuffled.indexOf(correctText);
  return {
    ...round,
    options: shuffled,
    correct_index: newCorrectIdx >= 0 ? newCorrectIdx : 0
  };
}

function getTriviaSpeech(round: TriviaRoundData, language: string): string {
  const optionsStr = round.options.map((opt, i) => `Option ${String.fromCharCode(65 + i)}: ${opt}`).join('. ');
  if (language !== 'hi-IN') {
    return `${round.question} Here are your choices: ${optionsStr}`;
  }

  const title = round.title.toLowerCase();
  if (title.includes('graduation') || title.includes('degree')) {
    return `यह अनन्या के स्नातक समारोह का गर्व भरा दिन था। इस समारोह में आपके साथ कौन था? विकल्प हैं: ${optionsStr}`;
  }
  if (title.includes('festival') || title.includes('diwali') || title.includes('sweets')) {
    return `दीवाली पर आप परिवार के साथ कौन सी स्वादिष्ट मिठाइयाँ बना रहे थे? विकल्प हैं: ${optionsStr}`;
  }
  if (title.includes('garden') || title.includes('rose') || title.includes('flower')) {
    return `आपके घर के बगीचे में कौन से सुंदर फूल खिले थे? विकल्प हैं: ${optionsStr}`;
  }
  if (title.includes('goa') || title.includes('beach')) {
    return `गोवा की इस सुंदर समुद्र तट यात्रा में आपके साथ कौन था? विकल्प हैं: ${optionsStr}`;
  }
  return `क्या आपको इस पारिवारिक याद के बारे में कुछ याद है? विकल्प हैं: ${optionsStr}`;
}

function getHindiFeedback(round: TriviaRoundData, isCorrect: boolean): string {
  if (isCorrect) {
    if (round.title.toLowerCase().includes('graduation')) {
      return 'बहुत बढ़िया! सही उत्तर है। अनन्या ने अपनी इंजीनियरिंग की डिग्री लेने के बाद आपको गले लगाया था।';
    }
    if (round.title.toLowerCase().includes('festival') || round.title.toLowerCase().includes('sweets')) {
      return 'बहुत बढ़िया! सही उत्तर है। त्योहार पर सभी को आपकी घर की बनी काजू कतली बहुत पसंद आई थी।';
    }
    return 'बहुत बढ़िया! यह सही उत्तर है। आपने एक सुंदर याद साझा की है।';
  }
  return 'आइए साथ में सोचते हैं। यह एक छोटी सी मदद है: फोटो में मुस्कुराते हुए लोगों को ध्यान से देखिए।';
}

export default function MemoryTriviaGamePage() {
  const { isPatient, mounted } = useUserRole();
  const { currentLangObj } = useLanguage();

  const [activeGameTab, setActiveGameTab] = useState<'TRIVIA' | 'MELODY'>('TRIVIA');
  const [gameState, setGameState] = useState<'LOADING' | 'QUESTION' | 'FEEDBACK_CORRECT' | 'FEEDBACK_HINT' | 'COMPLETED_TODAY'>('LOADING');
  const [roundData, setRoundData] = useState<TriviaRoundData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showZoomModal, setShowZoomModal] = useState<boolean>(false);
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Speak text aloud via speech utility (triggers top track bar & pause button)
  const speakAloud = useCallback((text: string) => {
    const speechLang = currentLangObj?.speechLang || 'en-US';
    speakText(text, speechLang);
  }, [currentLangObj]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Load new trivia round ensuring single-day deduplication and randomized options
  const loadNextRound = useCallback(async () => {
    setGameState('LOADING');
    setSelectedIndex(null);
    setStartTime(Date.now());

    const askedToday = getTodayAskedQuestions();
    let candidate: TriviaRoundData | null = null;

    // 1. Try fetching from backend RAG service
    try {
      const fetched = await api.fetchMemoryTriviaRound('patient_001');
      if (fetched && !askedToday.includes(fetched.round_id) && !askedToday.includes(fetched.question)) {
        candidate = fetched;
      }
    } catch {
      // ignore
    }

    // 2. If backend candidate was already asked today, pick from unasked daily pool
    if (!candidate) {
      const unaskedPool = DAILY_TRIVIA_POOL.filter(
        (r) => !askedToday.includes(r.round_id) && !askedToday.includes(r.question)
      );

      if (unaskedPool.length > 0) {
        candidate = unaskedPool[Math.floor(Math.random() * unaskedPool.length)];
      }
    }

    // 3. If all questions for today have been asked, show daily completed view
    if (!candidate) {
      setGameState('COMPLETED_TODAY');
      return;
    }

    // Mark question as asked today
    markQuestionAskedToday(candidate.round_id);
    markQuestionAskedToday(candidate.question);

    // Shuffle options so correct answer position is randomized
    const randomizedRound = shuffleRoundOptions(candidate);
    setRoundData(randomizedRound);
    setGameState('QUESTION');

    // Auto-read question aloud for patient comfort (triggers top playback bar & pause button)
    setTimeout(() => {
      speakAloud(getTriviaSpeech(randomizedRound, currentLangObj?.code || 'en-US'));
    }, 400);
  }, [currentLangObj, speakAloud]);

  // Reset today's asked history to replay
  const handleResetTodayHistory = () => {
    if (typeof window !== 'undefined') {
      try {
        const key = `cognitrace_asked_questions_${getTodayKey()}`;
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
    loadNextRound();
  };

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
      speakAloud(currentLangObj?.code === 'hi-IN'
        ? getHindiFeedback(roundData, true)
        : `Wonderful! That is correct! ${roundData.encouragement_fact}`);

      await api.submitMemoryTriviaRound({
        round_id: roundData.round_id,
        selected_index: idx,
        is_correct: true,
        duration_s
      });
    } else {
      setGameState('FEEDBACK_HINT');
      speakAloud(currentLangObj?.code === 'hi-IN'
        ? getHindiFeedback(roundData, false)
        : `Let's think together. Here is a helpful hint: ${roundData.gentle_hint}`);

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
          <p className="text-sm text-[#3D615B] leading-relaxed max-w-md mx-auto">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C7D2FE]/40 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-[#4F46E5] text-white shadow-md">
            <Heart className="w-6 h-6 fill-current text-white" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-micro">Patient Memory Companion</span>
            <h1 className="text-2xl font-extrabold text-[#1E1B4B] tracking-tight">Memory Games & Cognitive Exercises</h1>
          </div>
        </div>

        <Badge variant="lavender" className="text-xs px-3.5 py-1 font-bold shrink-0 self-start sm:self-auto">
          {roundsCompleted > 0 ? `${roundsCompleted} Moments Shared Today` : 'Daily Cognitive Exercises'}
        </Badge>
      </div>

      {/* Interactive Game Switcher Tabs */}
      <div className="flex p-1.5 bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl gap-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveGameTab('TRIVIA')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeGameTab === 'TRIVIA'
              ? 'bg-[#4F46E5] text-white shadow-md scale-[1.01]'
              : 'text-[#475569] hover:bg-white/60 hover:text-[#1E1B4B]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>📸 Family Photo Memories</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGameTab('MELODY')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeGameTab === 'MELODY'
              ? 'bg-[#4F46E5] text-white shadow-md scale-[1.01]'
              : 'text-[#475569] hover:bg-white/60 hover:text-[#1E1B4B]'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>🎵 Synaptic Melody Recall</span>
        </button>
      </div>

      {/* ================= TAB 2: SYNAPTIC MELODY & PATTERN RECALL GAME ================= */}
      {activeGameTab === 'MELODY' ? (
        <SynapticMelodyGame />
      ) : (
        <>
          {/* ================= GAME STATE: LOADING ================= */}
      {gameState === 'LOADING' && (
        <Card className="p-12 text-center space-y-6 bg-white border border-[#C7D2FE] rounded-3xl shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto animate-pulse shadow-inner border border-[#C7D2FE]">
            <Sparkles className="w-10 h-10 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-[#1E1B4B]">Gathering Today's Memory Moments...</h3>
            <p className="text-xs font-semibold text-[#475569]">Selecting an unasked photo memory for today.</p>
          </div>
        </Card>
      )}

      {/* ================= GAME STATE: ALL COMPLETED TODAY ================= */}
      {gameState === 'COMPLETED_TODAY' && (
        <Card className="p-8 md:p-10 text-center space-y-6 bg-gradient-to-b from-white to-[#EEF2FF]/60 border-2 border-[#C7D2FE] rounded-3xl shadow-xl animate-in fade-in duration-300">
          <div className="w-20 h-20 rounded-full bg-[#4F46E5] text-white flex items-center justify-center mx-auto shadow-lg border-4 border-white">
            <Trophy className="w-10 h-10 text-amber-300" />
          </div>
          <div className="space-y-3 max-w-lg mx-auto">
            <Badge variant="lavender" className="px-3.5 py-1 text-xs font-bold">
              Daily Memory Quest Complete!
            </Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] tracking-tight">
              You've Explored All Memory Moments for Today! 🎉
            </h2>
            <p className="text-sm font-medium text-[#475569] leading-relaxed">
              Wonderful work! You have completed all of today's memory questions. Your mind is active, vibrant, and connected. 
              New memory moments will unlock tomorrow!
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={handleResetTodayHistory}
              variant="outline"
              className="w-full sm:w-auto px-6 py-3 rounded-full border-[#C7D2FE] text-[#4F46E5] font-bold text-xs shadow-sm hover:bg-[#EEF2FF]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>Replay Today's Moments</span>
            </Button>
          </div>
        </Card>
      )}

      {/* ================= GAME STATE: QUESTION / FEEDBACK ================= */}
      {roundData && gameState !== 'LOADING' && gameState !== 'COMPLETED_TODAY' && (
        <div className="space-y-6">
          
          {/* Main Archival Memory Photo Card */}
          <Card className="overflow-hidden border border-[#C7D2FE] shadow-md bg-white relative rounded-3xl">
            <div className="relative h-64 md:h-80 w-full bg-slate-900 overflow-hidden group">
              <img
                src={roundData.image_url}
                alt={roundData.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-6 text-white">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{roundData.title}</h3>
                    <p className="text-xs text-white/90 font-bold mt-0.5">{roundData.location} &bull; {roundData.date}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowZoomModal(true)}
                    className="text-white hover:bg-white/20 text-xs rounded-full border border-white/30"
                  >
                    <Maximize2 className="w-4 h-4 mr-1.5" />
                    Zoom Photo
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Question Text & Read Aloud Controls */}
          <Card className="p-6 bg-white border border-[#C7D2FE] shadow-sm space-y-4 rounded-3xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-[#4F46E5] flex items-center tracking-micro uppercase">
                  <Smile className="w-4 h-4 mr-1.5 text-[#6366F1]" />
                  Memory Reminiscence Question
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#1E1B4B] leading-snug">
                  {roundData.question}
                </h2>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => speakAloud(getTriviaSpeech(roundData, currentLangObj?.code || 'en-US'))}
                className="h-12 w-12 shrink-0 rounded-full bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] border border-[#C7D2FE] cursor-pointer shadow-xs"
                title="Read question aloud (shows top track bar & pause button)"
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
              <div className="p-5 rounded-2xl bg-[#EEF2FF] border border-[#6366F1]/40 text-xs text-[#1E1B4B] space-y-2 animate-in fade-in duration-300">
                <span className="font-extrabold text-sm flex items-center text-[#4F46E5]">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-[#4F46E5]" />
                  Wonderful Memory Choice! 🎉
                </span>
                <p className="text-xs font-semibold leading-relaxed text-[#475569]">{roundData.encouragement_fact}</p>
              </div>
            )}
          </Card>

          {/* Large Accessible Touch Option Buttons (Randomized Order) */}
          <div className="space-y-3">
            {roundData.options.map((optionText, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrectOption = idx === roundData.correct_index;

              let buttonStyle = "bg-white text-[#1E1B4B] border-[#C7D2FE] hover:border-[#4F46E5] hover:bg-[#EEF2FF]";
              if (gameState === 'FEEDBACK_CORRECT' && isCorrectOption) {
                buttonStyle = "bg-[#4F46E5] text-white border-[#4F46E5] shadow-md scale-[1.01]";
              } else if (gameState === 'FEEDBACK_HINT' && isSelected) {
                buttonStyle = "bg-amber-100 text-amber-900 border-amber-300 animate-shake";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={gameState === 'FEEDBACK_CORRECT'}
                  className={`w-full p-5 rounded-3xl border-2 text-left font-extrabold text-base md:text-lg flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs active:scale-98 ${buttonStyle}`}
                >
                  <div className="flex items-center space-x-3.5">
                    <span className="w-9 h-9 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center text-xs font-black shrink-0 border border-[#C7D2FE]">
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
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-base py-6 px-8 rounded-full shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#123B35]/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowZoomModal(false)}
        >
          <div className="relative max-w-4xl w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
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
        </>
      )}
    </div>
  );
}
