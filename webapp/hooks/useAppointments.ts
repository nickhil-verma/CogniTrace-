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
          if (Array.isArray(parsed)) {
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

    const handleSync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setAppointments(parsed);
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('cognitrace_appointments_change', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('cognitrace_appointments_change', handleSync);
    };
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }
  }, [appointments, isLoaded]);

  const refreshAppointments = useCallback(async (): Promise<Appointment[]> => {
    try {
      const apiData = await api.getAppointments('patient_001');
      if (Array.isArray(apiData)) {
        setAppointments(apiData);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(apiData));
          window.dispatchEvent(new Event('cognitrace_appointments_change'));
        }
        return apiData;
      }
    } catch (e) {
      console.warn('Backend appointments fetch warning:', e);
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setAppointments(parsed);
              return parsed;
            }
          }
        } catch {
          // ignore
        }
      }
    }

    return appointments;
  }, [appointments]);

  const addAppointment = useCallback(async (newApt: Omit<Appointment, 'id'>) => {
    const item: Appointment = {
      ...newApt,
      id: `apt_${Date.now()}`
    };
    setAppointments((prev) => {
      const updated = [item, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('cognitrace_appointments_change'));
      }
      return updated;
    });

    try {
      await api.createAppointment(item);
    } catch (err) {
      console.warn('API sync appointment warning:', err);
    }
  }, []);

  const updateAppointment = useCallback(async (id: string, updatedFields: Partial<Appointment>) => {
    setAppointments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('cognitrace_appointments_change'));
      }
      return updated;
    });

    try {
      await api.updateAppointment(id, updatedFields);
    } catch (err) {
      console.warn('API update appointment warning:', err);
    }
  }, []);

  const cancelAppointment = useCallback(async (id: string) => {
    setAppointments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' as const } : a));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('cognitrace_appointments_change'));
      }
      return updated;
    });

    try {
      await api.updateAppointment(id, { status: 'Cancelled' });
    } catch (err) {
      console.warn('API cancel appointment warning:', err);
    }
  }, []);

  const deleteAppointment = useCallback(async (id: string) => {
    setAppointments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('cognitrace_appointments_change'));
      }
      return updated;
    });

    try {
      await api.deleteAppointment(id);
    } catch (err) {
      console.warn('API delete appointment warning:', err);
    }
  }, []);

  return {
    appointments,
    isLoaded,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
    refreshAppointments
  };
}
