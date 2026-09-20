'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { Heart, Shield, LogOut } from 'lucide-react';
import { api } from '@/lib/api';

export function RoleSwitcher({
  className = '',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { isPatient } = useUserRole();

  const handleLogout = () => {
    api.logout();
    router.push('/login');
  };

  return (
    <div
      className={`flex items-center justify-between gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded-2xl border text-xs font-bold ${
        isPatient
          ? 'bg-[#E8F4F1] text-[#164E48] border-[#164E48]/20'
          : 'bg-[#17665B]/10 text-[#17665B] border-[#17665B]/30'
      } ${className}`}
    >
      <div className="flex items-center space-x-1.5 min-w-0">
        {isPatient ? (
          <>
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-[#164E48] shrink-0" />
            <span className="truncate">
              {compact ? (
                <>
                  <span className="sm:hidden">Patient</span>
                  <span className="hidden sm:inline">Patient Portal</span>
                </>
              ) : (
                'Patient Portal'
              )}
            </span>
          </>
        ) : (
          <>
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#17665B] shrink-0" />
            <span className="truncate">
              {compact ? (
                <>
                  <span className="sm:hidden">Caregiver</span>
                  <span className="hidden sm:inline">Caregiver Portal</span>
                </>
              ) : (
                'Caregiver Portal'
              )}
            </span>
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-1 px-1.5 py-1 sm:px-2 rounded-lg bg-white border border-[#DDE7E3] text-[10px] sm:text-[11px] text-[#66736F] hover:text-[#123B35] hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
        title="Log out and change role on login screen"
      >
        <LogOut className="w-3 h-3 text-[#66736F]" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
}
