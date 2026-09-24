'use client';

import React from 'react';
import { Sparkles, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useUserRole } from '@/hooks/useUserRole';
import { getRoleSuggestedCommands } from '@/lib/suggestedCommands';

interface SuggestedCommandProps {
  commands?: string[];
  role?: 'patient' | 'caregiver';
  onSelectCommand: (cmd: string) => void;
}

export function SuggestedCommand({ commands, role, onSelectCommand }: SuggestedCommandProps) {
  const { t } = useLanguage();
  const { isPatient } = useUserRole();

  const activeRole: 'patient' | 'caregiver' = role || (isPatient ? 'patient' : 'caregiver');
  const displayCommands = commands && commands.length > 0
    ? commands
    : getRoleSuggestedCommands(activeRole);

  const titleText = activeRole === 'patient'
    ? 'Suggested Voice Check-Ins (Know About Myself)'
    : 'Suggested Voice Commands (Asking About Patient & Managing Care)';

  return (
    <div className="space-y-2">
      <div className={`flex items-center space-x-1.5 text-xs font-bold ${activeRole === 'patient' ? 'text-[#4F46E5]' : 'text-[#164E48]'}`}>
        {activeRole === 'patient' ? (
          <User className="w-3.5 h-3.5 text-[#4F46E5]" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-[#17665B]" />
        )}
        <span>{titleText}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayCommands.map((cmd, i) => (
          <button
            key={i}
            onClick={() => onSelectCommand(cmd)}
            className={`rounded-full bg-white border px-3.5 py-2 text-xs font-semibold active:scale-95 transition-all duration-200 shadow-2xs cursor-pointer text-left ${
              activeRole === 'patient'
                ? 'border-[#C7D2FE] text-[#1E1B4B] hover:bg-[#EEF2FF] hover:border-[#4F46E5]'
                : 'border-[#DDE7E3] text-[#123B35] hover:bg-[#BFDCD6]/40 hover:border-[#17665B]/60'
            }`}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}

