'use client';

import React, { useEffect } from 'react';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/hooks/useLanguage';
import { VoiceOrb } from './VoiceOrb';
import { VoiceRecorder } from './VoiceRecorder';
import { SuggestedCommand } from './SuggestedCommand';
import { ActionConfirmation } from './ActionConfirmation';
import { AgentTimeline } from './AgentTimeline';
import { AgentAction } from './AgentAction';
import { VoiceActionModal } from './VoiceActionModal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Mic,
  Volume2,
  Cpu,
  Database,
  User,
  ShieldCheck,
  Activity,
  Heart,
  LineChart,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface VoiceAssistantHubProps {
  initialQuery?: string | null;
  role?: 'patient' | 'caregiver';
  showTimeline?: boolean;
  className?: string;
}

export function VoiceAssistantHub({
  initialQuery,
  role,
  showTimeline = true,
  className = ''
}: VoiceAssistantHubProps) {
  const { isPatient } = useUserRole();
  const { t } = useLanguage();

  const activeRole: 'patient' | 'caregiver' = role || (isPatient ? 'patient' : 'caregiver');

  const {
    voiceState,
    volumeLevel,
    permissionError,
    transcript,
    aiResponse,
    timeline,
    actions,
    activeModalAction,
    isModalOpen,
    closeModal,
    errorMessage,
    handleStartListening,
    handleStopListeningAndSubmit,
    submitVoiceTurn,
    triggerSuggestedCommand
  } = useVoiceAgent();

  // If component mounts with an initial query, run turn immediately
  useEffect(() => {
    if (initialQuery) {
      submitVoiceTurn(initialQuery);
    }
  }, [initialQuery, submitVoiceTurn]);

  const assistantTitle = activeRole === 'patient'
    ? 'Aria • Daily Voice Companion'
    : 'Aria • Caregiver Clinical Intelligence';

  const povDescription = activeRole === 'patient'
    ? 'Talk naturally to Aria about your daily checklist, cherished photo memories, or ask what you should do next.'
    : "Ask Aria about patient routine compliance, psychomotor telemetry, longitudinal trends, and portal actions performed by Sunita.";

  return (
    <div className={`space-y-6 max-w-4xl mx-auto select-none ${className}`}>
      {/* ================= ASSISTANT HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#164E48]/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#164E48] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-extrabold text-[#123B35] tracking-tight">{assistantTitle}</h2>
              <Badge variant={activeRole === 'patient' ? 'accent' : 'teal'}>
                {activeRole === 'patient' ? 'Patient POV' : 'Caregiver Analytics'}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-[#3D615B] leading-relaxed">
              {povDescription}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="inline-flex items-center space-x-2 bg-[#E8F4F1] border border-[#164E48]/15 px-3 py-1.5 rounded-full text-xs font-bold text-[#164E48] shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span>Aria Voice Engine Online</span>
        </div>
      </div>

      {/* ================= MAIN INTERACTIVE STAGE ================= */}
      <Card className="p-8 text-center bg-gradient-to-b from-white to-[#F5F8F6] border-2 border-[#164E48]/15 rounded-[2rem] shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Dynamic Voice Orb (Siri-like Interactive Element) */}
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

        {/* Live Speech Recognition & Decoding Display */}
        {transcript && (
          <div className="max-w-xl mx-auto bg-white p-5 rounded-2xl border border-[#164E48]/15 shadow-sm text-left space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-[#3D615B]">
              <span className="font-extrabold text-[#164E48] uppercase tracking-micro flex items-center">
                <Mic className="w-4 h-4 mr-1 text-[#10B981]" />
                Live Decoded Speech Transcript
              </span>
              <span className="text-[10px] bg-[#E8F4F1] text-[#164E48] px-2 py-0.5 rounded-full font-bold">
                STT Decoded
              </span>
            </div>
            <p className="text-base font-extrabold text-[#123B35] leading-snug">&ldquo;{transcript}&rdquo;</p>

            {/* Context badging */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#164E48]/10">
              <span className="inline-flex items-center text-[10px] font-bold bg-[#E8F4F1] text-[#164E48] px-2.5 py-0.5 rounded-full border border-[#164E48]/10">
                <Cpu className="w-3 h-3 mr-1 text-[#10B981]" />
                Intent: {activeRole === 'patient' ? 'Patient Personal Assistance' : 'Clinical Caregiver Telemetry'}
              </span>
              <span className="inline-flex items-center text-[10px] font-bold bg-[#E8F4F1] text-[#164E48] px-2.5 py-0.5 rounded-full border border-[#164E48]/10">
                <Database className="w-3 h-3 mr-1 text-[#10B981]" />
                RAG Context Synced
              </span>
            </div>
          </div>
        )}

        {/* AI Voice Response & Playback Feedback */}
        {aiResponse && (
          <div className="max-w-xl mx-auto bg-[#E8F4F1] p-5 rounded-2xl border border-[#164E48]/15 text-left space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-[#164E48]">
              <span className="font-extrabold flex items-center uppercase tracking-micro">
                <Sparkles className="w-4 h-4 mr-1.5 text-[#10B981]" />
                {activeRole === 'patient' ? 'Aria Response (Patient POV)' : 'Aria Response (Caregiver Insights)'}
              </span>
              <Volume2 className="w-4 h-4 text-[#164E48]" />
            </div>
            <ActionConfirmation responseText={aiResponse} />
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-rose-50 text-xs font-bold text-rose-800 border border-rose-200">
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

        {/* Role-Specific Suggested Commands */}
        <div className="max-w-xl mx-auto pt-3 text-left">
          <SuggestedCommand
            role={activeRole}
            onSelectCommand={triggerSuggestedCommand}
          />
        </div>
      </Card>

      {/* ================= REASONING TIMELINE & EXECUTED ACTIONS ================= */}
      {showTimeline && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Timeline */}
          <AgentTimeline timeline={timeline} />

          {/* Executed Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#164E48]/10 pb-2">
              <h4 className="text-base font-extrabold text-[#123B35]">Executed Care Actions</h4>
              <span className="text-xs font-bold text-[#3D615B]">{actions.length} tools executed</span>
            </div>

            {actions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#164E48]/15 p-8 text-center text-xs font-semibold text-[#3D615B] bg-white">
                No tool actions executed yet. Try speaking: &ldquo;{activeRole === 'patient' ? 'What should I do next?' : 'How is Mom doing today?'}&rdquo;
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
      )}

      {/* Real-Time Voice Verification Action Modal */}
      <VoiceActionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        actionItem={activeModalAction}
      />
    </div>
  );
}

// Alias export as AriaVoiceAssistant & VoiceAudioEngine
export const AriaVoiceAssistant = VoiceAssistantHub;
export const VoiceAudioEngine = VoiceAssistantHub;
