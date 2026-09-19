'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function LanguageSelector() {
  const { selectedLanguage, languages, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-[#DDE7E3] text-xs font-semibold text-[#123B35] shadow-2xs">
      <Globe className="w-3.5 h-3.5 text-[#17665B]" />
      <select
        value={selectedLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent text-xs font-semibold text-[#123B35] focus:outline-none cursor-pointer pr-1"
        aria-label="Select AI Voice & Interface Language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
}
