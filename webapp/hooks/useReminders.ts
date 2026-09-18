'use client';

import { useState, useEffect, useCallback } from 'react';
import { Reminder } from '@/types/reminder';
import { initialMockReminders } from '@/lib/mock/reminders';
import { api } from '@/lib/api';

const STORAGE_KEY = 'cognitrace_reminders_v1';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(initialMockReminders);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setReminders(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse saved reminders', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    }
  }, [reminders, isLoaded]);

  const addReminder = useCallback(async (newReminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    const item: Reminder = {
      ...newReminder,
      id: `rem_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setReminders((prev) => [item, ...prev]);

    // Send to backend API asynchronously
    try {
      await api.post('/v1/caretaker/reminders', item);
    } catch (err) {
      console.warn('API sync reminder warning:', err);
    }
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
    isLoaded,
    addReminder,
    toggleComplete,
    deleteReminder
  };
}
