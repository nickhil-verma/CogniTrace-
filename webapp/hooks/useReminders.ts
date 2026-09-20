'use client';

import { useState, useEffect, useCallback } from 'react';
import { Reminder, ReminderStatus } from '@/types/reminder';
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
        let loadedFromStorage = false;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setReminders(parsed);
              loadedFromStorage = true;
            }
          } catch (e) {
            console.warn('Failed to parse stored reminders:', e);
          }
        }
        
        // Fetch fresh reminders from DynamoDB API
        const apiData = await api.getReminders('patient_001');
        if (Array.isArray(apiData)) {
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

    setReminders((prev) => {
      const updated = [item, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    // Send to backend DynamoDB API asynchronously
    try {
      await api.createReminder(item);
    } catch (err) {
      console.warn('API create reminder warning:', err);
    }
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    setReminders((prev) => {
      const updated = prev.map((r) => {
        if (r.id === id) {
          const nextStatus: ReminderStatus = r.status === 'Completed' ? 'Upcoming' : 'Completed';
          return { ...r, status: nextStatus };
        }
        return r;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    try {
      await api.toggleReminder(id, 'patient_001');
    } catch (err) {
      console.warn('API toggle reminder warning:', err);
    }
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    setReminders((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    try {
      await api.deleteReminder(id, 'patient_001');
    } catch (e) {
      console.warn('API delete reminder error:', e);
    }
  }, []);

  return {
    reminders,
    isLoaded,
    addReminder,
    toggleComplete,
    deleteReminder
  };
}
