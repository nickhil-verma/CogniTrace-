'use client';

import { useState, useEffect } from 'react';
import languagesData from '@/data/languages.json';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechLang: string;
}

export function useLanguage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('cognitrace_language');
      if (savedLang) {
        setSelectedLanguage(savedLang);
      }
    }
  }, []);

  const changeLanguage = (code: string) => {
    setSelectedLanguage(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cognitrace_language', code);
    }
  };

  const currentLangObj: LanguageOption =
    languagesData.languages.find((l) => l.code === selectedLanguage) || languagesData.languages[0];

  const t = (key: string): string => {
    const dict = (languagesData.translations as Record<string, Record<string, string>>)[selectedLanguage] || languagesData.translations['en-US'];
    return dict[key] || (languagesData.translations['en-US'] as Record<string, string>)[key] || key;
  };

  return {
    selectedLanguage,
    currentLangObj,
    languages: languagesData.languages as LanguageOption[],
    changeLanguage,
    t
  };
}
