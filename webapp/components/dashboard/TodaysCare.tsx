'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill, Calendar, CheckSquare, Clock } from 'lucide-react';

export function TodaysCare() {
  const items = [
    {
      title: 'Donepezil Medication',
      time: '8:00 PM Tonight',
      type: 'Medication',
      icon: <Pill className="w-5 h-5 text-[#17665B]" />,
      status: 'Upcoming',
      badgeVariant: 'teal' as const
    },
    {
      title: 'Dr. Anita Sharma Neurologist Evaluation',
      time: 'Tomorrow, 10:30 AM',
      type: 'Doctor appointment',
      icon: <Calendar className="w-5 h-5 text-[#3E9C87]" />,
      status: 'Tomorrow',
      badgeVariant: 'accent' as const
    },
    {
      title: 'Daily Evening Memory & Vitals Check',
      time: 'Due Today',
      type: 'Cognitive check',
      icon: <CheckSquare className="w-5 h-5 text-[#C85C82]" />,
      status: 'Due Today',
      badgeVariant: 'pink' as const
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-xl font-bold text-[#123B35]">
          Today’s Care Schedule
        </CardTitle>
        <span className="text-xs text-[#66736F] font-medium flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1" />
          3 active care tasks
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5F8F6] border border-[#DDE7E3] hover:border-[#BFDCD6] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white shadow-2xs">
                {item.icon}
              </div>
              <div>
                <h5 className="text-sm font-bold text-[#123B35]">{item.title}</h5>
                <p className="text-xs text-[#66736F]">{item.time}</p>
              </div>
            </div>
            <Badge variant={item.badgeVariant}>{item.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
