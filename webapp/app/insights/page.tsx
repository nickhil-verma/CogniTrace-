'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';

export default function InsightsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="teal">{t('insights.badge')}</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            {t('insights.title')}
          </h1>
          <p className="text-sm text-[#66736F]">
            {t('insights.subtitle')}
          </p>
        </div>
      </div>

      {/* AI Summary Card */}
      <Card className="card-hero p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#17665B]" />
            <h3 className="text-xl font-bold text-[#123B35]">{t('insights.askCareAi')}</h3>
          </div>
          <p className="text-sm text-[#66736F]">
            {t('insights.askCareAiDesc')}
          </p>
        </div>
        <Button
          variant="default"
          size="lg"
          onClick={() => router.push('/command-center?q=What%20changed%20recently%20in%20Mom%27s%20care%3F')}
          className="shadow-md shrink-0"
        >
          {t('insights.whatChangedRecently')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>

      {/* What Changed 6-Month Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#123B35]">{t('insights.sixMonthBreakdownTitle')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Badge variant="teal" className="w-fit">{t('insights.memoryObsTitle')}</Badge>
              <CardTitle className="text-lg font-bold text-[#123B35] pt-1">
                {t('insights.longTermMemoryActive')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#66736F]">
              <p className="leading-relaxed">
                {t('insights.memoryObsDesc')}
              </p>
              <div className="p-2.5 rounded-xl bg-[#F5F8F6] border border-[#DDE7E3] font-semibold text-[#123B35]">
                {t('insights.trendLongTermStable')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Badge variant="accent" className="w-fit">{t('insights.commObsTitle')}</Badge>
              <CardTitle className="text-lg font-bold text-[#123B35] pt-1">
                {t('insights.expressiveClear')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#66736F]">
              <p className="leading-relaxed">
                {t('insights.commObsDesc')}
              </p>
              <div className="p-2.5 rounded-xl bg-[#F5F8F6] border border-[#DDE7E3] font-semibold text-[#123B35]">
                {t('insights.trendHighEngagement')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Badge variant="warning" className="w-fit">{t('insights.dailyNeedsTitle')}</Badge>
              <CardTitle className="text-lg font-bold text-[#123B35] pt-1">
                {t('insights.guidedEveningRoutine')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#66736F]">
              <p className="leading-relaxed">
                {t('insights.dailyNeedsDesc')}
              </p>
              <div className="p-2.5 rounded-xl bg-[#F5F8F6] border border-[#DDE7E3] font-semibold text-[#123B35]">
                {t('insights.trendGuidedConsistent')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
