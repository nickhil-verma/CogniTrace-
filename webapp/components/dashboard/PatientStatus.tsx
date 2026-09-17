'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Activity, Calendar } from 'lucide-react';
import { PatientSummary } from '@/types/patient';

interface PatientStatusProps {
  summary: PatientSummary | null;
}

export function PatientStatus({ summary }: PatientStatusProps) {
  const patient = summary || {
    name: 'Mom',
    currentStage: 'Middle Stage',
    stageDescription: 'Needs slightly more support than last month',
    lastUpdated: 'Today at 9:30 AM'
  };

  return (
    <Card className="border-l-4 border-l-[#17665B] bg-gradient-to-br from-white to-[#F5F8F6]/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardDescription className="text-xs font-semibold tracking-wider text-[#66736F] uppercase">
            Care Journey Overview
          </CardDescription>
          <CardTitle className="text-2xl font-bold text-[#123B35]">
            {patient.name}’s Care Journey
          </CardTitle>
        </div>
        <div className="p-3 rounded-2xl bg-[#BFDCD6]/40 text-[#17665B]">
          <Heart className="w-6 h-6" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="teal" className="px-3.5 py-1 text-sm font-semibold">
            Current Stage: {patient.currentStage}
          </Badge>
          <span className="text-xs text-[#66736F] flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Updated {patient.lastUpdated}
          </span>
        </div>

        <p className="text-sm text-[#123B35] font-medium leading-relaxed bg-white p-3.5 rounded-2xl border border-[#DDE7E3]">
          "{patient.stageDescription}"
        </p>

        <div className="flex items-center space-x-2 text-xs text-[#66736F]">
          <Activity className="w-4 h-4 text-[#3E9C87]" />
          <span>Observational care insights updated via daily caregiver journal & voice check-ins.</span>
        </div>
      </CardContent>
    </Card>
  );
}
