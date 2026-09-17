import { AudioTaskTurnResponse, AgentActionItem, TimelineStep } from '@/types/agent';

export async function simulateMockVoiceTurn(userPromptText: string): Promise<AudioTaskTurnResponse> {
  const lower = userPromptText.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Default step sequence
  const timeline: TimelineStep[] = [
    {
      id: 'step_1',
      stepName: 'Understanding voice request',
      status: 'completed',
      timestamp: timestamp,
      details: `Parsed transcript: "${userPromptText}"`
    },
    {
      id: 'step_2',
      stepName: 'Analyzing patient care context',
      status: 'completed',
      timestamp: timestamp,
      details: 'Evaluated current care stage: Middle Stage'
    }
  ];

  const actions: AgentActionItem[] = [];
  let aiResponseText = '';

  if (lower.includes('remind') || lower.includes('medicine') || lower.includes('medication')) {
    timeline.push({
      id: 'step_3',
      stepName: 'Creating medication reminder',
      status: 'completed',
      timestamp: timestamp,
      details: 'Extracted target: Mom | Time: 8:00 PM | Type: Medication'
    });
    timeline.push({
      id: 'step_4',
      stepName: 'Saved to Caretaker Schedule',
      status: 'completed',
      timestamp: timestamp,
      result: 'Reminder stored successfully'
    });

    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'create_reminder',
      title: 'Medication Reminder Created',
      description: 'Donepezil 10mg at 8:00 PM for Mom',
      parameters: {
        title: 'Take evening medicine (Donepezil)',
        time: '8:00 PM',
        category: 'Medication',
        patientName: 'Mom'
      },
      status: 'completed',
      timestamp: timestamp
    });

    aiResponseText = "I've created a reminder for Mom to take her medicine at 8:00 PM tonight. I'll make sure it pops up on the caretaker schedule.";
  } else if (lower.includes('doing') || lower.includes('status') || lower.includes('how') || lower.includes('change')) {
    timeline.push({
      id: 'step_3',
      stepName: 'Retrieving care summary',
      status: 'completed',
      timestamp: timestamp,
      details: 'Analyzed 4 observed indicators across Memory, Communication, and Independence'
    });
    timeline.push({
      id: 'step_4',
      stepName: 'Compiled trend insights',
      status: 'completed',
      timestamp: timestamp,
      result: 'Summary synthesized'
    });

    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'get_patient_summary',
      title: 'Care Summary Retrieved',
      description: 'Middle Stage: Stable memory recall, needs slight support for evening medications.',
      parameters: { patientId: 'patient_001' },
      status: 'completed',
      timestamp: timestamp
    });

    aiResponseText = "Mom has been doing well today. Her memory recall and communication remain stable, though she needed a light reminder for her afternoon walk.";
  } else if (lower.includes('appointment') || lower.includes('doctor') || lower.includes('sharma')) {
    timeline.push({
      id: 'step_3',
      stepName: 'Scheduling medical appointment',
      status: 'completed',
      timestamp: timestamp,
      details: 'Target: Dr. Anita Sharma | Date: Tomorrow 10:30 AM'
    });
    timeline.push({
      id: 'step_4',
      stepName: 'Calendar updated',
      status: 'completed',
      timestamp: timestamp,
      result: 'Appointment scheduled'
    });

    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'create_appointment',
      title: 'Doctor Appointment Confirmed',
      description: 'Dr. Anita Sharma - Cognitive Evaluation tomorrow at 10:30 AM at City Care Hospital.',
      parameters: { doctorName: 'Dr. Anita Sharma', date: 'Tomorrow', time: '10:30 AM' },
      status: 'completed',
      timestamp: timestamp
    });

    aiResponseText = "I've confirmed the appointment with Dr. Anita Sharma for tomorrow at 10:30 AM at City Care Hospital. Directions and notes are saved.";
  } else if (lower.includes('memory') || lower.includes('goa') || lower.includes('photo')) {
    timeline.push({
      id: 'step_3',
      stepName: 'Searching family memory vault',
      status: 'completed',
      timestamp: timestamp,
      details: 'Found matching album: Family Vacation Goa (1987)'
    });
    timeline.push({
      id: 'step_4',
      stepName: 'Generated reminiscence prompt',
      status: 'completed',
      timestamp: timestamp,
      result: 'Memory card loaded'
    });

    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'retrieve_memory',
      title: 'Memory Card Loaded',
      description: 'Goa Vacation 1987 - "Mom, do you remember watching the sunset by the waves?"',
      parameters: { memoryId: 'mem_1' },
      status: 'completed',
      timestamp: timestamp
    });

    aiResponseText = "Here is the memory from Goa in 1987. You can tap 'Talk about it' to start a calm voice session with Mom about this picture.";
  } else {
    timeline.push({
      id: 'step_3',
      stepName: 'Processing query with Claude reasoning engine',
      status: 'completed',
      timestamp: timestamp,
      details: 'Synthesizing supportive care advisory'
    });
    timeline.push({
      id: 'step_4',
      stepName: 'Formulated response',
      status: 'completed',
      timestamp: timestamp,
      result: 'Ready'
    });

    aiResponseText = `I heard: "${userPromptText}". I am here to help you manage Mom's care schedule, track observations, or open photo memories. What would you like to do next?`;
  }

  return {
    transcript: userPromptText,
    aiResponseText,
    actions,
    executionTimeline: timeline
  };
}
