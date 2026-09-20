'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Mic,
  LineChart,
  Image as ImageIcon,
  Calendar,
  Bell,
  Sparkles,
  BookOpen,
  FileEdit,
  Settings,
  PhoneCall,
  Home,
  Volume2
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { RoleSwitcher } from './RoleSwitcher';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/hooks/useLanguage';
import { usePatientSettings } from '@/hooks/usePatientSettings';
import { speakText } from '@/lib/speech';
import { ToastContainer } from '@/components/ui/toast';
import { PatientSpeechPlaybackBar } from '@/components/patient/PatientSpeechPlaybackBar';


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isPatient, mounted } = useUserRole();
  const { t } = useLanguage();
  const { settings } = usePatientSettings();

  const emergencyDial = settings?.emergencyContact || '911';

  const caregiverOnlyRoutes = ['/tracking', '/insights', '/journal', '/resources', '/appointments'];

  React.useEffect(() => {
    if (mounted && isPatient && caregiverOnlyRoutes.includes(pathname)) {
      router.replace('/command-center');
    }
  }, [mounted, isPatient, pathname, router]);

  if (pathname === '/' || pathname === '/login' || pathname === '/onboarding') {
    return (
      <>
        <ToastContainer />
        {children}
      </>
    );
  }

  if (mounted && isPatient && caregiverOnlyRoutes.includes(pathname)) {
    return null;
  }

  const caregiverNav = [
    { label: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.voiceCommand'), href: '/command-center', icon: Mic, highlight: true },
    { label: t('nav.careTracking'), href: '/tracking', icon: LineChart },
    { label: t('nav.memories'), href: '/memories', icon: ImageIcon },
    { label: t('nav.appointments'), href: '/appointments', icon: Calendar },
    { label: t('nav.reminders'), href: '/reminders', icon: Bell },
    { label: t('nav.insights'), href: '/insights', icon: Sparkles },
    { label: t('nav.journal'), href: '/journal', icon: FileEdit },
    { label: t('nav.resources'), href: '/resources', icon: BookOpen },
    { label: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  const patientNav = [
    { label: t('nav.returnHome') || 'Return Home', href: '/dashboard', icon: Home, ttsText: 'Return Home' },
    { label: t('nav.talkWithVoiceAI'), href: '/command-center', icon: Mic, highlight: true, ttsText: 'Talk with Voice AI' },
    { label: t('nav.myPhotoAlbum'), href: '/memories', icon: ImageIcon, ttsText: 'My Photo Album' },
    { label: t('nav.memoryGames') || 'Memory Games', href: '/patient/memory-trivia', icon: Sparkles, ttsText: 'Memory Games' },
    { label: t('nav.todaysReminders'), href: '/reminders', icon: Bell, ttsText: 'Today’s Reminders' },
  ];

  const mobileBottomNav = [
    { label: t('nav.home'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.voice'), href: '/command-center', icon: Mic, isVoiceOrb: true },
    { label: t('nav.memories'), href: '/memories', icon: ImageIcon },
    { label: t('nav.reminders'), href: '/reminders', icon: Bell },
    { label: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  const navItems = isPatient ? patientNav : caregiverNav;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans antialiased ${
      isPatient ? 'bg-[#FFFBF5] text-[#123B35]' : 'bg-[#F5F8F6] text-[#123B35]'
    }`}>
      <ToastContainer />
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#DDE7E3] bg-white p-5 space-y-6 shrink-0 justify-between sticky top-0 h-screen">
        <div className="space-y-5">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <Link href={isPatient ? "/command-center" : "/dashboard"} className="flex items-center space-x-3 group">
              <img
                src="/logo.svg"
                alt="CogniTrace Logo"
                className="w-10 h-10 rounded-2xl shadow-md object-contain transition-transform group-hover:scale-105"
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#123B35]">CogniTrace</h1>
                <span className="text-[10px] font-semibold text-[#3E9C87] tracking-widest uppercase">
                  {isPatient ? t('common.patientPortal') : t('common.cognitiveCare')}
                </span>
              </div>
            </Link>
          </div>

          {/* Role Status Badge */}
          <div className="pt-1 pb-1">
            <RoleSwitcher className="w-full" />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#164E48] text-white shadow-sm'
                      : item.highlight
                      ? 'bg-[#BFDCD6]/30 text-[#123B35] hover:bg-[#BFDCD6]/60 border border-[#BFDCD6]/50'
                      : 'text-[#66736F] hover:bg-[#F5F8F6] hover:text-[#123B35]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-[#17665B]'
                          : 'text-[#66736F]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {isPatient && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          speakText((item as any).ttsText || item.label);
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          isActive ? 'text-white/80 hover:text-white' : 'text-[#17665B] hover:bg-[#E8F4F1]'
                        }`}
                        title="Tap to hear label"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                    {item.highlight && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#17665B] animate-ping" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Language & Profile */}
        <div className="pt-4 border-t border-[#DDE7E3] space-y-3">
          <LanguageSelector direction="up" className="w-full" />
          {isPatient ? (
            <a
              href={`tel:${emergencyDial}`}
              className="flex items-center justify-center space-x-2 w-full p-2.5 rounded-2xl bg-red-500 text-white font-bold text-xs shadow-md hover:bg-red-600 transition-colors"
              title={`Emergency Dial: ${emergencyDial}`}
            >
              <PhoneCall className="w-4 h-4 animate-bounce shrink-0" />
              <span className="truncate">Emergency ({emergencyDial})</span>
            </a>
          ) : (
            <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-[#F5F8F6] border border-[#DDE7E3]">
              <div className="w-8 h-8 rounded-full bg-[#3E9C87] text-white flex items-center justify-center font-bold text-xs">
                P
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#123B35] truncate">{t('nav.caregiverTitle')}</p>
                <p className="text-[10px] text-[#66736F] truncate">{t('nav.caregiverTeam')}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 bg-white border-b border-[#DDE7E3] sticky top-0 z-40 gap-1.5 sm:gap-2">
        <Link href={isPatient ? "/command-center" : "/dashboard"} className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <img
            src="/logo.svg"
            alt="CogniTrace Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-contain shrink-0"
          />
          <span className="text-sm sm:text-base font-bold text-[#123B35] tracking-tight truncate max-w-[100px] xs:max-w-none">CogniTrace</span>
        </Link>
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 min-w-0">
          <LanguageSelector direction="down" />
          <RoleSwitcher compact className="shrink-0" />
        </div>
      </header>

      {/* ================= MAIN CONTENT WORKSPACE ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        <PatientSpeechPlaybackBar />
        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-8 mb-24 md:mb-0 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#DDE7E3] px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-around shadow-lg">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isVoiceOrb) {
            return (
              <Link
                key={item.href}
                href={isPatient ? '/dashboard' : item.href}
                className="relative -top-4 sm:-top-5 flex flex-col items-center group shrink-0"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-[#F5F8F6] bg-gradient-to-tr from-[#164E48] to-[#3E9C87] group-active:scale-95 transition-transform">
                  <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#17665B] mt-0.5">{t('nav.voiceAi')}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-1.5 sm:px-2.5 rounded-xl transition-colors ${
                isActive ? 'text-[#164E48] font-bold' : 'text-[#66736F]'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
              <span className="text-[9px] sm:text-[10px] truncate max-w-[64px] text-center">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
