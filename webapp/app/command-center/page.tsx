'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VoiceAssistantHub } from '@/components/command-center/VoiceAssistantHub';

function CommandCenterContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

  return (
    <VoiceAssistantHub
      initialQuery={initialQuery}
      showTimeline={true}
    />
  );
}

export default function CommandCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#66736F]">Loading Voice AI Assistant...</div>}>
      <CommandCenterContent />
    </Suspense>
  );
}
