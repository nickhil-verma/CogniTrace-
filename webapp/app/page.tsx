'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  Heart,
  LineChart,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Globe,
  FileEdit,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F8F6] text-[#123B35] font-sans antialiased selection:bg-[#BFDCD6]">
      {/* ================= LANDING HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#DDE7E3]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#17665B] text-white flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 fill-current text-[#BFDCD6]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#123B35]">CogniTrace</span>
              <span className="block text-[10px] font-semibold text-[#3E9C87] tracking-widest uppercase">
                Cognitive Care
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#66736F]">
            <a href="#voice-center" className="hover:text-[#17665B] transition-colors">AI Command Center</a>
            <a href="#tracking" className="hover:text-[#17665B] transition-colors">Cognitive Tracking</a>
            <a href="#memories" className="hover:text-[#17665B] transition-colors">Memories</a>
            <a href="#languages" className="hover:text-[#17665B] transition-colors">Multilingual</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-[#17665B]">
                Log In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="default" size="sm" className="shadow-md">
                Start with CogniTrace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        {/* Soft Organic Background Shape */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-br from-[#BFDCD6]/30 via-[#F7DDE5]/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-[#DDE7E3] shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#17665B]" />
            <span className="text-xs font-semibold text-[#17665B]">
              AI-Powered Cognitive Care Companion
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#123B35] leading-tight">
              CogniTrace
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-[#17665B] tracking-tight">
              Understand the journey. Act with confidence.
            </p>
          </div>

          <p className="max-w-2xl mx-auto text-lg text-[#66736F] leading-relaxed">
            An AI-powered companion for cognitive care, built to help caregivers understand changes,
            manage everyday care, and never feel alone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button variant="default" size="lg" className="w-full sm:w-auto shadow-lg text-base">
                Start with CogniTrace
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/command-center">
              <Button variant="mint" size="lg" className="w-full sm:w-auto text-base">
                <Mic className="w-4 h-4 mr-2 text-[#17665B]" />
                Explore AI Command Center
              </Button>
            </Link>
          </div>

          {/* Hero Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="pt-10"
          >
            <div className="max-w-3xl mx-auto rounded-3xl border border-[#DDE7E3] bg-white p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#DDE7E3] pb-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-[#C85C82]" />
                  <div className="w-3 h-3 rounded-full bg-[#E7A23B]" />
                  <div className="w-3 h-3 rounded-full bg-[#3E9C87]" />
                  <span className="text-xs font-semibold text-[#66736F] ml-2">CogniTrace Agent Active</span>
                </div>
                <Badge variant="teal">AI Voice Command Center</Badge>
              </div>

              {/* Simulated Voice Orb & Prompt */}
              <div className="flex flex-col items-center space-y-6 py-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#17665B] to-[#BFDCD6] p-1 shadow-lg animate-pulse flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Mic className="w-8 h-8 text-[#17665B]" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-lg font-bold text-[#123B35]">"How has Mom been doing this week?"</p>
                  <p className="text-xs text-[#66736F]">Voice input processed naturally</p>
                </div>

                {/* Reasoning Timeline Mock */}
                <div className="w-full max-w-md bg-[#F5F8F6] p-4 rounded-2xl border border-[#DDE7E3] space-y-2 text-left text-xs">
                  <div className="flex items-center text-[#3E9C87] font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                    <span>Reviewed recent observations</span>
                  </div>
                  <div className="flex items-center text-[#3E9C87] font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                    <span>Compared memory & routine care changes</span>
                  </div>
                  <div className="flex items-center text-[#17665B] font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                    <span>Generated care summary: "Mom’s memory recall is stable."</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= SECTION 1: AI VOICE COMMAND CENTER ================= */}
      <section id="voice-center" className="py-20 px-6 bg-white border-y border-[#DDE7E3]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="pink">Primary Feature</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#123B35] leading-tight">
              AI Voice Command Center
            </h2>
            <p className="text-[#66736F] leading-relaxed">
              Speak naturally to CogniTrace. Say "Remind Mom to take her medicine at 8 tonight", and watch the agent understand intent, reason through care context, execute backend tools, and respond with soothing audio.
            </p>
            <div className="space-y-3 pt-2">
              {[
                'Natural speech recognition in multiple languages',
                'Visual timeline showing step-by-step reasoning',
                'Extensible tool execution for reminders & appointments',
                'Polly speech synthesis audio feedback'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-sm font-semibold text-[#123B35]">
                  <CheckCircle2 className="w-5 h-5 text-[#3E9C87] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-[#F5F8F6] border border-[#DDE7E3] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#66736F]">Voice Interaction Flow</span>
              <Mic className="w-5 h-5 text-[#17665B]" />
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#DDE7E3] font-semibold text-[#123B35]">
                1. Voice Input → "Remind Mom to take her medicine at 8 tonight"
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#DDE7E3] font-semibold text-[#17665B]">
                2. Agent Reasoning → Parsed dosage & time parameters
              </div>
              <div className="p-3 bg-[#BFDCD6]/30 rounded-xl border border-[#BFDCD6] font-semibold text-[#123B35]">
                3. Tool Execution → ✓ Medication reminder created
              </div>
              <div className="p-3 bg-[#17665B] text-white rounded-xl font-semibold">
                4. AI Voice Response → "I’ve set the reminder for 8:00 PM."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: UNDERSTAND CHANGES OVER TIME ================= */}
      <section id="tracking" className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 p-8 rounded-3xl bg-white border border-[#DDE7E3] shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDE7E3]">
              <h4 className="font-bold text-[#123B35]">Care Trend Observations</h4>
              <Badge variant="teal">Middle Stage</Badge>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#F5F8F6] rounded-xl">
                <span className="font-semibold text-[#123B35]">Memory recall</span>
                <span className="text-[#17665B] font-bold">Stable</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5F8F6] rounded-xl">
                <span className="font-semibold text-[#123B35]">Communication</span>
                <span className="text-[#3E9C87] font-bold">Expressive</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5F8F6] rounded-xl">
                <span className="font-semibold text-[#123B35]">Daily independence</span>
                <span className="text-[#E7A23B] font-bold">Needs slight support</span>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <Badge variant="default">Calm Visualization</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#123B35] leading-tight">
              Understand changes over time
            </h2>
            <p className="text-[#66736F] leading-relaxed">
              Track cognitive changes with neutral, respectful terminology like "Observed changes" and "Care needs", avoiding alarming medical diagnosis jargon.
            </p>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: KEEP IMPORTANT MEMORIES CLOSE ================= */}
      <section id="memories" className="py-20 px-6 bg-white border-y border-[#DDE7E3]">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-4">
            <Badge variant="pink">Memory Vault & Reminiscence</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#123B35]">
              Keep important memories close
            </h2>
            <p className="text-[#66736F]">
              Preserve precious family photos and trigger warm Reminiscence Conversations with tailored prompts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              {
                title: 'Family Vacation in Goa',
                date: 'Summer 1987',
                img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
                prompt: '"Mom, do you remember watching the ocean waves in Goa?"'
              },
              {
                title: 'Spring Garden & Yellow Roses',
                date: 'March 2015',
                img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
                prompt: '"Mom, look at the vibrant roses you planted in the yard!"'
              },
              {
                title: 'Granddaughter Graduation Day',
                date: 'June 2021',
                img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
                prompt: '"Mom, remember how proud you were of Ananya?"'
              }
            ].map((mem, idx) => (
              <div key={idx} className="rounded-3xl border border-[#DDE7E3] bg-[#F5F8F6] overflow-hidden shadow-xs space-y-3 p-4">
                <img src={mem.img} alt={mem.title} className="w-full h-40 object-cover rounded-2xl" />
                <span className="text-xs font-semibold text-[#17665B]">{mem.date}</span>
                <h4 className="font-bold text-[#123B35]">{mem.title}</h4>
                <p className="text-xs text-[#66736F] italic bg-white p-2.5 rounded-xl border border-[#DDE7E3]">
                  {mem.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 4 & 5: REMINDERS & JOURNAL ================= */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-8 rounded-3xl bg-white border border-[#DDE7E3] space-y-5">
            <div className="p-3 w-fit rounded-2xl bg-[#BFDCD6]/40 text-[#17665B]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#123B35]">Never miss everyday care</h3>
            <p className="text-sm text-[#66736F] leading-relaxed">
              Manage daily routine reminders for medications, doctor appointments, and physical activities with status tracking.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-white border border-[#DDE7E3] space-y-5">
            <div className="p-3 w-fit rounded-2xl bg-[#F7DDE5] text-[#C85C82]">
              <FileEdit className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#123B35]">Caregiver daily journal</h3>
            <p className="text-sm text-[#66736F] leading-relaxed">
              Record daily reflective observations and use AI feature "Summarize my week" to generate weekly care summaries.
            </p>
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: MULTILINGUAL AI SUPPORT ================= */}
      <section id="languages" className="py-16 px-6 bg-white border-y border-[#DDE7E3]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="teal">Multilingual Dialogue</Badge>
          <h2 className="text-3xl font-extrabold text-[#123B35]">
            Care in your native language
          </h2>
          <p className="text-[#66736F]">
            CogniTrace supports dialogue and audio synthesis in English, Hindi, Bengali, and Assamese.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {['English', 'हिंदी (Hindi)', 'বাংলা (Bengali)', 'অসমীয়া (Assamese)'].map((lang, i) => (
              <span key={i} className="px-5 py-2.5 rounded-full bg-[#F5F8F6] border border-[#DDE7E3] text-sm font-bold text-[#123B35]">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 7: FINAL CTA ================= */}
      <section className="py-24 px-6 text-center bg-gradient-to-b from-[#F5F8F6] to-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#123B35] leading-tight">
            You don't have to navigate cognitive care alone.
          </h2>
          <p className="text-lg text-[#66736F]">
            CogniTrace gives you clarity, calm voice controls, and intelligent action support every step of the journey.
          </p>
          <Link href="/dashboard">
            <Button variant="default" size="lg" className="shadow-xl px-8 text-base">
              Get Started with CogniTrace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-8 px-6 bg-white border-t border-[#DDE7E3] text-center text-xs text-[#66736F]">
        <p>© 2026 CogniTrace. Built with care for caregivers and patients.</p>
      </footer>
    </div>
  );
}
