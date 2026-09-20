'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Shield, Lightbulb, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface TipItem {
  id: string;
  category: string;
  title: string;
  tip: string;
  badge: string;
  theme: string;
}

interface QuickTipsData {
  greeting: string;
  relational_insight: string;
  quick_tips: TipItem[];
}

export function CaregiverQuickTipsCard({
  caregiverName = 'Priya',
  patientName = 'Sunita',
  relation = 'Daughter',
  stage = 'Middle Stage'
}: {
  caregiverName?: string;
  patientName?: string;
  relation?: string;
  stage?: string;
}) {
  const [tipsData, setTipsData] = useState<QuickTipsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTips = async () => {
    setLoading(true);
    try {
      const data = await api.fetchCommandCenterTips({
        caregiver_name: caregiverName,
        patient_name: patientName,
        relation: relation,
        cognitive_stage_or_notes: stage
      });
      setTipsData(data);
    } catch (e) {
      console.warn('Failed to load caregiver quick tips:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTips();
  }, [caregiverName, patientName, relation, stage]);

  if (loading) {
    return (
      <Card className="p-6 bg-white border border-[#DDE7E3] rounded-3xl shadow-sm space-y-4 animate-pulse">
        <div className="h-6 bg-slate-100 rounded-lg w-2/3" />
        <div className="h-12 bg-slate-50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
        </div>
      </Card>
    );
  }

  if (!tipsData) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-white via-[#F5F8F6] to-[#EFF7F5] border border-[#DDE7E3] rounded-3xl shadow-md space-y-5">
      {/* Header Greeting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#17665B] text-white flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#123B35]">{tipsData.greeting}</h3>
            <p className="text-xs text-[#66736F] font-medium">CogniTrace Care Engine • Relational Guidance</p>
          </div>
        </div>
        <button
          onClick={loadTips}
          className="p-2 rounded-xl text-[#17665B] hover:bg-[#BFDCD6]/30 transition-colors"
          title="Refresh Tips"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Relational Insight Banner */}
      <div className="p-4 rounded-2xl bg-[#BFDCD6]/30 border border-[#BFDCD6] flex items-start space-x-3">
        <Sparkles className="w-5 h-5 text-[#17665B] shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-[#123B35] leading-relaxed">
          {tipsData.relational_insight}
        </p>
      </div>

      {/* Quick Tips Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {tipsData.quick_tips.map((tip) => (
          <div
            key={tip.id}
            className="p-4 rounded-2xl bg-white border border-[#DDE7E3] shadow-xs space-y-2 hover:border-[#17665B] transition-all hover:shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#17665B] bg-[#BFDCD6]/20 px-2 py-0.5 rounded-md">
                  {tip.badge}
                </span>
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <h4 className="text-sm font-bold text-[#123B35]">{tip.title}</h4>
              <p className="text-xs text-[#66736F] leading-snug">
                {tip.tip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
