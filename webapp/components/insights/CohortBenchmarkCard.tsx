'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Clock, Activity, ShieldCheck, Award } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface CohortBenchmarkCardProps {
  matchedCount?: number;
  stabilityIndex?: number;
  adherencePercentile?: number;
  recallLatencySeconds?: number;
  className?: string;
}

export function CohortBenchmarkCard({
  matchedCount = 1240,
  stabilityIndex = 94,
  adherencePercentile = 88,
  recallLatencySeconds = 2.4,
  className = ''
}: CohortBenchmarkCardProps) {
  const { t } = useLanguage();

  return (
    <Card className={`border-[#BFDCD6] bg-gradient-to-br from-white via-[#F5F8F6] to-[#EBF5F3] shadow-md relative overflow-hidden ${className}`}>
      {/* Decorative Clinical Grid Backdrop Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#17665B]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <CardHeader className="pb-4 border-b border-[#DDE7E3]/60 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="teal" className="text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                {t('insights.cohortBenchmark') || 'Comparative Health Cohort Baseline'}
              </Badge>
              <span className="text-[11px] font-bold text-[#17665B] flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Anonymized Clinical Cohort
              </span>
            </div>
            <CardTitle className="text-xl font-extrabold text-[#123B35] tracking-tight mt-2">
              Peer Cohort Evaluation & Performance Indices
            </CardTitle>
            <CardDescription className="text-xs text-[#66736F] mt-1 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1.5 text-[#17665B]" />
              {t('insights.cohortMatchedNote', { count: matchedCount.toLocaleString() }) ||
                `Matched with ${matchedCount.toLocaleString()} participants in similar age and cognitive assessment bands`}
            </CardDescription>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-[#BFDCD6] rounded-2xl px-4 py-2.5 text-right shadow-2xs">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#66736F] block">Cohort Status</span>
            <span className="text-xs font-extrabold text-[#17665B] flex items-center justify-end">
              <Award className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Top Quartile (Q1) Peer Group
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6 relative z-10">
        {/* 3 Research-Grade Normalized Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Metric 1: Cognitive Stability Index */}
          <div className="bg-white p-4 rounded-2xl border border-[#DDE7E3] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#66736F] flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1 text-[#17665B]" />
                {t('insights.cognitiveStabilityIndex') || 'Cognitive Stability Index'}
              </span>
              <span className="inline-flex items-center text-[10px] font-bold bg-[#17665B]/10 text-[#17665B] px-2 py-0.5 rounded-full">
                {t('insights.peerMedianDelta', { delta: 6 }) || '+6% vs median'}
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#123B35] tracking-tight">{stabilityIndex}</span>
              <span className="text-xs font-bold text-[#66736F]">/ 100</span>
            </div>

            {/* Progress Bar & Range Label */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#17665B] to-[#3E9C87] rounded-full" style={{ width: `${stabilityIndex}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-[#66736F]">
                <span>Peer Baseline: 88</span>
                <span className="text-[#17665B] font-bold">Stable Range</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Daily Routine Adherence Percentile */}
          <div className="bg-white p-4 rounded-2xl border border-[#DDE7E3] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#66736F] flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1 text-purple-600" />
                {t('insights.routineAdherence') || 'Routine Consistency Index'}
              </span>
              <span className="inline-flex items-center text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                High Consistency
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#123B35] tracking-tight">
                {t('insights.percentileRank', { percentile: adherencePercentile }) || `${adherencePercentile}th Percentile`}
              </span>
            </div>

            <div className="space-y-1">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" style={{ width: `${adherencePercentile}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-[#66736F]">
                <span>Peer Median: 50th</span>
                <span className="text-purple-700 font-bold">Top 12% Segment</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Memory Recall Response Latency */}
          <div className="bg-white p-4 rounded-2xl border border-[#DDE7E3] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#66736F] flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-teal-600" />
                {t('insights.memoryLatency') || 'Memory Recall Latency'}
              </span>
              <span className="inline-flex items-center text-[10px] font-bold bg-teal-100 text-[#17665B] px-2 py-0.5 rounded-full">
                -18% Response Time
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#123B35] tracking-tight">
                {t('insights.latencyValue', { seconds: recallLatencySeconds }) || `${recallLatencySeconds}s`}
              </span>
            </div>

            <div className="space-y-1">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: '82%' }} />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-[#66736F]">
                <span>Peer Avg: 3.1s</span>
                <span className="text-[#17665B] font-bold">Optimal Range</span>
              </div>
            </div>
          </div>

        </div>

        {/* Quartile Distribution Bar & Research Subtext */}
        <div className="bg-[#F5F8F6] p-4 rounded-2xl border border-[#DDE7E3] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-[#123B35]">
              Cohort Distribution (Quartile Breakdown)
            </span>
            <span className="text-[11px] font-semibold text-[#66736F]">
              Participant Metric Alignment: <strong className="text-[#17665B]">Quartile 1 (Top 15%)</strong>
            </span>
          </div>

          {/* Quartile Visual Bar */}
          <div className="grid grid-cols-4 gap-1.5 h-3">
            <div className="bg-[#17665B] rounded-l-full relative flex items-center justify-center">
              <span className="absolute -top-6 text-[9px] font-extrabold text-[#17665B]">Q1 (Top)</span>
            </div>
            <div className="bg-[#3E9C87]/40" />
            <div className="bg-slate-200" />
            <div className="bg-slate-200 rounded-r-full" />
          </div>

          <p className="text-[11px] font-medium text-[#66736F] leading-relaxed pt-1">
            {t('insights.researchSubtext') || 'Normalized against peer participants evaluated within the last 30 days.'} Observational metrics evaluate consistency in routine execution, verbal recall latency, and daily independence.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
