'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Minus, ShieldAlert, Sparkles } from 'lucide-react';
import { ObservedChange } from '@/types/patient';

interface RecentChangesProps {
  changes?: ObservedChange[];
}

export function RecentChanges({ changes }: RecentChangesProps) {
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-[#123B35]">
              Observed Changes & Care Trends
            </CardTitle>
            <CardDescription className="text-xs text-[#66736F]">
              Neutral care notes & recent daily patterns
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
              <span className="text-sm font-bold text-[#123B35]">{item.category}</span>
              <Badge
                variant={
                  item.status === 'Stable'
                    ? 'default'
                    : item.status === 'Needs slight support'
                    ? 'warning'
                    : 'accent'
                }
              >
                {item.status}
              </Badge>
            </div>
            <p className="text-xs text-[#66736F] leading-relaxed">{item.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
