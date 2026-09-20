'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Heart, ArrowRight, Loader2, AlertCircle, Shield, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/hooks/useLanguage';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'caregiver' | 'patient'>('caregiver');

  // Caregiver form state
  const [email, setEmail] = useState('priya.caregiver@example.com');
  const [password, setPassword] = useState('••••••••••••');

  // Patient PIN state
  const [pin, setPin] = useState('');

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

  const handlePinKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        handlePatientQuickLogin();
      }
    }
  };

  const handlePinClear = () => {
    setPin('');
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

        {/* ================= PATIENT INTUITIVE LOGIN FORM ================= */}
        {activeTab === 'patient' && (
          <div className="space-y-4 sm:space-y-6 text-center animate-in fade-in duration-200">
            {/* Patient Greeting & Avatar */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-[#E8F4F1] to-[#F5F8F6] rounded-2xl sm:rounded-3xl border-2 border-[#BFDCD6] space-y-2 sm:space-y-3">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#164E48] text-white flex items-center justify-center mx-auto text-2xl sm:text-3xl font-extrabold shadow-md border-2 sm:border-4 border-white">
                S
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#123B35]">Welcome Back, Sunita!</h2>
                <p className="text-xs text-[#66736F] font-medium">{t('patient.dailyCompanion')}</p>
              </div>
            </div>

            {/* Option 1: 1-Tap Quick Access Button */}
            <Button
              type="button"
              onClick={handlePatientQuickLogin}
              disabled={loading}
              className="w-full py-3.5 sm:py-4 text-sm sm:text-base font-extrabold bg-[#164E48] hover:bg-[#113e39] text-white shadow-xl rounded-2xl flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Opening Your Portal...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  <span>{t('patient.tapToSpeak')}</span>
                </>
              )}
            </Button>

            {/* Option 2: Big 4-Digit PIN Access */}
            <div className="space-y-2.5 sm:space-y-3 pt-2 border-t border-[#DDE7E3]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#123B35]">{t('login.patientSubheading')}</span>
                <button onClick={handlePinClear} className="text-[11px] font-bold text-[#17665B] hover:underline cursor-pointer">
                  {t('login.clearPin')}
                </button>
              </div>

              {/* PIN Display Dots */}
              <div className="flex justify-center space-x-2 sm:space-x-3">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center font-extrabold text-base sm:text-lg ${
                      pin.length > idx
                        ? 'border-[#164E48] bg-[#164E48] text-white shadow-sm'
                        : 'border-[#DDE7E3] bg-[#F5F8F6] text-transparent'
                    }`}
                  >
                    •
                  </div>
                ))}
              </div>

              {/* Numeric Keypad Buttons */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-w-[260px] sm:max-w-xs mx-auto pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinKeyPress(num)}
                    className="h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F5F8F6] hover:bg-[#BFDCD6]/40 text-[#123B35] font-extrabold text-base sm:text-lg border border-[#DDE7E3] active:scale-95 transition-transform cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <div />
                <button
                  type="button"
                  onClick={() => handlePinKeyPress('0')}
                  className="h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F5F8F6] hover:bg-[#BFDCD6]/40 text-[#123B35] font-extrabold text-base sm:text-lg border border-[#DDE7E3] active:scale-95 transition-transform cursor-pointer"
                >
                  0
                </button>
                <div />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
