'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface LanguageSelectorProps {
  className?: string;
  direction?: 'up' | 'down' | 'auto';
}

export function LanguageSelector({ className = '', direction = 'auto' }: LanguageSelectorProps) {
  const { selectedLanguage, languages, changeLanguage, currentLangObj } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        const currentIndex = languages.findIndex((l) => l.code === selectedLanguage);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < languages.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : languages.length - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < languages.length) {
          changeLanguage(languages[focusedIndex].code);
          setIsOpen(false);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Ensure focused option scrolls into view when navigating via keyboard
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  // Determine popover orientation: if direction is auto, detect distance from window bottom
  const [openUpward, setOpenUpward] = useState(direction === 'up');

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          const nextOpen = !isOpen;
          if (nextOpen && containerRef.current) {
            if (direction === 'up') {
              setOpenUpward(true);
            } else if (direction === 'down') {
              setOpenUpward(false);
            } else {
              const rect = containerRef.current.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              setOpenUpward(spaceBelow < 260);
            }
          }
          setIsOpen(nextOpen);
          const currentIndex = languages.findIndex((l) => l.code === selectedLanguage);
          setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={`Language: ${currentLangObj.nativeName} (${currentLangObj.name}). Click to change language.`}
        className="flex items-center justify-between w-full gap-2 px-3 py-1.5 bg-white hover:bg-[#F5F8F6] active:bg-[#BFDCD6]/20 rounded-xl border border-[#DDE7E3] text-xs font-semibold text-[#123B35] shadow-2xs hover:border-[#BFDCD6] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#17665B] focus-visible:ring-offset-1 transition-all cursor-pointer select-none"
      >
        <div className="flex items-center space-x-1.5 min-w-0">
          <Globe className="w-3.5 h-3.5 text-[#17665B] shrink-0" aria-hidden="true" />
          <span className="text-sm leading-none shrink-0" aria-hidden="true">
            {currentLangObj.flag}
          </span>
          <span className="truncate font-medium text-[#123B35]">
            {currentLangObj.nativeName}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#66736F] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#17665B]' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 min-w-[210px] w-full max-w-xs bg-white rounded-2xl border border-[#DDE7E3] shadow-lg py-1.5 transition-all animate-in fade-in zoom-in-95 duration-150 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } left-0 right-auto`}
        >
          <div className="px-3 py-1.5 border-b border-[#DDE7E3]/60 text-[10px] font-bold text-[#66736F] uppercase tracking-wider">
            Select Language
          </div>
          <ul
            id={listboxId}
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            aria-label="Available Languages"
            className="max-h-56 overflow-y-auto py-1 space-y-0.5 focus:outline-hidden text-xs"
          >
            {languages.map((lang, index) => {
              const isSelected = lang.code === selectedLanguage;
              const isFocused = index === focusedIndex;

              return (
                <li
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  id={`lang-option-${lang.code}`}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#BFDCD6]/30 text-[#17665B] font-bold'
                      : isFocused
                      ? 'bg-[#F5F8F6] text-[#123B35]'
                      : 'text-[#123B35] hover:bg-[#F5F8F6]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-base leading-none shrink-0" aria-hidden="true">
                      {lang.flag}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs truncate font-medium">
                        {lang.nativeName}
                      </span>
                      <span className="text-[10px] text-[#66736F] truncate">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check
                      className="w-4 h-4 text-[#17665B] shrink-0 ml-2"
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
