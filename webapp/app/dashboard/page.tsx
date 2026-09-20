'use client';

import React from 'react';
import { PatientStatus } from '@/components/dashboard/PatientStatus';
import { TodaysCare } from '@/components/dashboard/TodaysCare';
import { RecentChanges } from '@/components/dashboard/RecentChanges';
import { CommandCenterCard } from '@/components/dashboard/CommandCenterCard';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { LiveSynapsePulseCard } from '@/components/dashboard/LiveSynapsePulseCard';
import { usePatientSummary } from '@/hooks/usePatientSummary';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/hooks/useLanguage';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { isPatient } = useUserRole();
  const { t } = useLanguage();
  const { data: summary, isLoading, error } = usePatientSummary();

  if (isPatient) {
    return <PatientDashboard />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#123B35]">
          {t('dashboard.greeting', { name: 'Priya' })}
        </h1>
        <p className="text-sm font-medium text-[#66736F]">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-[#E7A23B]/10 text-xs font-semibold text-[#123B35] border border-[#E7A23B]/30">
          {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Patient Status + Ask CogniTrace AI Command Center + Live Synapse Pulse Dyad Radar) */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <PatientStatus summary={summary} />
          )}

          {/* AI Voice Command Center Hero Card ("Ask CogniTrace Anything") */}
          <CommandCenterCard />

          {/* Live Synapse Pulse: Real-Time Dyad Health Radar & 30s Caregiver Reset */}
          <LiveSynapsePulseCard
            caregiverName="Priya"
            patientName="Sunita"
          />
        </div>

        {/* Right Column (Today's Care + Recent Changes) */}
        <div className="space-y-6">
          <TodaysCare />
          <RecentChanges changes={summary?.observedChanges} />
        </div>
      </div>
    </div>
  );
}
