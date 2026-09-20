'use client';

import React from 'react';
import { VoiceState } from '@/types/agent';
import { AssistantOrb } from './AssistantOrb';

interface VoiceOrbProps {
  state: VoiceState;
  volumeLevel?: number;
  onClick?: () => void;
  transcript?: string;
  response?: string;
}

export function VoiceOrb({ state, volumeLevel = 0, onClick, transcript, response }: VoiceOrbProps) {
  return (
    <AssistantOrb
      state={state}
      volumeLevel={volumeLevel}
      onClick={onClick}
      transcript={transcript}
      response={response}
    />
  );
}

