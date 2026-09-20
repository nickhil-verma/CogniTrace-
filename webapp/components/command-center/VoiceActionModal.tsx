'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Image as ImageIcon, Bell, X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentActionItem } from '@/types/agent';

interface VoiceActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionItem: AgentActionItem | null;
  onConfirm?: () => void;
}

export function VoiceActionModal({ isOpen, onClose, actionItem, onConfirm }: VoiceActionModalProps) {
  const router = useRouter();

  if (!isOpen || !actionItem) return null;

  const modalType = (actionItem as any).modalType || (actionItem.toolType === 'complete_reminder' ? 'VERIFY_COMPLETE' : (actionItem.toolType === 'retrieve_memory' ? 'MEMORIES_PREVIEW' : 'VERIFY_ADD'));
  const targetRoute = (actionItem as any).targetRoute || (actionItem.toolType === 'retrieve_memory' ? '/memories' : null);

  const handleActionClick = () => {
    if (onConfirm) onConfirm();
    if (targetRoute) {
      router.push(targetRoute);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123B35]/40 backdrop-blur-md p-4 animate-in fade-in duration-300 select-none"
      onClick={(e) => {
        if (modalType === 'MEMORIES_PREVIEW') {
          handleActionClick();
        }
      }}
    >
      <div
        className={`bg-white rounded-[2rem] shadow-2xl border border-[#164E48]/10 max-w-md w-full p-8 space-y-6 relative overflow-hidden ${
          modalType === 'MEMORIES_PREVIEW' ? 'cursor-pointer hover:ring-2 hover:ring-[#164E48]/40 transition-all' : ''
        }`}
        onClick={(e) => {
          if (modalType === 'MEMORIES_PREVIEW') {
            handleActionClick();
          } else {
            e.stopPropagation();
          }
        }}
      >
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {modalType === 'VERIFY_COMPLETE' && (
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#10B981] flex items-center justify-center shadow-md animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            )}
            {modalType === 'MEMORIES_PREVIEW' && (
              <div className="w-14 h-14 rounded-2xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center shadow-md">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
            {modalType === 'VERIFY_ADD' && (
              <div className="w-14 h-14 rounded-2xl bg-[#E8F4F1] text-[#164E48] flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-[#123B35]">
                {modalType === 'VERIFY_COMPLETE' ? 'Task Verified Completed 🎉' : (modalType === 'MEMORIES_PREVIEW' ? 'Family Memory Album' : 'New Care Reminder Scheduled')}
              </h3>
              <p className="text-xs font-bold text-[#3D615B] uppercase tracking-micro">Voice AI Clinical Confirmation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#E8F4F1] text-[#164E48] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div
          onClick={() => {
            if (modalType === 'MEMORIES_PREVIEW') {
              handleActionClick();
            }
          }}
          className={`space-y-4 bg-[#F5F8F6] p-5 rounded-2xl border border-[#164E48]/10 transition-all ${
            modalType === 'MEMORIES_PREVIEW' ? 'cursor-pointer hover:border-[#164E48] hover:shadow-md group' : ''
          }`}
        >
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-[#123B35] flex items-center space-x-2">
              <span>{actionItem.title}</span>
            </h4>
            <p className="text-xs text-[#3D615B] leading-relaxed font-medium">
              {actionItem.description}
            </p>
          </div>

          {/* Memory Card Preview */}
          {modalType === 'MEMORIES_PREVIEW' && (
            <div className="pt-2">
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#164E48]/15">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                  alt="Family Memory"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3.5 text-white">
                  <p className="text-xs font-extrabold flex items-center justify-between">
                    <span>Goa Beach Family Vacation (1987)</span>
                    <ArrowRight className="w-4 h-4 text-emerald-300" />
                  </p>
                  <p className="text-[10px] text-white/90">Mom, Dad, and Priya watching sunset ocean waves</p>
                </div>
              </div>
              <p className="text-[11px] font-bold text-[#164E48] mt-2.5 text-center group-hover:underline flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-[#10B981]" />
                Tap anywhere on modal to open full memory album
              </p>
            </div>
          )}

          {/* Parameters List */}
          {actionItem.parameters && Object.keys(actionItem.parameters).length > 0 && modalType !== 'MEMORIES_PREVIEW' && (
            <div className="pt-2 flex flex-wrap gap-2 border-t border-[#164E48]/10">
              {Object.entries(actionItem.parameters).map(([key, val]) => (
                <span key={key} className="inline-flex items-center text-xs font-bold bg-white text-[#164E48] px-3 py-1 rounded-full border border-[#164E48]/15 shadow-2xs">
                  {key}: {String(val)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1 text-xs py-3 rounded-full border-[#164E48]/20 text-[#164E48]">
            {modalType === 'VERIFY_ADD' ? 'Undo / Dismiss' : 'Close'}
          </Button>
          <Button
            onClick={handleActionClick}
            className="flex-1 bg-[#164E48] hover:bg-[#113e39] text-white font-bold text-xs py-3 rounded-full flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>{modalType === 'MEMORIES_PREVIEW' ? 'Open Memory Album' : 'Confirm Action'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
