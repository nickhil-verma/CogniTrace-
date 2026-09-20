import type { Metadata } from 'next';
import { Geist, Geist_Mono, DM_Sans, Caveat } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/shell/AppShell';
import { LanguageProvider } from '@/hooks/useLanguage';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'CogniTrace | AI Cognitive Care Companion for Caregivers & Patients',
  description: 'Understand the journey. Act with confidence. CogniTrace is an AI-powered dementia and cognitive-care companion featuring voice command intelligence, memory reminiscence, and daily care tracking.',
  keywords: ['Cognitive Care', 'Dementia Care', 'Caregiver Assistant', 'AI Voice Command Center', 'CogniTrace', 'Healthcare AI'],
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${caveat.variable} ${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="bg-[#F5F8F6] text-[#123B35]">
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}

