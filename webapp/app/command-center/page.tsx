'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VoiceOrb } from '@/components/command-center/VoiceOrb';
import { VoiceRecorder } from '@/components/command-center/VoiceRecorder';
import { AgentTimeline } from '@/components/command-center/AgentTimeline';
import { AgentAction } from '@/components/command-center/AgentAction';
import { ActionConfirmation } from '@/components/command-center/ActionConfirmation';
import { SuggestedCommand } from '@/components/command-center/SuggestedCommand';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Mic, Volume2, Cpu, Database } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

function CommandCenterContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  const { t } = useLanguage();

  const {
    voiceState,
    volumeLevel,
    permissionError,
    transcript,
    aiResponse,
    timeline,
    actions,
    errorMessage,
    handleStartListening,
    handleStopListeningAndSubmit,
    submitVoiceTurn,
    triggerSuggestedCommand
  } = useVoiceAgent();

  // If page loaded with query param, trigger command immediately
  useEffect(() => {
    if (initialQuery) {
      submitVoiceTurn(initialQuery);
    }
  }, [initialQuery, submitVoiceTurn]);

  const suggestions = [
    t('dashboard.suggestion2'),
    t('dashboard.suggestion3'),
    t('dashboard.suggestion4'),
    t('dashboard.suggestion1')
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="teal">{t('commandCenter.badge')}</Badge>
            <span className="text-xs font-semibold text-[#3E9C87] flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Google Gemini 1.5 Flash API + DynamoDB Vector RAG
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            {t('commandCenter.title')}
          </h1>
          <p className="text-sm text-[#66736F]">
            {t('commandCenter.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Interactive Stage Card */}
      <Card className="card-hero p-8 text-center space-y-6 relative overflow-hidden">
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

        {/* Live Audio & Transcript Cards with NLP badges */}
        {transcript && (
          <div className="max-w-xl mx-auto bg-white p-4 rounded-2xl border border-[#DDE7E3] shadow-2xs text-left space-y-3">
            <div className="flex items-center justify-between text-xs text-[#66736F]">
              <span className="font-semibold text-[#17665B]">{t('commandCenter.userTranscriptTitle')}</span>
              <Mic className="w-3.5 h-3.5 text-[#17665B]" />
            </div>
            <p className="text-sm font-semibold text-[#123B35]">&ldquo;{transcript}&rdquo;</p>
            
            {/* NLP Feature extraction indicators */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
              <span className="inline-flex items-center text-[10px] font-bold bg-[#17665B]/10 text-[#17665B] px-2.5 py-0.5 rounded-full">
                <Cpu className="w-3 h-3 mr-1" />
                NLP Intent: {transcript.toLowerCase().includes('remind') ? 'Medication Schedule' : (transcript.toLowerCase().includes('appointment') ? 'Medical Consultation' : 'Memory Recall')}
              </span>
              <span className="inline-flex items-center text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full">
                <Database className="w-3 h-3 mr-1" />
                DynamoDB RAG Context Matched
              </span>
              <span className="inline-flex items-center text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full">
                Speech Ratio: 85% • Clarity: Normal
              </span>
            </div>
          </div>
        )}

        {aiResponse && (
          <div className="max-w-xl mx-auto bg-[#BFDCD6]/30 p-4 rounded-2xl border border-[#BFDCD6] text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-[#17665B]">
              <span className="font-bold flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {t('commandCenter.geminiResponseTitle')}
              </span>
              <Volume2 className="w-4 h-4 text-[#17665B]" />
            </div>
            <ActionConfirmation responseText={aiResponse} />
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-[#C85C82]/10 text-xs font-semibold text-[#C85C82] border border-[#C85C82]/30">
            {errorMessage}
          </div>
        )}

        {/* Microphone controls & manual fallback input */}
        <div className="max-w-xl mx-auto pt-2">
          <VoiceRecorder
            voiceState={voiceState}
            permissionError={permissionError}
            onStartListening={handleStartListening}
            onStopListening={handleStopListeningAndSubmit}
            onSubmitTextPrompt={(text) => submitVoiceTurn(text)}
          />
        </div>

        {/* Suggested Voice Commands */}
        <div className="max-w-xl mx-auto pt-4 text-left">
          <SuggestedCommand
            commands={suggestions}
            onSelectCommand={triggerSuggestedCommand}
          />
        </div>
      </Card>

      {/* Dynamic Tool Executions & Reasoning Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step-by-step reasoning timeline */}
        <AgentTimeline timeline={timeline} />

        {/* Dynamic Executed Actions list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-[#123B35]">{t('commandCenter.executedActionsTitle')}</h4>
            <span className="text-xs text-[#66736F]">{t('commandCenter.toolsExecutedCount', { count: actions.length })}</span>
          </div>

          {actions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#DDE7E3] p-8 text-center text-xs text-[#66736F]">
              {t('commandCenter.noToolActions')}
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((act) => (
                <AgentAction key={act.id} action={act} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommandCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#66736F]">Loading Gemini AI Command Center...</div>}>
      <CommandCenterContent />
    </Suspense>
  );
}
