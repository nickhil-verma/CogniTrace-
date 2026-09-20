'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  Heart,
  Image as ImageIcon,
  Bell,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Sun,
  Clock,
  Smile,
  HelpCircle,
  Volume2
} from 'lucide-react';
import { useReminders } from '@/hooks/useReminders';
import { useMemories } from '@/hooks/useMemories';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { useLanguage } from '@/hooks/useLanguage';
import { VoiceOrb } from '@/components/command-center/VoiceOrb';
import { VoiceRecorder } from '@/components/command-center/VoiceRecorder';
import { SuggestedCommand } from '@/components/command-center/SuggestedCommand';
import { ActionConfirmation } from '@/components/command-center/ActionConfirmation';
import { VoiceActionModal } from '@/components/command-center/VoiceActionModal';
import { speakText } from '@/lib/speech';

export function PatientDashboard() {
  const { reminders, toggleComplete } = useReminders();
  const { memories } = useMemories();
  const { t } = useLanguage();

  // Voice Agent Hook (Embedded in Dashboard)
  const {
    voiceState,
    transcript,
    aiResponse,
    activeModalAction,
    isModalOpen,
    closeModal,
    errorMessage,
    volumeLevel,
    permissionError,
    handleStartListening,
    handleStopListeningAndSubmit,
    submitVoiceTurn
  } = useVoiceAgent();

  // Live Time state
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  // Interactive Mood Tracker state
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Voice Hug state
  const [voiceHugSent, setVoiceHugSent] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString([], {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const getMoodFeedback = (mood: string) => {
    switch (mood) {
      case 'great':
        return '🌟 Wonderful to hear! Your daughter Priya has been updated that you are feeling full of energy today.';
      case 'peaceful':
        return '🌿 So peaceful! Relax and enjoy your day, a warm drink, or gentle music.';
      case 'okay':
        return '💙 Taking things gently today is perfect. Your Voice Companion is right here if you want to talk.';
      case 'need_support':
        return '💖 A gentle note has been sent to Priya. She will check in with you very soon!';
      default:
        return '';
    }
  };

  const speakGreeting = () => {
    const msg = `Good day! Today is ${dateStr || 'a wonderful day'}. How are you feeling right now?`;
    speakText(msg);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* ================= 1. LIVE TIME, DATE & WARM WEATHER BANNER ================= */}
      <Card className="p-8 bg-gradient-to-r from-[#164E48] via-[#17665B] to-[#25756C] text-white rounded-3xl shadow-xl relative overflow-hidden border-0">
        <div className="absolute -right-8 -bottom-8 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold">
              <Heart className="w-4 h-4 fill-current text-white animate-pulse" />
              <span>{t('patient.dailyCompanion') || 'My Daily Companion'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {t('patient.greeting') || 'Good day, Sunita! 🌸'}
              </h1>
              <button
                type="button"
                onClick={speakGreeting}
                className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all shrink-0 shadow-sm active:scale-95"
                title="Tap to listen to greeting"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm md:text-base text-white/90 font-medium max-w-md">
              {t('patient.description') || 'Here is your daily checklist, photo memories, and personal Voice Companion.'}
            </p>
          </div>

          {/* Time & Weather Card */}
          <div className="bg-white/15 backdrop-blur-md border border-white/30 p-4 rounded-2xl flex items-center space-x-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-amber-300 shadow-sm">
              <Sun className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight flex items-center space-x-2">
                <Clock className="w-4 h-4 text-white/80" />
                <span>{timeStr || '4:30 PM'}</span>
              </div>
              <p className="text-xs font-semibold text-white/90">
                {dateStr || 'Saturday, Sept 19'} • Sunny 24°C
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ================= 2. EMBEDDED IN-DASHBOARD VOICE AI COMPANION ================= */}
      <Card className="p-8 text-center bg-gradient-to-b from-white to-[#F5F8F6] border-2 border-[#BFDCD6] rounded-3xl shadow-lg space-y-6">
        <div className="space-y-2">
          <Badge variant="teal">{t('patient.voiceCompanion') || 'Voice Companion'}</Badge>
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#123B35]">
              {t('patient.talkWithVoiceAI') || 'Talk with My Voice AI Companion'}
            </h2>
            <button
              type="button"
              onClick={() => speakText("Talk with your Voice AI companion. Tap the orb to speak.")}
              className="p-1.5 rounded-full bg-[#E8F4F1] text-[#17665B] hover:bg-[#D2ECE6] transition-colors"
              title="Tap to listen"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-[#66736F] max-w-md mx-auto">
            {t('patient.tapBelowAndSpeak') || 'Tap the button to speak, report a completed task, or ask what you should do next.'}
          </p>
        </div>

        {/* Dynamic Voice Orb */}
        <VoiceOrb
          state={voiceState}
          volumeLevel={volumeLevel}
          onClick={() => {
            if (voiceState === 'LISTENING') {
              handleStopListeningAndSubmit();
            } else {
              handleStartListening();
            }
          }}
        />

        {/* Speech Transcript Display */}
        {transcript && (
          <div className="max-w-xl mx-auto bg-white p-4 rounded-2xl border border-[#DDE7E3] shadow-2xs text-left space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-[#66736F]">
              <span className="font-semibold text-[#17665B]">Speech Transcript</span>
              <Mic className="w-3.5 h-3.5 text-[#17665B]" />
            </div>
            <p className="text-sm font-semibold text-[#123B35]">&ldquo;{transcript}&rdquo;</p>
          </div>
        )}

        {/* AI Assistant Response Display */}
        {aiResponse && (
          <div className="max-w-xl mx-auto bg-[#BFDCD6]/30 p-4 rounded-2xl border border-[#BFDCD6] text-left space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-[#17665B]">
              <span className="font-bold flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                AI Assistant Response
              </span>
              <button
                type="button"
                onClick={() => speakText(aiResponse)}
                className="p-1 rounded-full text-[#17665B] hover:bg-white/50"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <ActionConfirmation responseText={aiResponse} />
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-amber-50 text-xs font-semibold text-amber-800 border border-amber-200">
            {errorMessage}
          </div>
        )}

        {/* Microphone Controls & Manual Input */}
        <div className="max-w-xl mx-auto pt-2">
          <VoiceRecorder
            voiceState={voiceState}
            permissionError={permissionError}
            onStartListening={handleStartListening}
            onStopListening={handleStopListeningAndSubmit}
            onSubmitTextPrompt={(text) => submitVoiceTurn(text)}
          />
        </div>

        {/* Suggested Voice Check-Ins for Patient */}
        <div className="max-w-xl mx-auto pt-3 text-left">
          <SuggestedCommand
            role="patient"
            onSelectCommand={(cmd) => submitVoiceTurn(cmd)}
          />
        </div>

        {/* 3 Simple Large Visual Tap Suggestions */}
        <div className="pt-4 border-t border-[#DDE7E3] space-y-3">
          <p className="text-xs font-bold text-[#66736F]">Tap any card to open or hear options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                title: 'Show my photos',
                href: '/memories',
                icon: ImageIcon,
                color: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100',
                prompt: 'Show my family photos'
              },
              {
                title: 'Check my pills',
                href: '/reminders',
                icon: Bell,
                color: 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100',
                prompt: 'What medicine should I take now?'
              },
              {
                title: 'Play a game',
                href: '/patient/memory-trivia',
                icon: Sparkles,
                color: 'bg-cyan-50 text-cyan-900 border-cyan-200 hover:bg-cyan-100',
                prompt: 'Let us play a memory game'
              }
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${item.color}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#164E48] flex items-center justify-center shadow-xs">
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(item.title);
                      }}
                      className="p-1.5 rounded-full bg-white/80 text-[#164E48] hover:bg-white shadow-2xs"
                      title="Tap to listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Link
                    href={item.href}
                    className="text-left font-extrabold text-base tracking-tight hover:underline flex items-center justify-between"
                  >
                    <span>{item.title}</span>
                    <span>→</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ================= 3. 1-TAP DAILY MOOD CHECK-IN ================= */}
      <Card className="p-6 bg-white border border-[#DDE7E3] rounded-3xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smile className="w-5 h-5 text-[#17665B]" />
            <h2 className="text-lg font-bold text-[#123B35]">
              How are you feeling right now, Sunita?
            </h2>
          </div>
          <span className="text-xs text-[#66736F] font-semibold">1-Tap Mood Check-In</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'great', emoji: '😊', label: 'Feeling Great', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            { id: 'peaceful', emoji: '🙂', label: 'Peaceful', color: 'bg-teal-50 text-teal-800 border-teal-200' },
            { id: 'okay', emoji: '😐', label: 'Just Okay', color: 'bg-amber-50 text-amber-800 border-amber-200' },
            { id: 'need_support', emoji: '😔', label: 'Need Support', color: 'bg-rose-50 text-rose-800 border-rose-200' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedMood(item.id);
                speakText(getMoodFeedback(item.id));
              }}
              className={`p-3.5 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center space-y-1.5 ${
                selectedMood === item.id
                  ? 'ring-2 ring-[#17665B] scale-105 shadow-md bg-white border-[#17665B]'
                  : `${item.color} hover:scale-102`
              }`}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <div className="p-3.5 rounded-2xl bg-[#E8F4F1] border border-[#BFDCD6] text-xs font-bold text-[#164E48] flex items-center space-x-2 animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 shrink-0 text-[#17665B]" />
            <span>{getMoodFeedback(selectedMood)}</span>
          </div>
        )}
      </Card>

      {/* ================= 4. TWO COLUMN: MY CHECKLIST & MEMORIES ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Checklist */}
        <Card className="p-6 space-y-4 bg-white border border-[#DDE7E3] rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDE7E3] pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-[#17665B]" />
                <h3 className="text-lg font-bold text-[#123B35]">{t('patient.checklistTitle') || 'My Daily Goals & Tasks'}</h3>
              </div>
              <Link href="/reminders" className="text-xs font-bold text-[#17665B] hover:underline">
                {t('common.viewAll') || `View All (${reminders.length})`}
              </Link>
            </div>

            <div className="space-y-3">
              {reminders.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#66736F] border border-dashed border-[#DDE7E3] rounded-2xl">
                  {t('patient.noActiveTasks') || 'No active tasks right now. Great job!'}
                </div>
              ) : (
                reminders.slice(0, 4).map((rem) => (
                  <div
                    key={rem.id}
                    onClick={() => toggleComplete(rem.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      rem.status === 'Completed'
                        ? 'bg-[#F5F8F6] border-[#DDE7E3] text-[#66736F] line-through'
                        : 'bg-[#BFDCD6]/20 border-[#BFDCD6] text-[#123B35] hover:bg-[#BFDCD6]/40'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-base">{rem.title}</p>
                      <p className="text-xs text-[#66736F]">
                        {rem.time} {rem.dosageOrDetails ? `• ${rem.dosageOrDetails}` : ''}
                      </p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      rem.status === 'Completed' ? 'bg-[#17665B] text-white' : 'border-2 border-[#17665B] text-transparent'
                    }`}>
                      <CheckCircle2 className="w-5 h-5 fill-current text-white" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => submitVoiceTurn('What should I do next?')}
            className="w-full py-2.5 rounded-2xl bg-[#BFDCD6]/30 text-[#17665B] font-bold text-xs flex items-center justify-center space-x-2 border border-[#BFDCD6] hover:bg-[#BFDCD6]/60 transition-colors shadow-2xs mt-2 active:scale-95"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ask AI: &ldquo;What should I do next?&rdquo;</span>
          </button>
        </Card>

        {/* Photo Memory Album Card */}
        <Card className="p-6 space-y-4 bg-white border border-[#DDE7E3] rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#DDE7E3] pb-3">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-[#C85C82]" />
                <h3 className="text-lg font-bold text-[#123B35]">{t('patient.photoAlbumTitle') || 'My Cherished Memories'}</h3>
              </div>
              <Link href="/memories" className="text-xs font-bold text-[#C85C82] hover:underline">
                {t('patient.openAlbum') || 'Open Album'}
              </Link>
            </div>

            {memories.length > 0 ? (
              <div className="space-y-3 pt-3">
                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-[#DDE7E3]">
                  <img
                    src={memories[0].imageUrl}
                    alt={memories[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                    <p className="font-extrabold text-base">{memories[0].title}</p>
                    <p className="text-xs text-white/90">{memories[0].location} • {memories[0].date}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => submitVoiceTurn(`Tell me about my memory: ${memories[0].title}`)}
                  className="w-full py-2.5 rounded-2xl bg-[#F7DDE5] text-[#C85C82] font-bold text-xs flex items-center justify-center space-x-2 hover:bg-[#f3cbd7] transition-colors shadow-2xs active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Talk about it</span>
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#66736F]">
                {t('patient.noPhotosYet') || 'No photo memories in album yet.'}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ================= 5. CAREGIVER CONNECTION & SAFETY CARD ================= */}
      <Card className="p-6 bg-gradient-to-r from-red-50 via-white to-red-50 border-2 border-red-200 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-[#17665B] text-white flex items-center justify-center text-xl font-extrabold shadow-md border-2 border-white">
              P
            </div>
            <span className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-extrabold text-[#123B35]">Priya (Daughter)</h3>
              <Badge variant="teal">My Caregiver</Badge>
            </div>
            <p className="text-xs text-[#66736F] font-semibold">
              Status: Available • Arriving home at 6:00 PM tonight
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setVoiceHugSent(true)}
            className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm ${
              voiceHugSent
                ? 'bg-pink-600 text-white'
                : 'bg-[#F7DDE5] text-[#C85C82] hover:bg-[#f3cbd7]'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{voiceHugSent ? '💖 Voice Hug Sent!' : 'Send Voice Hug'}</span>
          </button>

          <a
            href="tel:911"
            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2 shrink-0"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t('patient.callCaregiverNow') || 'Call Priya Now'}</span>
          </a>
        </div>
      </Card>

      {/* Real-time Voice Verification Action Modal */}
      <VoiceActionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        actionItem={activeModalAction}
      />
    </div>
  );
}

