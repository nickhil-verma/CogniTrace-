'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Activity, Heart, Sparkles } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-[#164E48] text-white pt-16 pb-12 px-6 border-t border-[#164E48]/20 relative overflow-hidden">
      {/* Soft Ambient Radial Blur Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8F4F1]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info & Mission */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.svg"
                alt="CogniTrace Logo"
                className="w-10 h-10 rounded-2xl bg-white/10 p-1 object-contain shadow-sm border border-white/20"
              />
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  CogniTrace
                </span>
                <span className="block text-[10px] font-bold text-[#E8F4F1] tracking-widest uppercase">
                  Cognitive Care Engine
                </span>
              </div>
            </div>

            <p className="text-sm text-[#E8F4F1]/80 max-w-sm leading-relaxed">
              Empowering caregivers and patients with voice AI command intelligence, 
              longitudinal comparative insights, and personalized reminiscence care.
            </p>

            {/* Live System Status Indicator */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#E8F4F1]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>Clinical Sync Active • Multi-Locale Ready</span>
            </div>
          </div>

          {/* Platform Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#E8F4F1] tracking-widest uppercase">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E8F4F1]/70 font-medium">
              <li>
                <a href="#care-engine" className="hover:text-white transition-colors">
                  AI Voice Command
                </a>
              </li>
              <li>
                <Link href="/login?role=patient" className="hover:text-white transition-colors">
                  Patient Voice Center
                </Link>
              </li>
              <li>
                <a href="#reminiscence" className="hover:text-white transition-colors">
                  Memory Reminiscence
                </a>
              </li>
              <li>
                <Link href="/login?role=patient" className="hover:text-white transition-colors">
                  Care Reminders
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical Insights Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#E8F4F1] tracking-widest uppercase">
              Clinical Insights
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E8F4F1]/70 font-medium">
              <li>
                <a href="#insights" className="hover:text-white transition-colors">
                  Comparative Health Cohort
                </a>
              </li>
              <li>
                <Link href="/login?role=caregiver" className="hover:text-white transition-colors">
                  Routine Consistency Index
                </Link>
              </li>
              <li>
                <Link href="/login?role=caregiver" className="hover:text-white transition-colors">
                  Longitudinal Metrics
                </Link>
              </li>
              <li>
                <Link href="/login?role=caregiver" className="hover:text-white transition-colors">
                  Care Partner Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Ethics & Security Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#E8F4F1] tracking-widest uppercase">
              Ethics & Security
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E8F4F1]/70 font-medium">
              <li>
                <a href="#security" className="hover:text-white transition-colors">
                  HIPAA Readiness
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">
                  SOC2 Compliance
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">
                  AES-256 Encryption
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">
                  Safety Guardrails
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Direct Launch CTA Banner */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Ready for clinically informed caregiver support?</p>
              <p className="text-xs text-[#E8F4F1]/70">Launch the Caregiver Portal to monitor observations and longitudinal trends.</p>
            </div>
          </div>
          <Link
            href="/login?role=caregiver"
            className="px-5 py-2.5 rounded-full bg-[#E8F4F1] text-[#164E48] hover:bg-white font-bold text-xs transition-all shadow-md flex items-center space-x-2 group shrink-0"
          >
            <span>Launch Caregiver Portal</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Bottom Bar & Compliance */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-[#E8F4F1]/60 space-y-4 md:space-y-0">
          <p>© 2026 CogniTrace. Built with care for caregivers and patients.</p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold">
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">HIPAA Compliant Standard</span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">SOC2 Type II Ready</span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">AES-256 Data Vault</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
