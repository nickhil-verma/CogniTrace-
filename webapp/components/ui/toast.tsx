'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastPayload } from '@/hooks/useToast';

export function ToastContainer() {
  const [toasts, setToasts] = useState<(ToastPayload & { id: string })[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvt = e as CustomEvent<ToastPayload>;
      if (!customEvt.detail || !customEvt.detail.message) return;

      const toastId = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newToast = { ...customEvt.detail, id: toastId };

      setToasts((prev) => [...prev, newToast]);

      // If targetRoute is attached to toast payload, perform navigation
      if (customEvt.detail.targetRoute) {
        router.push(customEvt.detail.targetRoute);
      }

      // Auto dismiss after duration
      const duration = customEvt.detail.duration || 3500;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, duration);
    };

    window.addEventListener('cognitrace_toast', handleToastEvent);
    return () => {
      window.removeEventListener('cognitrace_toast', handleToastEvent);
    };
  }, [router]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-xl border backdrop-blur-md cursor-pointer ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700'
                : toast.type === 'info'
                ? 'bg-sky-900/90 text-white border-sky-700'
                : 'bg-[#164E48]/95 text-white border-white/20'
            }`}
            onClick={() => {
              if (toast.targetRoute) {
                router.push(toast.targetRoute);
              }
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-white/20 shrink-0">
                {toast.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-200" />
                ) : toast.type === 'info' ? (
                  <Info className="w-5 h-5 text-sky-200" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                )}
              </div>
              <div>
                <p className="text-sm font-extrabold capitalize leading-tight">
                  {toast.message}
                </p>
                {toast.targetRoute && (
                  <p className="text-[11px] text-white/80 font-medium mt-0.5">
                    Opening {toast.targetRoute}...
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
