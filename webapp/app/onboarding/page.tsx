'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [patientName, setPatientName] = useState('Mom (Sunita)');
  const [relationship, setRelationship] = useState('Mother');
  const [stage, setStage] = useState('Middle Stage');

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F8F6]">
      <Card className="w-full max-w-lg p-8 space-y-6 shadow-xl border-[#DDE7E3] bg-white">
        <div className="text-center space-y-2">
          <Badge variant="teal">Caregiver Setup</Badge>
          <h1 className="text-2xl font-extrabold text-[#123B35]">Welcome to CogniTrace Care</h1>
          <p className="text-xs text-[#66736F]">Let’s personalize your care journey</p>
        </div>

        <form onSubmit={handleFinish} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Loved One’s Name</label>
            <Input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Mom"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Relationship</label>
            <Input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Mother"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Current Care Assessment Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full h-11 rounded-2xl border border-[#DDE7E3] px-3 text-sm text-[#123B35]"
            >
              <option value="Early Stage">Early Stage</option>
              <option value="Middle Stage">Middle Stage</option>
              <option value="Late Stage">Late Stage</option>
            </select>
          </div>

          <Button type="submit" variant="default" className="w-full shadow-md py-3 font-bold mt-4">
            Complete Onboarding & Launch Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
