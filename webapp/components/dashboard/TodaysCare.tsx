'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill, Clock, CheckCircle2, Bell } from 'lucide-react';
import { useReminders } from '@/hooks/useReminders';

export function TodaysCare() {
  const { reminders, toggleComplete } = useReminders();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-xl font-bold text-[#123B35]">
          Today’s Care Schedule
        </CardTitle>
        <span className="text-xs text-[#66736F] font-medium flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1" />
          {reminders.length} active care tasks
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#66736F] border border-dashed border-[#DDE7E3] rounded-2xl">
            No reminders scheduled yet. Create one or ask AI Voice Assistant to schedule a reminder.
          </div>
        ) : (
          reminders.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => toggleComplete(item.id)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                item.status === 'Completed'
                  ? 'bg-[#F5F8F6] border-[#DDE7E3] opacity-75'
                  : 'bg-white border-[#DDE7E3] hover:border-[#BFDCD6]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#F5F8F6] shadow-2xs">
                  {item.category === 'Medication' ? (
                    <Pill className="w-5 h-5 text-[#17665B]" />
                  ) : (
                    <Bell className="w-5 h-5 text-[#3E9C87]" />
                  )}
                </div>
                <div>
                  <h5 className={`text-sm font-bold ${item.status === 'Completed' ? 'line-through text-[#66736F]' : 'text-[#123B35]'}`}>
                    {item.title}
                  </h5>
                  <p className="text-xs text-[#66736F]">{item.time} • {item.date || 'Today'}</p>
                </div>
              </div>
              <Badge variant={item.status === 'Completed' ? 'teal' : 'accent'}>
                {item.status}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
