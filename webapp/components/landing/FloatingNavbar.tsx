'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 inset-x-0 mx-auto z-50 w-[94%] transition-all duration-500 ease-in-out ${
        isScrolled ? 'max-w-4xl' : 'max-w-6xl'
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full border transition-all duration-500 backdrop-blur-xl ${
          isScrolled
            ? 'bg-white/90 border-[#164E48]/15 shadow-[0_12px_40px_rgba(22,78,72,0.12)] py-2'
            : 'bg-white/75 border-[#164E48]/10 shadow-[0_8px_30px_rgba(22,78,72,0.06)]'
        }`}
      >
        {/* Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
          <img
            src="/logo.svg"
            alt="CogniTrace Logo"
            className="w-8 h-8 rounded-xl object-contain transition-transform group-hover:scale-105 shadow-xs"
          />
          <div className="flex items-baseline space-x-1.5 shrink-0">
            <span className="text-base font-extrabold tracking-tight text-[#164E48] whitespace-nowrap">
              CogniTrace
            </span>
            <span className="hidden lg:inline-block text-[10px] font-bold tracking-widest text-[#3E9C87] uppercase whitespace-nowrap">
              Care
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-xs font-bold text-[#66736F] shrink-0 whitespace-nowrap">
          <a
            href="#care-engine"
            className="whitespace-nowrap hover:text-[#164E48] transition-colors"
          >
            Care Engine
          </a>
          <a
            href="#insights"
            className="whitespace-nowrap hover:text-[#164E48] transition-colors"
          >
            Comparative Insights
          </a>
          <a
            href="#reminiscence"
            className="whitespace-nowrap hover:text-[#164E48] transition-colors"
          >
            Reminiscence
          </a>
          <a
            href="#security"
            className="whitespace-nowrap hover:text-[#164E48] transition-colors"
          >
            Security
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0 whitespace-nowrap">
          <Link
            href="/command-center"
            className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#E8F4F1] text-[#164E48] hover:bg-[#D2ECE6] transition-all border border-[#164E48]/10 hidden sm:inline-flex items-center whitespace-nowrap"
          >
            Patient Portal
          </Link>
          <Link
            href="/dashboard"
            className="bg-[#164E48] text-white hover:bg-[#113e39] rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-md flex items-center space-x-1 group whitespace-nowrap"
          >
            <span className="whitespace-nowrap">Caregiver Access</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 shrink-0" />
          </Link>
        </div>
      </div>
    </header>
  );
}
