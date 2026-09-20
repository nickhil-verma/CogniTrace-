'use client';

import React from 'react';
import { LiveSynapsePulseCard } from './LiveSynapsePulseCard';

export function CaregiverQuickTipsCard({
  caregiverName = 'Priya',
  patientName = 'Sunita'
}: {
  caregiverName?: string;
  patientName?: string;
  relation?: string;
  stage?: string;
}) {
  return (
    <LiveSynapsePulseCard
      caregiverName={caregiverName}
      patientName={patientName}
    />
  );
}
