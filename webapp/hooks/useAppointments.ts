'use client';

import { useState, useCallback } from 'react';
import { Appointment } from '@/types/appointment';
import { initialMockAppointments } from '@/lib/mock/appointments';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialMockAppointments);
  const [isLoading, setIsLoading] = useState(false);

  const addAppointment = useCallback((newApt: Omit<Appointment, 'id'>) => {
    const item: Appointment = {
      ...newApt,
      id: `apt_${Date.now()}`
    };
    setAppointments((prev) => [item, ...prev]);
  }, []);

  const cancelAppointment = useCallback((id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
    );
  }, []);

  return {
    appointments,
    isLoading,
    addAppointment,
    cancelAppointment
  };
}
