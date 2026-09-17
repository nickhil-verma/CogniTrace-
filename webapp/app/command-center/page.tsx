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
import { Sparkles, Mic, Volume2 } from 'lucide-react';

function CommandCenterContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

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
    'Remind Mom to take her medicine at 8 tonight.',
    'Check recent changes in Mom’s memory.',
    'Show upcoming doctor appointments.',
    'Tell me about Goa family vacation memory.'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="teal">Primary Feature</Badge>
            <span className="text-xs font-semibold text-[#3E9C87] flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              AWS Bedrock Claude & Polly Backend API Contract
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            CogniTrace AI Command Center
          </h1>
          <p className="text-sm text-[#66736F]">
            How can I help with care today? Speak or type your request naturally.
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

        {/* Live Audio & Transcript Cards */}
        {transcript && (
          <div className="max-w-xl mx-auto bg-white p-4 rounded-2xl border border-[#DDE7E3] shadow-2xs text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-[#66736F]">
              <span className="font-semibold text-[#17665B]">User Transcript</span>
              <Mic className="w-3.5 h-3.5 text-[#17665B]" />
            </div>
            <p className="text-sm font-semibold text-[#123B35]">"{transcript}"</p>
          </div>
        )}

        {aiResponse && (
          <div className="max-w-xl mx-auto bg-[#BFDCD6]/30 p-4 rounded-2xl border border-[#BFDCD6] text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-[#17665B]">
              <span className="font-bold">CogniTrace Agent Response</span>
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
            <h4 className="text-base font-bold text-[#123B35]">Executed Tool Actions</h4>
            <span className="text-xs text-[#66736F]">{actions.length} tools executed</span>
          </div>

          {actions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#DDE7E3] p-8 text-center text-xs text-[#66736F]">
              No tool actions executed yet. Try saying: "Remind Mom to take her medicine at 8 tonight."
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
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#66736F]">Loading AI Command Center...</div>}>
      <CommandCenterContent />
    </Suspense>
  );
}
