'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { ObservedChange } from '@/types/patient';
import { useLanguage } from '@/hooks/useLanguage';

interface RecentChangesProps {
  changes?: ObservedChange[];
}

export function RecentChanges({ changes }: RecentChangesProps) {
  const { t } = useLanguage();

  const defaultChanges: ObservedChange[] = [
    {
      id: '1',
      category: 'Memory recall',
      status: 'Stable',
      note: 'Vivid long-term recall during evening photo conversations.',
      lastObserved: 'Yesterday',
      trend: 'stable'
    },
    {
      id: '2',
      category: 'Communication',
      status: 'Stable',
      note: 'Speaks comfortably with family; occasional word-finding pause.',
      lastObserved: '2 days ago',
      trend: 'stable'
    },
    {
      id: '3',
      category: 'Daily independence',
      status: 'Needs slight support',
      note: 'Benefits from verbal prompt for evening routine and hydration.',
      lastObserved: 'Today',
      trend: 'stable'
    }
  ];

  const items = changes || defaultChanges;

  const renderCategory = (cat: string) => {
    if (cat === 'Memory recall') return t('dashboard.memoryRecall');
    if (cat === 'Communication') return t('dashboard.communication');
    if (cat === 'Daily independence') return t('dashboard.dailyIndependence');
    return cat;
  };

  const renderStatus = (status: string) => {
    if (status === 'Stable') return t('common.stable');
    if (status === 'Needs slight support') return t('common.slightSupport');
    return status;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-[#123B35]">
              {t('dashboard.observedChangesTitle')}
            </CardTitle>
            <CardDescription className="text-xs text-[#66736F]">
              {t('dashboard.observedChangesSubtitle')}
            </CardDescription>
          </div>
          <div className="p-2 rounded-xl bg-[#F7DDE5] text-[#C85C82]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-white border border-[#DDE7E3] space-y-1.5 hover:border-[#17665B]/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#123B35]">
                {renderCategory(item.category)}
              </span>
              <Badge
                variant={
                  item.status === 'Stable'
                    ? 'default'
                    : item.status === 'Needs slight support'
                    ? 'warning'
                    : 'accent'
                }
              >
                {renderStatus(item.status)}
              </Badge>
            </div>
            <p className="text-xs text-[#66736F] leading-relaxed">{item.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
