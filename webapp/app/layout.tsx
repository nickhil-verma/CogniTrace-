import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'CogniTrace | AI Cognitive Care Companion for Caregivers & Patients',
  description: 'Understand the journey. Act with confidence. CogniTrace is an AI-powered dementia and cognitive-care companion featuring voice command intelligence, memory reminiscence, and daily care tracking.',
  keywords: ['Cognitive Care', 'Dementia Care', 'Caregiver Assistant', 'AI Voice Command Center', 'CogniTrace', 'Healthcare AI'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-[#F5F8F6] text-[#123B35]">
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}

