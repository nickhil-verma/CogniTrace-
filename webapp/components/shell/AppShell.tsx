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
  Heart,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Voice Command', href: '/command-center', icon: Mic, highlight: true },
  { label: 'Care Tracking', href: '/tracking', icon: LineChart },
  { label: 'Memories', href: '/memories', icon: ImageIcon },
  { label: 'Appointments', href: '/appointments', icon: Calendar },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Insights', href: '/insights', icon: Sparkles },
  { label: 'Journal', href: '/journal', icon: FileEdit },
  { label: 'Resources', href: '/resources', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const MOBILE_BOTTOM_NAV = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tracking', href: '/tracking', icon: LineChart },
  { label: 'Voice', href: '/command-center', icon: Mic, isVoiceOrb: true },
  { label: 'Memories', href: '/memories', icon: ImageIcon },
  { label: 'More', href: '/settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // If on Landing page `/`, don't wrap in app sidebar shell
  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F5F8F6] text-[#123B35] flex flex-col md:flex-row font-sans antialiased">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#DDE7E3] bg-white p-5 space-y-6 shrink-0 justify-between sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center space-x-3 px-2 group">
            <div className="w-10 h-10 rounded-2xl bg-[#17665B] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-current text-[#BFDCD6]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#123B35]">CogniTrace</h1>
              <span className="text-[10px] font-semibold text-[#3E9C87] tracking-widest uppercase">
                Cognitive Care
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#17665B] text-white shadow-sm'
                      : item.highlight
                      ? 'bg-[#BFDCD6]/30 text-[#123B35] hover:bg-[#BFDCD6]/60 border border-[#BFDCD6]/50'
                      : 'text-[#66736F] hover:bg-[#F5F8F6] hover:text-[#123B35]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-[#17665B]'
                          : 'text-[#66736F]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#17665B] animate-ping" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Language Selector & Caregiver Profile */}
        <div className="pt-4 border-t border-[#DDE7E3] space-y-3">
          <LanguageSelector />
          <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-[#F5F8F6] border border-[#DDE7E3]">
            <div className="w-8 h-8 rounded-full bg-[#3E9C87] text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#123B35] truncate">Priya (Caregiver)</p>
              <p className="text-[10px] text-[#66736F] truncate">Mom’s Care Team</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#DDE7E3] sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#17665B] text-white flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#BFDCD6]" />
          </div>
          <span className="text-lg font-bold text-[#123B35]">CogniTrace</span>
        </Link>
        <div className="flex items-center space-x-2">
          <LanguageSelector />
        </div>
      </header>

      {/* ================= MAIN CONTENT WORKSPACE ================= */}
      <main className="flex-1 min-w-0 p-4 md:p-8 mb-20 md:mb-0 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#DDE7E3] px-3 py-2 flex items-center justify-around shadow-lg">
        {MOBILE_BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isVoiceOrb) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 flex flex-col items-center group"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#17665B] to-[#3E9C87] text-white flex items-center justify-center shadow-xl border-4 border-[#F5F8F6] group-active:scale-95 transition-transform">
                  <Mic className="w-6 h-6 text-white animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-[#17665B] mt-0.5">Voice AI</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                isActive ? 'text-[#17665B] font-bold' : 'text-[#66736F]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
