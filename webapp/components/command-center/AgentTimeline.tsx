'use client';

import React from 'react';
import { TimelineStep } from '@/types/agent';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface AgentTimelineProps {
  timeline: TimelineStep[];
}

export function AgentTimeline({ timeline }: AgentTimelineProps) {
  const { t } = useLanguage();
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="rounded-3xl border border-[#DDE7E3] bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center space-x-2 pb-2 border-b border-[#DDE7E3]">
        <Sparkles className="w-5 h-5 text-[#17665B]" />
        <h4 className="text-base font-bold text-[#123B35]">{t('commandCenter.agentReasoningTitle')}</h4>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DDE7E3]">
        {timeline.map((step, idx) => (
          <motion.div
            key={step.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="relative flex flex-col"
          >
            {/* Step Node Marker */}
            <div className="absolute -left-[1.85rem] top-0.5 flex items-center justify-center bg-white rounded-full">
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-[#3E9C87]" />
              ) : step.status === 'failed' ? (
                <AlertCircle className="w-5 h-5 text-[#C85C82]" />
              ) : (
                <Circle className="w-5 h-5 text-[#17665B] animate-pulse" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#123B35]">{step.stepName}</span>
              {step.timestamp && (
                <span className="text-xs text-[#66736F]">{step.timestamp}</span>
              )}
            </div>

            {step.details && (
              <p className="text-xs text-[#66736F] mt-0.5 leading-relaxed bg-[#F5F8F6] p-2 rounded-xl border border-[#DDE7E3]/60">
                {step.details}
              </p>
            )}

            {step.result && (
              <span className="text-xs font-medium text-[#17665B] mt-1">
                ✓ {step.result}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
