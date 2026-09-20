'use client';

import { useState, useEffect } from 'react';

export interface PatientSettings {
  patientName: string;
  patientPhone: string;
  emergencyContact: string;
  localAddress: string;
  hospitalName: string;
  hospitalContact: string;
}

const STORAGE_KEY = 'cognitrace_patient_settings';

export const defaultPatientSettings: PatientSettings = {
  patientName: 'Mom (Sunita Sharma)',
  patientPhone: '+1 (555) 234-5678',
  emergencyContact: '+1 (555) 911-0099',
  localAddress: '452 Oak Ridge Lane, Sector 4, New Delhi',
  hospitalName: 'City Care General Hospital',
  hospitalContact: '+1 (555) 800-4357',
};

export function usePatientSettings() {
  const [settings, setSettings] = useState<PatientSettings>(defaultPatientSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load patient settings', e);
    }
    setMounted(true);
  }, []);

  const updateSettings = (newSettings: Partial<PatientSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('patient_settings_updated'));
    } catch (e) {
      console.error('Failed to save patient settings', e);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch (e) {}
    };

    window.addEventListener('patient_settings_updated', handleUpdate);
    return () => window.removeEventListener('patient_settings_updated', handleUpdate);
  }, []);

  return { settings, updateSettings, mounted };
}
