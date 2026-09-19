'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import languagesData from '@/data/languages.json';
import { translations } from '@/locales';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechLang: string;
}

export interface LanguageContextType {
  selectedLanguage: string;
  currentLangObj: LanguageOption;
  languages: LanguageOption[];
  changeLanguage: (code: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'cognitrace_language';

// Helper function to resolve nested dot-keys
function getNestedValue(obj: Record<string, unknown> | undefined, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  if (path in obj && typeof obj[path] === 'string') return obj[path] as string;
  
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

// Fallback resolver
function resolveTranslation(langCode: string, key: string, params?: Record<string, string | number>): string {
  const currentDict = (translations[langCode] || translations['en-US']) as Record<string, unknown> | undefined;
  const fallbackDict = translations['en-US'] as Record<string, unknown> | undefined;
  
  let val = getNestedValue(currentDict, key);
  if (!val) {
    val = getNestedValue(fallbackDict, key);
  }
  // Backwards compatibility with old languages.json flat translations
  const oldTranslations = (languagesData as Record<string, unknown>).translations as Record<string, Record<string, string>> | undefined;
  if (!val && oldTranslations) {
    const oldDict = oldTranslations[langCode] || oldTranslations['en-US'];
    if (oldDict && oldDict[key]) {
      val = oldDict[key];
    }
  }

  if (!val) {
    return key;
  }

  if (params) {
    return Object.entries(params).reduce((acc, [paramKey, paramVal]) => {
      return acc.replaceAll(`{${paramKey}}`, String(paramVal));
    }, val);
  }

  return val;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always initialize with English on initial render for deterministic server/client hydration
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');

  // After component mounts on the client, read persisted language from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && languagesData.languages.some((l) => l.code === savedLang)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedLanguage(savedLang);
        document.documentElement.lang = savedLang.split('-')[0] || 'en';
      }
    } catch {
      // ignore
    }

    const handleStorageChange = () => {
      try {
        const savedLang = localStorage.getItem(STORAGE_KEY);
        if (savedLang && languagesData.languages.some((l) => l.code === savedLang)) {
          setSelectedLanguage(savedLang);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cognitrace_language_change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cognitrace_language_change', handleStorageChange);
    };
  }, []);

  // Sync document lang attribute when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = selectedLanguage.split('-')[0] || 'en';
    }
  }, [selectedLanguage]);

  const changeLanguage = useCallback((code: string) => {
    setSelectedLanguage(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, code);
      document.documentElement.lang = code.split('-')[0] || 'en';
      window.dispatchEvent(new Event('cognitrace_language_change'));
    }
  }, []);

  const currentLangObj: LanguageOption = useMemo(() => {
    return (
      (languagesData.languages as LanguageOption[]).find((l) => l.code === selectedLanguage) ||
      (languagesData.languages[0] as LanguageOption)
    );
  }, [selectedLanguage]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return resolveTranslation(selectedLanguage, key, params);
    },
    [selectedLanguage]
  );

  const contextValue = useMemo<LanguageContextType>(() => {
    return {
      selectedLanguage,
      currentLangObj,
      languages: languagesData.languages as LanguageOption[],
      changeLanguage,
      t,
    };
  }, [selectedLanguage, currentLangObj, changeLanguage, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context) {
    return context;
  }

  // Safe fallback if used outside LanguageProvider
  const defaultLang = 'en-US';
  const currentLangObj = languagesData.languages[0] as LanguageOption;
  return {
    selectedLanguage: defaultLang,
    currentLangObj,
    languages: languagesData.languages as LanguageOption[],
    changeLanguage: (code: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, code);
      }
    },
    t: (key: string, params?: Record<string, string | number>) => resolveTranslation(defaultLang, key, params),
  };
}
