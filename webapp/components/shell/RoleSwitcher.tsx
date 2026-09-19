'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { Heart, Shield, LogOut } from 'lucide-react';
import { api } from '@/lib/api';

export function RoleSwitcher({ className = '' }: { className?: string }) {
  const router = useRouter();
  const { isPatient } = useUserRole();

  const handleLogout = () => {
    api.logout();
    router.push('/login');
  };

  return (
    <div className={`flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border text-xs font-bold ${
      isPatient
        ? 'bg-[#E36C59]/10 text-[#E36C59] border-[#E36C59]/30'
        : 'bg-[#17665B]/10 text-[#17665B] border-[#17665B]/30'
    } ${className}`}>
      <div className="flex items-center space-x-2">
        {isPatient ? (
          <>
            <Heart className="w-4 h-4 fill-current text-[#E36C59]" />
            <span>Patient Portal</span>
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 text-[#17665B]" />
            <span>Caregiver Portal</span>
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white border border-[#DDE7E3] text-[11px] text-[#66736F] hover:text-[#123B35] hover:bg-slate-50 transition-colors shadow-2xs"
        title="Log out and change role on login screen"
      >
        <LogOut className="w-3 h-3 text-[#66736F]" />
        <span>Logout</span>
      </button>
    </div>
  );
}
