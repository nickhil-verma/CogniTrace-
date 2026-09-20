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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        // If clicking backdrop or card for memories preview, navigate
        if (modalType === 'MEMORIES_PREVIEW') {
          handleActionClick();
        }
      }}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-[#DDE7E3] max-w-md w-full p-6 space-y-5 relative overflow-hidden ${
          modalType === 'MEMORIES_PREVIEW' ? 'cursor-pointer hover:ring-2 hover:ring-[#17665B]/50 transition-all' : ''
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
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            )}
            {modalType === 'MEMORIES_PREVIEW' && (
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#17665B] flex items-center justify-center shadow-sm">
                <ImageIcon className="w-7 h-7" />
              </div>
            )}
            {modalType === 'VERIFY_ADD' && (
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-sm">
                <Bell className="w-7 h-7" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-[#123B35]">
                {modalType === 'VERIFY_COMPLETE' ? 'Task Verified Completed' : (modalType === 'MEMORIES_PREVIEW' ? 'Family Memory Album' : 'New Reminder Scheduled')}
              </h3>
              <p className="text-xs font-semibold text-[#66736F]">Voice AI Verification Modal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
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
          className={`space-y-3 bg-[#F5F8F6] p-4 rounded-2xl border border-[#DDE7E3] transition-all ${
            modalType === 'MEMORIES_PREVIEW' ? 'cursor-pointer hover:border-[#17665B] hover:shadow-md group' : ''
          }`}
        >
          <h4 className="text-base font-bold text-[#123B35] flex items-center space-x-2">
            <span>{actionItem.title}</span>
          </h4>
          <p className="text-xs text-[#66736F] leading-relaxed">
            {actionItem.description}
          </p>

          {/* Memory Card Preview */}
          {modalType === 'MEMORIES_PREVIEW' && (
            <div className="pt-2">
              <div className="relative rounded-xl overflow-hidden shadow-sm border border-[#DDE7E3]">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                  alt="Family Memory"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                  <p className="text-xs font-bold flex items-center justify-between">
                    <span>Goa Beach Family Vacation (1987)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  </p>
                  <p className="text-[10px] text-white/80">Mom, Dad, and Priya watching sunset ocean waves</p>
                </div>
              </div>
              <p className="text-[11px] font-bold text-[#17665B] mt-2 text-center group-hover:underline flex items-center justify-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Tap anywhere on card to open full memories album
              </p>
            </div>
          )}

          {/* Parameters List */}
          {actionItem.parameters && Object.keys(actionItem.parameters).length > 0 && modalType !== 'MEMORIES_PREVIEW' && (
            <div className="pt-1 flex flex-wrap gap-2">
              {Object.entries(actionItem.parameters).map(([key, val]) => (
                <span key={key} className="inline-flex items-center text-[11px] font-semibold bg-white text-[#17665B] px-2.5 py-1 rounded-lg border border-[#DDE7E3]">
                  {key}: {String(val)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 text-xs py-2.5 rounded-xl">
            {modalType === 'VERIFY_ADD' ? 'Undo / Dismiss' : 'Close'}
          </Button>
          <Button
            onClick={handleActionClick}
            className="flex-1 bg-[#17665B] hover:bg-[#123B35] text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-md"
          >
            <span>{modalType === 'MEMORIES_PREVIEW' ? 'Open Memory Album' : 'Confirm'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
