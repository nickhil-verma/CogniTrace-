'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Heart, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('priya.caregiver@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your network or backend URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F8F6]">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl border-[#DDE7E3] bg-white">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#17665B] text-white flex items-center justify-center mx-auto shadow-md">
            <Heart className="w-6 h-6 fill-current text-[#BFDCD6]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#123B35]">Welcome to CogniTrace</h1>
          <p className="text-xs text-[#66736F]">Sign in to your caregiver portal</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <Button type="submit" variant="default" disabled={loading} className="w-full shadow-md py-3 font-bold">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-[#66736F] pt-2">
          New caregiver?{' '}
          <Link href="/onboarding" className="font-bold text-[#17665B] hover:underline">
            Start Onboarding
          </Link>
        </div>
      </Card>
    </div>
  );
}
