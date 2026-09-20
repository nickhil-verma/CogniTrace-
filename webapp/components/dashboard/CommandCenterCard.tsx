'use client';

import React from 'react';
import { VoiceOrb } from '@/components/command-center/VoiceOrb';
import { SuggestedCommand } from '@/components/command-center/SuggestedCommand';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function CommandCenterCard() {
  const router = useRouter();
  const { voiceState, handleStartListening, handleStopListeningAndSubmit } = useVoiceAgent();
  const { t } = useLanguage();

  return (
    <div className="rounded-3xl border border-[#DDE7E3] bg-gradient-to-b from-white via-[#F5F8F6] to-white p-6 shadow-md space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-[#BFDCD6] text-[#123B35]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#123B35]">{t('dashboard.askCogniTraceTitle') || 'Ask CogniTrace Anything'}</h3>
            <p className="text-xs text-[#66736F]">{t('dashboard.aiVoiceCenterActive') || 'AI Voice Command Center active'}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/command-center')}
          className="text-xs text-[#17665B] font-semibold"
        >
          {t('dashboard.fullCommandCenter') || 'Full Command Center'}
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      <div className="py-2 flex justify-center">
        <VoiceOrb
          state={voiceState}
          onClick={() => {
            if (voiceState === 'LISTENING') {
              handleStopListeningAndSubmit();
            } else {
              handleStartListening();
            }
          }}
        />
      </div>

      <SuggestedCommand
        onSelectCommand={(cmd) => {
          router.push(`/command-center?q=${encodeURIComponent(cmd)}`);
        }}
      />
    </div>
  );
}
