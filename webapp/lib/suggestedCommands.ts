export interface SuggestedVoiceCommand {
  id: string;
  text: string;
  category: 'identity' | 'routine' | 'reminiscence' | 'status' | 'compliance' | 'appointment';
  role: 'patient' | 'caregiver';
}

export const PATIENT_SUGGESTED_COMMANDS: string[] = [
  "Who am I? Tell me about my life",
  "What should I do next?",
  "Show me my family photos & Goa trip",
  "I finished my morning tea and vitamins",
  "Tell me about my daughter Priya",
  "How did I do today?"
];

export const CAREGIVER_SUGGESTED_COMMANDS: string[] = [
  "How is Mom (Sunita) doing today?",
  "Did Sunita take her morning medication?",
  "Schedule a doctor appointment for next Tuesday",
  "Add an 8 PM water reminder for Sunita",
  "Show me Mom's task compliance stats",
  "Remind me to call Dr. Anita"
];

export function getRoleSuggestedCommands(role: 'patient' | 'caregiver' = 'caregiver'): string[] {
  return role === 'patient' ? PATIENT_SUGGESTED_COMMANDS : CAREGIVER_SUGGESTED_COMMANDS;
}
