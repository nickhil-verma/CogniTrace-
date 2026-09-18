'use client';

import { useState, useEffect, useCallback } from 'react';

export type UserRole = 'patient' | 'caregiver';

export function useUserRole() {
  const [role, setRoleState] = useState<UserRole>('caregiver');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cognitrace_user_role') as UserRole | null;
    if (saved === 'patient' || saved === 'caregiver') {
      setRoleState(saved);
    }
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cognitrace_user_role', newRole);
    }
  }, []);

  const toggleRole = useCallback(() => {
    setRole(role === 'caregiver' ? 'patient' : 'caregiver');
  }, [role, setRole]);

  return {
    role: mounted ? role : 'caregiver',
    setRole,
    toggleRole,
    isPatient: role === 'patient',
    isCaregiver: role === 'caregiver',
    mounted
  };
}
