'use client';

import { useState, useCallback } from 'react';
import { Reminder } from '@/types/reminder';
import { initialMockReminders } from '@/lib/mock/reminders';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(initialMockReminders);
  const [isLoading, setIsLoading] = useState(false);

  const addReminder = useCallback((newReminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    const item: Reminder = {
      ...newReminder,
      id: `rem_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReminders((prev) => [item, ...prev]);
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Completed' ? 'Upcoming' : 'Completed' } : r
      )
    );
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
    reminders,
    isLoading,
    addReminder,
    toggleComplete,
    deleteReminder
  };
}
