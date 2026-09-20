export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'EXECUTING' | 'SPEAKING' | 'ERROR';

export type AgentToolType = 
  | 'create_reminder'
  | 'complete_reminder'
  | 'toggle_reminder'
  | 'create_appointment'
  | 'retrieve_appointments'
  | 'create_memory'
  | 'retrieve_memory'
  | 'escalate_to_caretaker'
  | 'mark_task_completed'
  | 'get_patient_summary'
  | 'send_caretaker_alert';

export interface TimelineStep {
  id: string;
  stepName: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp: string;
  details?: string;
  result?: string;
}

export interface AgentActionItem {
  id: string;
  toolType: AgentToolType;
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, any>;
  status: 'executing' | 'completed' | 'failed';
  timestamp: string;
}

export interface AudioTaskTurnResponse {
  transcript: string;
  aiResponseText: string;
  audioUrl?: string;
  actions: AgentActionItem[];
  executionTimeline: TimelineStep[];
  detectedIntent?: string;
  language?: string;
}
