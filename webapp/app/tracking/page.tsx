'use client';

import React from 'react';
import { TrendChart } from '@/components/tracking/TrendChart';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function TrackingPage() {
  const { t } = useLanguage();

  const renderCategory = (cat: string) => {
    if (cat === 'Memory recall') return t('dashboard.memoryRecall');
    if (cat === 'Communication') return t('dashboard.communication');
    if (cat === 'Daily independence') return t('dashboard.dailyIndependence');
    return cat;
  };

  const renderStatus = (status: string) => {
    if (status === 'Stable') return t('common.stable');
    if (status === 'Slight support') return t('common.slightSupport');
    if (status === 'Active') return t('common.active');
    return status;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="teal">{t('tracking.badge')}</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            {t('tracking.title')}
          </h1>
          <p className="text-sm text-[#66736F]">
            {t('tracking.subtitle')}
          </p>
        </div>
      </div>

      {/* Stage Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-[#17665B]">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-[#66736F]">{t('tracking.currentAssessment')}</CardDescription>
            <CardTitle className="text-2xl font-bold text-[#123B35]">{t('tracking.currentStageValue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {t('tracking.currentAssessmentDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-[#66736F]">{t('tracking.previousAssessment')}</CardDescription>
            <CardTitle className="text-xl font-bold text-[#66736F]">{t('tracking.previousStageValue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {t('tracking.previousAssessmentDesc')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#BFDCD6]/20 border-[#BFDCD6]">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-[#17665B]">{t('tracking.careNeedSummary')}</CardDescription>
            <CardTitle className="text-xl font-bold text-[#123B35]">{t('tracking.supportPatternStable')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#123B35] leading-relaxed">
              {t('tracking.careNeedSummaryDesc')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Recharts Visual Area */}
      <Card className="p-6">
        <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-[#123B35]">{t('tracking.sixMonthTrendTitle')}</CardTitle>
            <CardDescription className="text-xs text-[#66736F]">
              {t('tracking.sixMonthTrendSubtitle')}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold mt-3 md:mt-0">
            <span className="flex items-center text-[#17665B]">
              <span className="w-3 h-3 rounded-full bg-[#17665B] mr-1.5" /> {t('tracking.legendMemory')}
            </span>
            <span className="flex items-center text-[#3E9C87]">
              <span className="w-3 h-3 rounded-full bg-[#3E9C87] mr-1.5" /> {t('tracking.legendComm')}
            </span>
            <span className="flex items-center text-[#C85C82]">
              <span className="w-3 h-3 rounded-full bg-[#C85C82] mr-1.5" /> {t('tracking.legendIndep')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <TrendChart />
        </CardContent>
      </Card>

      {/* Observation Categories Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#123B35]">{t('tracking.recentLogTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Memory recall', detail: 'Recognized old photographs from 1987 instantly during tea time.', status: 'Stable' },
              { label: 'Communication', detail: 'Expressed preferences for lunch clearly with gentle pacing.', status: 'Stable' },
              { label: 'Daily independence', detail: 'Needed verbal guidance for evening medication tablet.', status: 'Slight support' },
              { label: 'Activity pattern', detail: 'Enjoyed 20-minute neighborhood walk with caregiver.', status: 'Active' }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#F5F8F6] border border-[#DDE7E3] space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#123B35]">
                  <span>{renderCategory(item.label)}</span>
                  <Badge variant="default">{renderStatus(item.status)}</Badge>
                </div>
                <p className="text-xs text-[#66736F]">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#123B35]">{t('tracking.careGuidanceTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-[#66736F] leading-relaxed">
            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#F7DDE5]/40 border border-[#F7DDE5]">
              <Info className="w-5 h-5 text-[#C85C82] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#123B35]">{t('tracking.obsMethodology')}</span>
                <p className="mt-1">
                  {t('tracking.obsMethodologyDesc')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-[#DDE7E3] space-y-2">
              <span className="font-bold text-[#123B35]">{t('tracking.recommendedNextSteps')}</span>
              <ul className="list-disc pl-4 space-y-1 text-[#66736F]">
                <li>{t('tracking.step1')}</li>
                <li>{t('tracking.step2')}</li>
                <li>{t('tracking.step3')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
