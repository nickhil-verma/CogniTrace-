'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  LineChart,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Globe,
  FileEdit,
  Clock,
  Lock,
  Activity,
  Volume2,
  Brain,
  ShieldCheck,
  Zap,
  Users,
  Search,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FloatingNavbar } from '@/components/landing/FloatingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/SmoothScroll';

export default function LandingPage() {
  const [macWindowExpanded, setMacWindowExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('mac-showcase-window');
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 250) {
          setMacWindowExpanded(true);
        } else {
          setMacWindowExpanded(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#F8FAF9] text-[#123B35] font-sans antialiased selection:bg-[#E8F4F1] selection:text-[#164E48]">
        {/* ================= FLOATING ISLAND NAVBAR ================= */}
        <FloatingNavbar />

        {/* ================= HERO SECTION (SVG GRID MESH ONLY HERE) ================= */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          {/* SVG Grid Mesh Background Canvas - STRICTLY FIRST LAYOUT COMPONENT ONLY */}
          <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center opacity-70">
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern
                  id="hero-grid-mesh-only"
                  width="48"
                  height="48"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 48 0 L 0 0 0 48"
                    fill="none"
                    stroke="rgba(22, 78, 72, 0.06)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid-mesh-only)" />
            </svg>
          </div>

          {/* Ambient Radial Depth Glow / Aura */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] rounded-full blur-3xl pointer-events-none -z-10"
            style={{
              background:
                'radial-gradient(circle, rgba(232, 244, 241, 0.95) 0%, rgba(22, 78, 72, 0.08) 55%, transparent 75%)'
            }}
          />

          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-[#164E48]/12 shadow-[0_2px_10px_rgba(22,78,72,0.04)]"
            >
              <Sparkles className="w-4 h-4 text-[#164E48]" />
              <span className="text-xs font-bold tracking-wide text-[#164E48]">
                AI Voice Command & Longitudinal Care Companion
              </span>
            </motion.div>

            {/* Hero Titles */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-[#164E48] leading-[1.05]">
                CogniTrace
              </h1>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#164E48]/90 tracking-tight max-w-3xl mx-auto">
                  Understand the journey. Act with confidence.
                </p>
                {/* CURSIVE FONT ACCENT */}
                <p className="font-cursive text-[#3E9C87] text-2xl sm:text-3xl font-semibold -rotate-1 transform">
                  crafted with empathy for caregivers & patients
                </p>
              </div>
            </motion.div>

            {/* Subtitle Body */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto text-base sm:text-lg text-[#66736F] leading-relaxed font-medium"
            >
              An AI companion built for dementia and cognitive care. Translate voice commands into live clinical actions, track daily care trends, and engage patients with personalized memory reminiscence.
            </motion.p>

            {/* Hero Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <Link href="/login?role=caregiver">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto bg-[#164E48] text-white hover:bg-[#113e39] rounded-full px-8 py-3 text-base font-bold shadow-xl transition-all flex items-center justify-center group"
                >
                  <span>Start Caregiver Journey</span>
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login?role=patient">
                <Button
                  variant="mint"
                  size="lg"
                  className="w-full sm:w-auto bg-[#E8F4F1] text-[#164E48] hover:bg-[#D2ECE6] border border-[#164E48]/15 rounded-full px-7 py-3 text-base font-bold transition-all flex items-center justify-center"
                >
                  <Mic className="w-5 h-5 mr-2 text-[#164E48]" />
                  <span>Try Voice Command Center</span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ================= macOS WINDOW SHOWCASE SECTION (SCROLL TRIGGER EXPANSION) ================= */}
        <section
          className={`py-20 px-4 sm:px-6 transition-colors duration-700 ease-in-out relative overflow-hidden ${
            macWindowExpanded ? 'bg-[#060A08]' : 'bg-[#F8FAF9]'
          }`}
        >
        <div
          id="mac-showcase-window"
          className={`mx-auto transition-all duration-700 ease-in-out ${
            macWindowExpanded ? 'max-w-7xl w-full' : 'max-w-4xl'
          }`}
        >
          <div
            className={`rounded-3xl border transition-all duration-700 ease-in-out overflow-hidden shadow-2xl ${
              macWindowExpanded
                ? 'bg-[#0A0F0D] text-white border-[#3E9C87]/40 shadow-[0_25px_80px_rgba(22,78,72,0.4)]'
                : 'bg-white text-[#164E48] border-[#164E48]/20 shadow-xl'
            }`}
          >
            {/* macOS Window Title Header */}
            <div
              className={`flex items-center justify-between px-5 py-3.5 border-b transition-colors duration-700 ${
                macWindowExpanded
                  ? 'bg-[#121A17] border-white/10'
                  : 'bg-[#F0F5F3] border-[#164E48]/10'
              }`}
            >
              {/* Left macOS Window Traffic Light Controls */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-xs" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-xs" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-xs" />
              </div>

              {/* Center Simulated Browser Address Bar */}
              <div
                className={`hidden sm:flex items-center space-x-2 px-4 py-1 rounded-full text-xs font-mono border transition-colors duration-700 max-w-sm w-full justify-center ${
                  macWindowExpanded
                    ? 'bg-black/40 border-white/10 text-[#E8F4F1]/80'
                    : 'bg-white border-[#164E48]/10 text-[#66736F]'
                }`}
              >
                <Lock className="w-3 h-3 text-[#3E9C87]" />
                <span className="truncate">https://agent.cognitrace.ai/voice-hub</span>
              </div>

              {/* Right Live Agent Badge */}
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span
                  className={`text-xs font-bold tracking-tight transition-colors duration-700 ${
                    macWindowExpanded ? 'text-[#E8F4F1]' : 'text-[#164E48]'
                  }`}
                >
                  CogniTrace Siri-Orb Agent Active
                </span>
              </div>
            </div>

            {/* macOS Window Interior Showcase */}
            <div className="p-6 md:p-10 space-y-8">
              {/* Header Status inside Window */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-2 border-current/10">
                <div>
                  <h3
                    className={`text-xl font-extrabold tracking-tight transition-colors duration-700 ${
                      macWindowExpanded ? 'text-white' : 'text-[#164E48]'
                    }`}
                  >
                    Voice Command Intelligence Center
                  </h3>
                  <p
                    className={`text-xs transition-colors duration-700 ${
                      macWindowExpanded ? 'text-[#E8F4F1]/70' : 'text-[#66736F]'
                    }`}
                  >
                    Stateful voice agent running live audio speech-to-text & verification modals
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* CURSIVE FONT ACCENT INSIDE MAC WINDOW */}
                  <span className="font-cursive text-xl text-[#3E9C87] font-semibold">
                    live audio sync
                  </span>
                  <Badge
                    variant="teal"
                    className={`font-bold transition-all duration-700 ${
                      macWindowExpanded
                        ? 'bg-[#3E9C87]/20 text-[#E8F4F1] border-[#3E9C87]/40'
                        : 'bg-[#E8F4F1] text-[#164E48] border-[#164E48]/20'
                    }`}
                  >
                    SOC2 Encrypted
                  </Badge>
                </div>
              </div>

              {/* Simulated Glowing Siri Assistant Orb & Prompt Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-2">
                <div
                  className={`flex flex-col items-center justify-center space-y-5 p-8 rounded-2xl border text-center transition-all duration-700 ${
                    macWindowExpanded
                      ? 'bg-black/50 border-white/10'
                      : 'bg-[#F8FAF9] border-[#164E48]/10'
                  }`}
                >
                  {/* Glowing Animated Siri-Orb Container */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#164E48] via-[#3E9C87] to-[#E8F4F1] opacity-80 blur-xl animate-pulse" />
                    <div className="relative w-28 h-28 rounded-full bg-[#164E48] p-1 shadow-2xl flex items-center justify-center border-2 border-white/80">
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#164E48] to-[#25756C] flex items-center justify-center">
                        <Mic className="w-10 h-10 text-[#E8F4F1] animate-bounce" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p
                      className={`text-lg font-bold transition-colors duration-700 ${
                        macWindowExpanded ? 'text-[#E8F4F1]' : 'text-[#164E48]'
                      }`}
                    >
                      "Remind Mom to take her evening pill at 8 PM"
                    </p>
                    <p
                      className={`text-xs font-medium transition-colors duration-700 ${
                        macWindowExpanded ? 'text-white/60' : 'text-[#66736F]'
                      }`}
                    >
                      Natural Spoken Input • Real-Time Speech-to-Text
                    </p>
                  </div>
                </div>

                {/* Reasoning & Verification Modal Timeline */}
                <div className="space-y-3">
                  <div
                    className={`text-xs font-bold tracking-wider uppercase mb-2 transition-colors duration-700 ${
                      macWindowExpanded ? 'text-[#3E9C87]' : 'text-[#164E48]'
                    }`}
                  >
                    Verification Pipeline Execution
                  </div>

                  <div
                    className={`p-4 rounded-xl border flex items-start space-x-3 transition-colors duration-700 ${
                      macWindowExpanded
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-[#E8F4F1]/60 border-[#164E48]/15 text-[#164E48]'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#3E9C87] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">1. Intent Parsed via Gemini</p>
                      <p
                        className={`text-[11px] transition-colors duration-700 ${
                          macWindowExpanded ? 'text-[#E8F4F1]/70' : 'text-[#66736F]'
                        }`}
                      >
                        Action: <code className="text-[#3E9C87] font-mono">CREATE_REMINDER</code> | Time: 8:00 PM
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border flex items-start space-x-3 transition-colors duration-700 ${
                      macWindowExpanded
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-[#E8F4F1]/60 border-[#164E48]/15 text-[#164E48]'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#3E9C87] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">2. Backend Database Sync</p>
                      <p
                        className={`text-[11px] transition-colors duration-700 ${
                          macWindowExpanded ? 'text-[#E8F4F1]/70' : 'text-[#66736F]'
                        }`}
                      >
                        Postgres database updated. Scheduled task active.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#164E48] text-white flex items-start space-x-3 shadow-lg border border-[#3E9C87]/40">
                    <Sparkles className="w-5 h-5 text-[#E8F4F1] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#E8F4F1]">3. Verification Modal Triggered</p>
                      <p className="text-[11px] text-[#E8F4F1]/80">
                        "Evening pill scheduled for 8:00 PM." Audio feedback playback complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 1: `#care-engine` (AI VOICE COMMAND CENTER) ================= */}
      <section id="care-engine" className="py-24 px-6 bg-white border-y border-[#164E48]/10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="teal" className="bg-[#E8F4F1] text-[#164E48] border-[#164E48]/20 font-bold px-3 py-1">
              AI Command Engine
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#164E48] tracking-tight">
              Natural Voice Controls for Seamless Care
            </h2>
            {/* CURSIVE FONT ACCENT */}
            <p className="font-cursive text-[#3E9C87] text-2xl font-bold">
              no complex buttons • just speak naturally
            </p>
            <p className="text-base sm:text-lg text-[#66736F] font-medium">
              Eliminate friction. Speak naturally to record observations, mark finished tasks, or create care reminders with automated verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#F8FAF9] border border-[#164E48]/12 space-y-5 hover:border-[#164E48]/30 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center font-bold">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#164E48]">Live Speech-to-Text Pipeline</h3>
              <p className="text-sm text-[#66736F] leading-relaxed">
                Interruption-ready audio streaming parses natural sentences directly into structured clinical intents without manual typing.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F8FAF9] border border-[#164E48]/12 space-y-5 hover:border-[#164E48]/30 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#164E48]">Instant Verification Modals</h3>
              <p className="text-sm text-[#66736F] leading-relaxed">
                Every voice action pops up a visual verification modal with confirmation status, auto-dismiss timers, and spoken audio responses.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F8FAF9] border border-[#164E48]/12 space-y-5 hover:border-[#164E48]/30 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#164E48]">Multilingual Locales</h3>
              <p className="text-sm text-[#66736F] leading-relaxed">
                Full dynamic i18n support in English, Hindi (हिंदी), Bengali (বাংলা), and Assamese (অসমীয়া) with instant UI locale switching.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: `#insights` (EXECUTIVE DEEP TEAL SECTION) ================= */}
      <section id="insights" className="py-24 px-6 bg-[#164E48] text-white relative overflow-hidden transition-colors duration-700 ease-in-out">
        {/* Soft Background Mesh */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="teal-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FFFFFF" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#teal-grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#E8F4F1]/15 text-[#E8F4F1] border border-[#E8F4F1]/20 text-xs font-bold tracking-widest uppercase">
              Clinical Precision & Longitudinal Analytics
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Transform Daily Observations into Actionable Insights
            </h2>
            {/* CURSIVE FONT ACCENT */}
            <p className="font-cursive text-[#E8F4F1] text-2xl font-semibold">
              clear data for doctors & family members
            </p>
            <p className="text-base sm:text-lg text-[#E8F4F1]/80 font-medium">
              Eliminate technical jargon. Track routine consistency indices, comparative cohort benchmarks, and longitudinal memory trends with executive clarity.
            </p>
          </div>

          {/* 4-Card Executive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center font-bold">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Comparative Health Cohort</h3>
              <p className="text-xs text-[#E8F4F1]/80 leading-relaxed">
                Benchmark routine adherence against standardized health cohorts to spot meaningful shifts early.
              </p>
              <div className="pt-2 text-xs font-bold text-[#E8F4F1]">
                Top 15th Percentile Stability
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Routine Consistency Index</h3>
              <p className="text-xs text-[#E8F4F1]/80 leading-relaxed">
                Synthesize medication, meal, and task completion into a clear, non-jargon daily consistency score.
              </p>
              <div className="pt-2 text-xs font-bold text-[#E8F4F1]">
                94% Routine Index Rate
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Longitudinal Memory Tracker</h3>
              <p className="text-xs text-[#E8F4F1]/80 leading-relaxed">
                Log memory interactions over weeks and months to provide doctors with empirical longitudinal data.
              </p>
              <div className="pt-2 text-xs font-bold text-[#E8F4F1]">
                30-Day Trend Verified
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center font-bold">
                <FileEdit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Care Partner Journal</h3>
              <p className="text-xs text-[#E8F4F1]/80 leading-relaxed">
                Encrypted notes for family caregivers and care teams to synchronize observations seamlessly.
              </p>
              {/* CURSIVE ACCENT NOTE */}
              <p className="font-cursive text-sm text-[#E8F4F1] pt-1">
                "Mom slept well tonight!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: `#reminiscence` (MEMORY REMINISCENCE TRIVIA) ================= */}
      <section id="reminiscence" className="py-24 px-6 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="teal" className="bg-[#E8F4F1] text-[#164E48] border-[#164E48]/20 font-bold px-3 py-1">
                Reminiscence Therapy
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#164E48] tracking-tight leading-tight">
                Personalized Memory Trivia Powered by Vector RAG
              </h2>
              {/* CURSIVE FONT ACCENT */}
              <p className="font-cursive text-[#3E9C87] text-2xl font-bold">
                warm, comforting associative recall
              </p>
              <p className="text-base text-[#66736F] leading-relaxed font-medium">
                CogniTrace connects patient photo archives with dynamic Gemini AI prompts to generate warm, comforting associative recall questions exclusively within the Patient Portal.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#164E48] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#164E48]">Associative Memory Anchors</h4>
                    <p className="text-xs text-[#66736F]">Questions adaptively reference family trips, weddings, and key life events.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#164E48] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#164E48]">Patient-Exclusive Experience</h4>
                    <p className="text-xs text-[#66736F]">Strictly locked to the patient portal view so patients enjoy game-like reminiscence without caregiver disruption.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/login?role=patient">
                  <Button variant="default" size="default" className="bg-[#164E48] text-white hover:bg-[#113e39] rounded-full px-6 font-bold text-xs shadow-md">
                    Explore Reminiscence Game
                  </Button>
                </Link>
              </div>
            </div>

            {/* Memory Trivia Visual Preview */}
            <div className="p-6 rounded-3xl bg-white border border-[#164E48]/15 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#164E48]/10 pb-3">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-[#164E48]" />
                  <span className="text-xs font-bold text-[#164E48]">Archival Record: Family Goa Trip 2022</span>
                </div>
                <Badge variant="teal" className="bg-[#E8F4F1] text-[#164E48] text-[10px] font-bold">Memory Reminiscence</Badge>
              </div>

              <div className="relative h-56 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#164E48]/20 via-[#E8F4F1] to-[#164E48]/10 flex items-center justify-center border border-[#164E48]/10">
                <div className="text-center p-6 space-y-2">
                  <Sparkles className="w-8 h-8 text-[#164E48] mx-auto animate-pulse" />
                  <p className="text-base font-bold text-[#164E48]">"Do you remember who took this sunset photo at the beach?"</p>
                  <p className="font-cursive text-xl text-[#3E9C87] font-semibold">"Talk about it with your family!"</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#E8F4F1] text-[#164E48] text-xs font-bold border border-[#164E48]/15 text-center cursor-pointer hover:bg-[#D2ECE6] transition-colors">
                  Option A: Your daughter Priya
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAF9] text-[#66736F] text-xs font-bold border border-[#164E48]/10 text-center cursor-pointer hover:bg-[#E8F4F1] transition-colors">
                  Option B: Your brother Ramesh
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: `#security` (CLINICAL GUARDRAILS & SECURITY) ================= */}
      <section id="security" className="py-24 px-6 bg-white border-t border-[#164E48]/10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="teal" className="bg-[#E8F4F1] text-[#164E48] border-[#164E48]/20 font-bold px-3 py-1">
              Enterprise Security & Ethics
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#164E48] tracking-tight">
              Clinical Guardrails Built for Absolute Peace of Mind
            </h2>
            {/* CURSIVE FONT ACCENT */}
            <p className="font-cursive text-[#3E9C87] text-2xl font-bold">
              protected & encrypted data
            </p>
            <p className="text-base sm:text-lg text-[#66736F] font-medium">
              Role-differentiated access locks critical data while protecting privacy through SOC2 & HIPAA readiness standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#F8FAF9] border border-[#164E48]/12 space-y-4">
              <ShieldCheck className="w-8 h-8 text-[#164E48]" />
              <h3 className="text-lg font-bold text-[#164E48]">Role-Differentiated Control</h3>
              <p className="text-xs text-[#66736F] leading-relaxed">
                Delete permissions for memories and reminders are strictly restricted to Caregivers, protecting patients from accidental deletions.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F8FAF9] border border-[#164E48]/12 space-y-4">
              <Lock className="w-8 h-8 text-[#164E48]" />
              <h3 className="text-lg font-bold text-[#164E48]">HIPAA & SOC2 Readiness</h3>
              <p className="text-xs text-[#66736F] leading-relaxed">
                Architected to conform with healthcare security baselines, utilizing encrypted vector vaults for memory metadata.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F8FAF9] border border-[#164E48]/12 space-y-4">
              <Zap className="w-8 h-8 text-[#164E48]" />
              <h3 className="text-lg font-bold text-[#164E48]">AI Safety Guardrails</h3>
              <p className="text-xs text-[#66736F] leading-relaxed">
                LLM intent parsing enforces strict parameter validation prior to executing backend API tool calls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LANDING FOOTER ================= */}
      <LandingFooter />
    </div>
    </SmoothScroll>
  );
}
