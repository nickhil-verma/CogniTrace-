'use client';

import React from 'react';
import { AgentActionItem } from '@/types/agent';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, CheckCircle, Image, FileText, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface AgentActionProps {
  action: AgentActionItem;
  onConfirm?: () => void;
  onEdit?: () => void;
}

export function AgentAction({ action }: AgentActionProps) {
  const { t } = useLanguage();

  const getToolIcon = () => {
    switch (action.toolType) {
      case 'create_reminder':
        return <Bell className="w-5 h-5 text-[#17665B]" />;
      case 'create_appointment':
        return <Calendar className="w-5 h-5 text-[#3E9C87]" />;
      case 'retrieve_appointments':
        return <Calendar className="w-5 h-5 text-[#17665B]" />;
      case 'escalate_to_caretaker':
      case 'send_caretaker_alert':
        return <AlertCircle className="w-5 h-5 text-[#C85C82]" />;
      case 'mark_task_completed':
        return <CheckCircle className="w-5 h-5 text-[#3E9C87]" />;
      case 'retrieve_memory':
        return <Image className="w-5 h-5 text-[#C85C82]" />;
      case 'get_patient_summary':
      default:
        return <FileText className="w-5 h-5 text-[#17665B]" />;
    }
  };

  return (
    <div className="rounded-2xl border border-[#DDE7E3] bg-[#F5F8F6] p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-full bg-white shadow-xs">
            {getToolIcon()}
          </div>
          <div>
            <h5 className="text-sm font-bold text-[#123B35]">{action.title}</h5>
            <p className="text-xs text-[#66736F]">{action.description}</p>
          </div>
        </div>
        <Badge variant={action.status === 'completed' ? 'accent' : 'warning'}>
          {action.status === 'completed' ? t('commandCenter.completedBadge') : t('commandCenter.executingBadge')}
        </Badge>
      </div>

      {action.parameters && Object.keys(action.parameters).length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-[#DDE7E3]">
          {Object.entries(action.parameters).map(([key, val]) => (
            <div key={key} className="flex flex-col">
              <span className="text-[#66736F] capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
              <span className="font-semibold text-[#123B35] truncate">{String(val)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
