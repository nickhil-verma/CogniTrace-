'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowRight, Loader2, AlertCircle, Shield, Mic, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-[#F5F8F6] to-[#EAEFEA]">
      <Card className="w-full max-w-lg p-8 space-y-6 shadow-2xl border-[#DDE7E3] bg-white rounded-3xl">
        {/* Logo & Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#17665B] to-[#3E9C87] text-white flex items-center justify-center mx-auto shadow-lg border-2 border-white">
            <Heart className="w-7 h-7 fill-current text-[#BFDCD6]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight">CogniTrace Care</h1>
          <p className="text-xs text-[#66736F] font-semibold">Multimodal Dementia & Cognitive Care Portal</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F5F8F6] rounded-2xl border border-[#DDE7E3]">
          <button
            type="button"
            onClick={() => { setActiveTab('caregiver'); setError(null); }}
            className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'caregiver'
                ? 'bg-[#17665B] text-white shadow-md'
                : 'text-[#66736F] hover:text-[#123B35]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Caregiver Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('patient'); setError(null); }}
            className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'patient'
                ? 'bg-[#E36C59] text-white shadow-md'
                : 'text-[#66736F] hover:text-[#123B35]'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Patient Portal Access</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= CAREGIVER LOGIN FORM ================= */}
        {activeTab === 'caregiver' && (
          <form onSubmit={handleCaregiverLogin} className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">Caregiver Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya.caregiver@example.com"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="default" disabled={loading} className="w-full shadow-md py-3.5 font-bold text-sm">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating Caregiver...
                </>
              ) : (
                <>
                  Sign In to Caregiver Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center text-xs text-[#66736F] pt-2">
              New caregiver?{' '}
              <Link href="/onboarding" className="font-bold text-[#17665B] hover:underline">
                Start Onboarding Setup
              </Link>
            </div>
          </form>
        )}

        {/* ================= PATIENT INTUITIVE LOGIN FORM ================= */}
        {activeTab === 'patient' && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            {/* Patient Greeting & Avatar */}
            <div className="p-6 bg-gradient-to-r from-[#FFF0ED] to-[#FFF5F2] rounded-3xl border-2 border-[#F7DDE5] space-y-3">
              <div className="w-20 h-20 rounded-full bg-[#E36C59] text-white flex items-center justify-center mx-auto text-3xl font-extrabold shadow-md border-4 border-white">
                S
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#123B35]">Welcome Back, Sunita!</h2>
                <p className="text-xs text-[#66736F] font-medium">Mom’s Simplified Companion Portal</p>
              </div>
            </div>

            {/* Option 1: 1-Tap Quick Access Button */}
            <Button
              type="button"
              onClick={handlePatientQuickLogin}
              disabled={loading}
              className="w-full py-4 text-base font-extrabold bg-[#E36C59] hover:bg-[#c85544] text-white shadow-xl rounded-2xl flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Opening Your Portal...
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5 mr-2" />
                  <span>Tap Here to Open My Portal</span>
                </>
              )}
            </Button>

            {/* Option 2: Big 4-Digit PIN Access */}
            <div className="space-y-3 pt-2 border-t border-[#DDE7E3]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#123B35]">Or Enter 4-Digit PIN:</span>
                <button onClick={handlePinClear} className="text-[11px] font-bold text-[#C85C82] hover:underline">
                  Clear
                </button>
              </div>

              {/* PIN Display Dots */}
              <div className="flex justify-center space-x-3">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-extrabold text-lg ${
                      pin.length > idx
                        ? 'border-[#E36C59] bg-[#E36C59] text-white shadow-sm'
                        : 'border-[#DDE7E3] bg-[#F5F8F6] text-transparent'
                    }`}
                  >
                    •
                  </div>
                ))}
              </div>

              {/* Numeric Keypad Buttons */}
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinKeyPress(num)}
                    className="h-12 rounded-2xl bg-[#F5F8F6] hover:bg-[#BFDCD6]/40 text-[#123B35] font-extrabold text-lg border border-[#DDE7E3] active:scale-95 transition-transform"
                  >
                    {num}
                  </button>
                ))}
                <div />
                <button
                  type="button"
                  onClick={() => handlePinKeyPress('0')}
                  className="h-12 rounded-2xl bg-[#F5F8F6] hover:bg-[#BFDCD6]/40 text-[#123B35] font-extrabold text-lg border border-[#DDE7E3] active:scale-95 transition-transform"
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
