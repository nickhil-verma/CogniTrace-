'use client';

import React, { useState } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceState } from '@/types/agent';
import { useLanguage } from '@/hooks/useLanguage';

interface VoiceRecorderProps {
  voiceState: VoiceState;
  permissionError: string | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitTextPrompt: (text: string) => void;
}

export function VoiceRecorder({
  voiceState,
  permissionError,
  onSubmitTextPrompt
}: VoiceRecorderProps) {
  const [textInput, setTextInput] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onSubmitTextPrompt(textInput.trim());
    setTextInput('');
  };

  return (
    <div className="w-full space-y-4">
      {/* Microphone Permission Warning if needed */}
      {permissionError && (
        <div className="flex items-center gap-3 rounded-2xl bg-[#E7A23B]/10 p-3.5 text-xs text-[#123B35] border border-[#E7A23B]/30">
          <AlertTriangle className="w-4 h-4 text-[#E7A23B] shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Manual Input Form + Submit Button */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t('commandCenter.inputPlaceholder')}
          className="rounded-full bg-white shadow-xs border-[#DDE7E3] h-12 text-sm px-5"
          disabled={voiceState === 'PROCESSING' || voiceState === 'EXECUTING'}
        />
        <Button
          type="submit"
          variant="teal"
          size="icon"
          className="h-12 w-12 shrink-0 shadow-md"
          disabled={!textInput.trim() || voiceState === 'PROCESSING' || voiceState === 'EXECUTING'}
        >
          <Send className="w-5 h-5 text-white" />
        </Button>
      </form>
    </div>
  );
}
