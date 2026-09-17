'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestedCommandProps {
  commands: string[];
  onSelectCommand: (cmd: string) => void;
}

export function SuggestedCommand({ commands, onSelectCommand }: SuggestedCommandProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1 text-xs text-[#66736F] font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#17665B]" />
        <span>Suggested voice commands:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {commands.map((cmd, i) => (
          <button
            key={i}
            onClick={() => onSelectCommand(cmd)}
            className="rounded-full bg-white border border-[#DDE7E3] px-3.5 py-2 text-xs font-medium text-[#123B35] hover:bg-[#BFDCD6]/30 hover:border-[#17665B]/40 transition-all duration-200 shadow-2xs"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
