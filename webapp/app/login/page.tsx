'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Heart, ArrowRight, Loader2, AlertCircle, Shield, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/hooks/useLanguage';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'caregiver' | 'patient'>('caregiver');

  // Caregiver form state
  const [email, setEmail] = useState('priya.caregiver@example.com');
  const [password, setPassword] = useState('••••••••••••');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCaregiverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.login(email, password, 'caregiver');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your network or backend URL.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientQuickLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await api.patientLogin();
      router.push('/dashboard');
    } catch (err: any) {
      setError('Patient quick login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-3 py-6 sm:p-6 bg-gradient-to-b from-[#F5F8F6] to-[#EAEFEA] overflow-y-auto">
      <Card className="w-full max-w-lg p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-2xl border-[#DDE7E3] bg-white rounded-2xl sm:rounded-3xl my-auto">
        {/* Logo & Brand Header */}
        <div className="text-center space-y-1.5">
          <img
            src="/logo.svg"
            alt="CogniTrace Logo"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mx-auto shadow-lg object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B35] tracking-tight">CogniTrace Care</h1>
          <p className="text-xs text-[#66736F] font-semibold">{t('login.subtitle')}</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 sm:p-1.5 bg-[#F5F8F6] rounded-2xl border border-[#DDE7E3]">
          <button
            type="button"
            onClick={() => { setActiveTab('caregiver'); setError(null); }}
            className={`py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 cursor-pointer ${
              activeTab === 'caregiver'
                ? 'bg-[#17665B] text-white shadow-md'
                : 'text-[#66736F] hover:text-[#123B35]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{t('login.caregiverTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('patient'); setError(null); }}
            className={`py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 cursor-pointer ${
              activeTab === 'patient'
                ? 'bg-[#164E48] text-white shadow-md'
                : 'text-[#66736F] hover:text-[#123B35]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-white shrink-0" />
            <span className="truncate">{t('login.patientTab')}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= CAREGIVER LOGIN FORM ================= */}
        {activeTab === 'caregiver' && (
          <form onSubmit={handleCaregiverLogin} className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">{t('login.emailLabel')}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya.caregiver@example.com"
                required
                className="h-10 sm:h-11 text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">{t('login.passwordLabel')}</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 sm:h-11 text-xs sm:text-sm"
              />
            </div>

            <Button type="submit" variant="default" disabled={loading} className="w-full shadow-md py-3 sm:py-3.5 font-bold text-xs sm:text-sm">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('login.signingIn')}
                </>
              ) : (
                <>
                  {t('login.signInCaregiver')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center text-xs text-[#66736F] pt-1 sm:pt-2">
              New caregiver?{' '}
              <Link href="/onboarding" className="font-bold text-[#17665B] hover:underline">
                Start Onboarding Setup
              </Link>
            </div>
          </form>
        )}

        {/* ================= 1-TAP PATIENT PORTAL ACCESS ================= */}
        {activeTab === 'patient' && (
          <div className="space-y-5 text-center animate-in fade-in duration-200">
            {/* Patient Welcome Card */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#E8F4F1] to-[#F5F8F6] rounded-2xl sm:rounded-3xl border-2 border-[#BFDCD6] space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#164E48] text-white flex items-center justify-center mx-auto text-2xl sm:text-3xl font-extrabold shadow-md border-4 border-white">
                S
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#123B35]">Welcome Back, Sunita!</h2>
                <p className="text-xs text-[#66736F] font-semibold mt-1">{t('patient.dailyCompanion')}</p>
              </div>
            </div>

            {/* Simplified 1-Tap Entrance Button */}
            <Button
              type="button"
              onClick={handlePatientQuickLogin}
              disabled={loading}
              className="w-full py-4 sm:py-5 text-base sm:text-lg font-extrabold bg-[#164E48] hover:bg-[#113e39] text-white shadow-xl rounded-2xl flex items-center justify-center space-x-2 cursor-pointer transition-transform active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entering Patient Portal...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2 text-[#C8ECE4] animate-bounce" />
                  <span>Tap to Enter Patient Portal</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
