'use client';

import { useCallback } from 'react';

export interface ToastPayload {
  message: string;
  type?: 'success' | 'info' | 'error';
  targetRoute?: string;
  duration?: number;
}

export function showToast(message: string, type: 'success' | 'info' | 'error' = 'success', targetRoute?: string, duration: number = 3000) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent<ToastPayload>('cognitrace_toast', {
      detail: { message, type, targetRoute, duration }
    });
    window.dispatchEvent(event);
  }
}

export function useToast() {
  const notify = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success', targetRoute?: string, duration: number = 3000) => {
    showToast(message, type, targetRoute, duration);
  }, []);

  return { notify, showToast };
}
