'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/hooks/useLanguage';

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState('Priya Sharma');
  const [email, setEmail] = useState('priya.caregiver@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [patientName, setPatientName] = useState('Mom (Sunita)');
  const [relationship, setRelationship] = useState('Mother');
  const [stage, setStage] = useState('Middle Stage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.signup({
        name,
        email,
        password,
        patient_name: patientName,
        relationship,
        stage,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Onboarding registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F8F6]">
      <Card className="w-full max-w-lg p-8 space-y-6 shadow-xl border-[#DDE7E3] bg-white">
        <div className="text-center space-y-2">
          <Badge variant="teal">{t('onboarding.badge')}</Badge>
          <h1 className="text-2xl font-extrabold text-[#123B35]">{t('onboarding.title')}</h1>
          <p className="text-xs text-[#66736F]">{t('onboarding.subtitle')}</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFinish} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('onboarding.caregiverName')}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('onboarding.emailLabel')}</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('onboarding.passwordLabel')}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('onboarding.lovedOneName')}</label>
            <Input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Mom (Sunita)"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('onboarding.relationship')}</label>
            <Input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Mother"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('onboarding.currentStage')}</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full h-11 rounded-2xl border border-[#DDE7E3] px-3 text-sm text-[#123B35]"
            >
              <option value="Early Stage">{t('onboarding.stageEarly')}</option>
              <option value="Middle Stage">{t('onboarding.stageMiddle')}</option>
              <option value="Late Stage">{t('onboarding.stageAdvanced')}</option>
            </select>
          </div>

          <Button type="submit" variant="default" disabled={loading} className="w-full shadow-md py-3 font-bold mt-4">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('onboarding.settingUp')}
              </>
            ) : (
              <>
                {t('onboarding.completeSetup')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
