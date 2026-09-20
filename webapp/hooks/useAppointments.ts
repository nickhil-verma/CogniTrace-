'use client';

import { useState, useEffect, useCallback } from 'react';
import { Appointment } from '@/types/appointment';
import { initialMockAppointments } from '@/lib/mock/appointments';
import { api } from '@/lib/api';

const STORAGE_KEY = 'cognitrace_appointments_v1';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialMockAppointments);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAppointments(parsed);
          }
        }

        const apiData = await api.getAppointments('patient_001');
        if (Array.isArray(apiData) && apiData.length > 0) {
          setAppointments(apiData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(apiData));
        }
      } catch (e) {
        console.warn('Backend appointments fetch warning:', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadAppointments();
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }
  }, [appointments, isLoaded]);

  const addAppointment = useCallback(async (newApt: Omit<Appointment, 'id'>) => {
    const item: Appointment = {
      ...newApt,
      id: `apt_${Date.now()}`
    };
    setAppointments((prev) => [item, ...prev]);

    try {
      await api.createAppointment(item);
    } catch (err) {
      console.warn('API sync appointment warning:', err);
    }
  }, []);

  const cancelAppointment = useCallback((id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
    );
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    appointments,
    isLoaded,
    addAppointment,
    cancelAppointment,
    deleteAppointment
  };
}
