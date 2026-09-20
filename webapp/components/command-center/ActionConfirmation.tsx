'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Edit3 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface ActionConfirmationProps {
  responseText: string;
  onDone?: () => void;
  onEdit?: () => void;
}

export function ActionConfirmation({ responseText, onDone, onEdit }: ActionConfirmationProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl bg-white border border-[#DDE7E3] p-4 shadow-sm space-y-3">
      <p className="text-sm font-semibold text-[#123B35] leading-relaxed">
        &ldquo;{responseText}&rdquo;
      </p>

      <div className="flex items-center space-x-3 pt-1">
        <Button variant="outline" size="sm" onClick={onEdit} className="text-xs">
          <Edit3 className="w-3.5 h-3.5 mr-1 text-[#66736F]" />
          {t('commandCenter.editReminder')}
        </Button>
        <Button variant="mint" size="sm" onClick={onDone} className="text-xs">
          <Check className="w-3.5 h-3.5 mr-1 text-[#123B35]" />
          {t('commandCenter.done')}
        </Button>
      </div>
    </div>
  );
}
