'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
];

interface LanguageSelectorProps {
  currentLang?: string;
  onSelectLanguage?: (code: string) => void;
}

export function LanguageSelector({ currentLang = 'en', onSelectLanguage }: LanguageSelectorProps) {
  const [selected, setSelected] = useState(currentLang);

  const handleChange = (code: string) => {
    setSelected(code);
    if (onSelectLanguage) onSelectLanguage(code);
  };

  return (
    <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-[#DDE7E3] text-xs font-semibold text-[#123B35] shadow-2xs">
      <Globe className="w-3.5 h-3.5 text-[#17665B]" />
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent text-xs font-semibold text-[#123B35] focus:outline-none cursor-pointer pr-1"
        aria-label="Select AI Voice Language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
}
