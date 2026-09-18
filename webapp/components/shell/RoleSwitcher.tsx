'use client';

import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { User, Heart, Shield, RefreshCw } from 'lucide-react';

export function RoleSwitcher({ className = '' }: { className?: string }) {
  const { role, toggleRole, isPatient } = useUserRole();

  return (
    <button
      onClick={toggleRole}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border ${
        isPatient
          ? 'bg-[#E36C59] text-white border-[#C85C82] hover:bg-[#c85544]'
          : 'bg-[#17665B] text-white border-[#123B35] hover:bg-[#125047]'
      } ${className}`}
      title="Switch view between Caregiver Dashboard and Patient Mode"
    >
      {isPatient ? (
        <>
          <Heart className="w-3.5 h-3.5 fill-current text-white" />
          <span>Patient Mode</span>
        </>
      ) : (
        <>
          <Shield className="w-3.5 h-3.5 text-[#BFDCD6]" />
          <span>Caregiver Mode</span>
        </>
      )}
      <RefreshCw className="w-3 h-3 ml-1 opacity-80" />
    </button>
  );
}
