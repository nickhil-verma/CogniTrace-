'use client';

import { useState, useEffect, useCallback } from 'react';
import { Reminder } from '@/types/reminder';
import { initialMockReminders } from '@/lib/mock/reminders';
import { api } from '@/lib/api';

const STORAGE_KEY = 'cognitrace_reminders_v1';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);


  // Load from backend DynamoDB API & localStorage on mount
  useEffect(() => {
    async function loadReminders() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReminders(parsed);
          }
        }
        
        // Fetch fresh reminders from DynamoDB API
        const apiData = await api.getReminders('patient_001');
        if (Array.isArray(apiData) && apiData.length > 0) {
          setReminders(apiData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(apiData));
        }
      } catch (e) {
        console.warn('Backend reminders fetch warning, using stored state:', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadReminders();
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

    // Send to backend DynamoDB API asynchronously
    try {
      await api.createReminder(item);
    } catch (err) {
      console.warn('API create reminder warning:', err);
    }
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Completed' ? 'Upcoming' : 'Completed' } : r
      )
    );

    try {
      await api.toggleReminder(id, 'patient_001');
    } catch (err) {
      console.warn('API toggle reminder warning:', err);
    }
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    try {
      await api.post(`/v1/caretaker/reminders/${id}`, {});
    } catch (e) {}
  }, []);

  return {
    reminders,
    isLoaded,
    addReminder,
    toggleComplete,
    deleteReminder
  };
}
