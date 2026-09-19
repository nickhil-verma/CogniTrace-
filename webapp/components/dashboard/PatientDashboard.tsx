'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Mic, Heart, Image as ImageIcon, Bell, CheckCircle2, PhoneCall, Sparkles } from 'lucide-react';
import { useReminders } from '@/hooks/useReminders';
import { useMemories } from '@/hooks/useMemories';
import { useLanguage } from '@/hooks/useLanguage';

export function PatientDashboard() {
  const { reminders, toggleComplete } = useReminders();
  const { memories } = useMemories();
  const { t } = useLanguage();

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Patient Welcome Banner */}
      <Card className="p-8 bg-gradient-to-r from-[#E36C59] via-[#C85C82] to-[#17665B] text-white rounded-3xl shadow-lg relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold">
            <Heart className="w-4 h-4 fill-current text-white animate-pulse" />
            <span>{t('patient.dailyCompanion')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t('patient.greeting')}
          </h1>
          <p className="text-base text-white/90 font-medium">
            {t('patient.description')}
          </p>
        </div>
      </Card>

      {/* Giant Voice Assistant Button */}
      <Card className="p-8 text-center bg-white border-2 border-[#BFDCD6] rounded-3xl shadow-md space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#123B35]">{t('patient.talkWithVoiceAI')}</h2>
          <p className="text-sm text-[#66736F]">{t('patient.tapBelowAndSpeak')}</p>
        </div>

        <Link
          href="/command-center"
          className="inline-flex flex-col items-center group py-4"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#17665B] to-[#3E9C87] text-white flex items-center justify-center shadow-2xl group-hover:scale-105 group-active:scale-95 transition-all duration-300 border-4 border-[#BFDCD6]">
            <Mic className="w-10 h-10 text-white animate-pulse" />
          </div>
          <span className="mt-3 text-base font-bold text-[#17665B] bg-[#BFDCD6]/30 px-4 py-1.5 rounded-full border border-[#BFDCD6]">
            {t('patient.tapToSpeak')}
          </span>
        </Link>
      </Card>

      {/* Two Column Layout for Reminders & Memories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Checklist */}
        <Card className="p-6 space-y-4 bg-white border border-[#DDE7E3] rounded-3xl">
          <div className="flex items-center justify-between border-b border-[#DDE7E3] pb-3">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-[#17665B]" />
              <h3 className="text-lg font-bold text-[#123B35]">{t('patient.checklistTitle')}</h3>
            </div>
            <Link href="/reminders" className="text-xs font-bold text-[#17665B] hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>

          <div className="space-y-3">
            {reminders.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#66736F] border border-dashed border-[#DDE7E3] rounded-2xl">
                {t('patient.noActiveTasks')}
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
                    <p className="text-xs text-[#66736F]">{rem.time}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    rem.status === 'Completed' ? 'bg-[#17665B] text-white' : 'border-2 border-[#17665B] text-transparent'
                  }`}>
                    <CheckCircle2 className="w-5 h-5 fill-current text-white" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Photo Memory Album Card */}
        <Card className="p-6 space-y-4 bg-white border border-[#DDE7E3] rounded-3xl">
          <div className="flex items-center justify-between border-b border-[#DDE7E3] pb-3">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-[#C85C82]" />
              <h3 className="text-lg font-bold text-[#123B35]">{t('patient.photoAlbumTitle')}</h3>
            </div>
            <Link href="/memories" className="text-xs font-bold text-[#C85C82] hover:underline">
              {t('patient.openAlbum')}
            </Link>
          </div>

          {memories.length > 0 ? (
            <div className="space-y-3">
              <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={memories[0].imageUrl}
                  alt={memories[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                  <p className="font-bold text-base">{memories[0].title}</p>
                  <p className="text-xs text-white/80">{memories[0].location} • {memories[0].date}</p>
                </div>
              </div>
              <Link
                href={`/command-center?q=${encodeURIComponent(memories[0].reminiscencePrompt || memories[0].title)}`}
                className="w-full py-2.5 rounded-2xl bg-[#F7DDE5] text-[#C85C82] font-bold text-xs flex items-center justify-center space-x-2 hover:bg-[#f3cbd7] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('patient.talkAboutPhoto')}</span>
              </Link>
            </div>
          ) : (
            <p className="text-xs text-[#66736F]">{t('patient.noPhotosYet')}</p>
          )}
        </Card>
      </div>

      {/* Big Emergency Contact Call Button */}
      <Card className="p-6 bg-red-50 border-2 border-red-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-extrabold text-red-900">{t('patient.emergencyHelpTitle')}</h3>
          <p className="text-xs text-red-700">{t('patient.emergencyHelpSubtitle')}</p>
        </div>
        <a
          href="tel:911"
          className="px-6 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-md hover:bg-red-700 transition-colors flex items-center space-x-2 shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{t('patient.callCaregiverNow')}</span>
        </a>
      </Card>
    </div>
  );
}
