'use client';

import { useState, useEffect } from 'react';
import { PatientSummary } from '@/types/patient';
import { api } from '@/lib/api';
import { mockPatientSummary } from '@/lib/mock/patient';

export function usePatientSummary() {
  const [data, setData] = useState<PatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSummary() {
      try {
        setIsLoading(true);
        const res = await api.getPatientSummary();
        if (isMounted) {
          setData(res);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setData(mockPatientSummary);
          setError('Could not refresh backend summary. Displaying offline care summary.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
