'use client';

import React from 'react';
import { TrendChart } from '@/components/tracking/TrendChart';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ShieldCheck, Heart, Info, ArrowUpRight } from 'lucide-react';

export default function TrackingPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="teal">Observational Tracking</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            Care & Cognitive Observations
          </h1>
          <p className="text-sm text-[#66736F]">
            Calm, respectful trends across daily memory, communication, and independence over time.
          </p>
        </div>
      </div>

      {/* Stage Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-[#17665B]">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-[#66736F]">Current Assessment</CardDescription>
            <CardTitle className="text-2xl font-bold text-[#123B35]">Middle Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#66736F] leading-relaxed">
              Requires gentle guidance for evening medication routines. Memory recall is warm & active.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-[#66736F]">Previous Assessment</CardDescription>
            <CardTitle className="text-xl font-bold text-[#66736F]">Middle Stage (Early)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#66736F] leading-relaxed">
              Observed 4 months ago during routine neurologist consultation with Dr. Sharma.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#BFDCD6]/20 border-[#BFDCD6]">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-[#17665B]">Care Need Summary</CardDescription>
            <CardTitle className="text-xl font-bold text-[#123B35]">Support Pattern Stable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#123B35] leading-relaxed">
              Routine daily walks & family photo conversations keep engagement high and mood calm.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Recharts Visual Area */}
      <Card className="p-6">
        <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-[#123B35]">6-Month Care Observation Trend</CardTitle>
            <CardDescription className="text-xs text-[#66736F]">
              Neutral indicators: Memory recall, Communication expressiveness, Daily independence
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold mt-3 md:mt-0">
            <span className="flex items-center text-[#17665B]">
              <span className="w-3 h-3 rounded-full bg-[#17665B] mr-1.5" /> Memory recall
            </span>
            <span className="flex items-center text-[#3E9C87]">
              <span className="w-3 h-3 rounded-full bg-[#3E9C87] mr-1.5" /> Communication
            </span>
            <span className="flex items-center text-[#C85C82]">
              <span className="w-3 h-3 rounded-full bg-[#C85C82] mr-1.5" /> Daily independence
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <TrendChart />
        </CardContent>
      </Card>

      {/* Observation Categories Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#123B35]">Recent Observations Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Memory recall', detail: 'Recognized old photographs from 1987 instantly during tea time.', status: 'Stable' },
              { label: 'Communication', detail: 'Expressed preferences for lunch clearly with gentle pacing.', status: 'Stable' },
              { label: 'Daily independence', detail: 'Needed verbal guidance for evening medication tablet.', status: 'Slight support' },
              { label: 'Activity pattern', detail: 'Enjoyed 20-minute neighborhood walk with caregiver.', status: 'Active' }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#F5F8F6] border border-[#DDE7E3] space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#123B35]">
                  <span>{item.label}</span>
                  <Badge variant="default">{item.status}</Badge>
                </div>
                <p className="text-xs text-[#66736F]">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#123B35]">Care Guidance Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-[#66736F] leading-relaxed">
            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#F7DDE5]/40 border border-[#F7DDE5]">
              <Info className="w-5 h-5 text-[#C85C82] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#123B35]">Observational Methodology</span>
                <p className="mt-1">
                  CogniTrace observations are generated from daily caregiver notes and voice interactions. They serve as supportive care insights and do not make clinical medical claims.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-[#DDE7E3] space-y-2">
              <span className="font-bold text-[#123B35]">Recommended Next Steps</span>
              <ul className="list-disc pl-4 space-y-1 text-[#66736F]">
                <li>Maintain consistent evening medication timing at 8:00 PM</li>
                <li>Continue Reminiscence photo sessions twice weekly</li>
                <li>Share 6-month observation log with Dr. Anita Sharma during next evaluation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
