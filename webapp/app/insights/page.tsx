'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Activity, Calendar, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InsightsPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="teal">Care Intelligence</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            Observed Care Insights
          </h1>
          <p className="text-sm text-[#66736F]">
            Qualitative summaries & patterns synthesized over the last 6 months.
          </p>
        </div>
      </div>

      {/* AI Summary Card */}
      <Card className="card-hero p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#17665B]" />
            <h3 className="text-xl font-bold text-[#123B35]">Ask CogniTrace Care AI</h3>
          </div>
          <p className="text-sm text-[#66736F]">
            Have a question about recent observations or monthly shifts? Tap below to query the AI Voice Agent.
          </p>
        </div>
        <Button
          variant="default"
          size="lg"
          onClick={() => router.push('/command-center?q=What%20changed%20recently%20in%20Mom%27s%20care%3F')}
          className="shadow-md shrink-0"
        >
          What changed recently?
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>

      {/* What Changed 6-Month Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#123B35]">What Changed Over the Last 6 Months?</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Badge variant="teal" className="w-fit">Memory Observations</Badge>
              <CardTitle className="text-lg font-bold text-[#123B35] pt-1">
                Long-Term Memory Active
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#66736F]">
              <p className="leading-relaxed">
                Mom retains vivid memory of family trips from 1987. Short-term recall benefits from gentle morning routine structure.
              </p>
              <div className="p-2.5 rounded-xl bg-[#F5F8F6] border border-[#DDE7E3] font-semibold text-[#123B35]">
                ✓ Observed trend: Stable long-term memory
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Badge variant="accent" className="w-fit">Communication</Badge>
              <CardTitle className="text-lg font-bold text-[#123B35] pt-1">
                Expressive & Clear
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#66736F]">
              <p className="leading-relaxed">
                Communicates warm feelings and preferences clearly. Multilingual dialogue in native tongue brings extra comfort.
              </p>
              <div className="p-2.5 rounded-xl bg-[#F5F8F6] border border-[#DDE7E3] font-semibold text-[#123B35]">
                ✓ Observed trend: High engagement
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Badge variant="warning" className="w-fit">Daily Support Needs</Badge>
              <CardTitle className="text-lg font-bold text-[#123B35] pt-1">
                Guided Evening Routine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#66736F]">
              <p className="leading-relaxed">
                Evening medication prompt at 8:00 PM ensures consistent care routine. Evening walks maintain restful sleep.
              </p>
              <div className="p-2.5 rounded-xl bg-[#F5F8F6] border border-[#DDE7E3] font-semibold text-[#123B35]">
                ✓ Observed trend: Routine support effective
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
