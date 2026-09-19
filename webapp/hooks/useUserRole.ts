'use client';

import { useState, useEffect, useCallback } from 'react';

export type UserRole = 'patient' | 'caregiver';

export function useUserRole() {
  const [role, setRoleState] = useState<UserRole>('caregiver');
  const [mounted, setMounted] = useState(false);

  const syncRoleFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cognitrace_user_role') as UserRole | null;
      if (saved === 'patient' || saved === 'caregiver') {
        setRoleState(saved);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    syncRoleFromStorage();

    const handleStorage = () => syncRoleFromStorage();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cognitrace_role_change', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cognitrace_role_change', handleStorage);
    };
  }, [syncRoleFromStorage]);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cognitrace_user_role', newRole);
      window.dispatchEvent(new Event('cognitrace_role_change'));
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
