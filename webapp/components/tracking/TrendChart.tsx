'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useLanguage } from '@/hooks/useLanguage';

const mockTrendData = [
  { month: 'Apr', memory: 82, communication: 88, independence: 78, careNeeds: 25 },
  { month: 'May', memory: 80, communication: 86, independence: 76, careNeeds: 28 },
  { month: 'Jun', memory: 81, communication: 87, independence: 75, careNeeds: 30 },
  { month: 'Jul', memory: 79, communication: 85, independence: 73, careNeeds: 32 },
  { month: 'Aug', memory: 78, communication: 86, independence: 72, careNeeds: 34 },
  { month: 'Sep', memory: 79, communication: 86, independence: 72, careNeeds: 33 },
];

export function TrendChart() {
  const { t } = useLanguage();

  return (
    <div className="w-full h-72 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#17665B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#17665B" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3E9C87" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3E9C87" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorIndep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C85C82" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#C85C82" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#DDE7E3" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#66736F"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#DDE7E3' }}
          />
          <YAxis
            stroke="#66736F"
            fontSize={11}
            domain={[50, 100]}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#DDE7E3',
              borderRadius: '16px',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(18,59,53,0.08)',
            }}
          />
          <Area
            type="monotone"
            dataKey="memory"
            name={t('tracking.legendMemory')}
            stroke="#17665B"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorMemory)"
          />
          <Area
            type="monotone"
            dataKey="communication"
            name={t('tracking.legendComm')}
            stroke="#3E9C87"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorComm)"
          />
          <Area
            type="monotone"
            dataKey="independence"
            name={t('tracking.legendIndep')}
            stroke="#C85C82"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorIndep)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
