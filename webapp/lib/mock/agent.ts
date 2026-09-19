import { AudioTaskTurnResponse, AgentActionItem, TimelineStep } from '@/types/agent';

export async function simulateMockVoiceTurn(userPromptText: string): Promise<AudioTaskTurnResponse> {
  const lower = userPromptText.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  let ragContextText = '';
  let ragChunksCount = 0;

  // 1. Retrieve RAG Vector Context from Backend DynamoDB RAG Search
  try {
    const ragRes = await fetch(`${baseUrl}/v1/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userPromptText, patient_id: 'patient_001' })
    });
    if (ragRes.ok) {
      const ragData = await ragRes.json();
      ragContextText = ragData.context || '';
      ragChunksCount = ragData.matched_chunks_count || 0;
    }
  } catch (e) {
    console.warn('[RAG Vector Store] Backend RAG search endpoint unavailable, using memory fallback context.', e);
  }

  // 2. Default step sequence
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
      stepName: 'Care Memory Retrieval',
      status: 'completed',
      timestamp: timestamp,
      details: `Retrieved ${ragChunksCount || 3} care memory items`
    }
  ];

  const actions: AgentActionItem[] = [];
  let aiResponseText = '';

  // 3. Synthesize response with Gemini API if key is present
  if (apiKey && apiKey !== 'AQ.Ab8RN6LqjBmwVMdowBJZ6_kVfXs29firXQKFCsCuLMzeGiHJFQ_invalid') {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const promptPayload = {
        contents: [
          {
            parts: [
              {
                text: `You are CogniTrace AI Voice Companion, an empathetic assistant for Sunita.
Use the following care memory context if relevant:
${ragContextText || "Sunita Sharma: Evening medication Donepezil 5mg at 8 PM. Doctor consultation Dr. Anita Sharma tomorrow 10:30 AM."}

User prompt: ${userPromptText}

Output a short, warm, supportive 1-2 sentence response directly to Sunita in first/second person.`
              }
            ]
          }
        ]
      };

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptPayload)
      });

      if (res.ok) {
        const data = await res.json();
        const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          aiResponseText = geminiText.trim();
        }
      }
    } catch (err) {
      console.warn('[AI API] Direct generation warning, using structured fallback:', err);
    }
  }

  // 4. Construct tool action payload and fallback text if API didn't return text
  if (lower.includes('remind') || lower.includes('medicine') || lower.includes('medication')) {
    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'create_reminder',
      title: 'Medication Task Updated',
      description: 'Donepezil 5mg at 8:00 PM',
      parameters: {
        title: 'Take evening medicine (Donepezil)',
        time: '8:00 PM',
        category: 'Medication',
        patientName: 'Sunita'
      },
      status: 'completed',
      timestamp: timestamp
    });

    if (!aiResponseText) {
      aiResponseText = "I have updated your task to take your evening medicine (Donepezil 5mg) at 8:00 PM tonight.";
    }
  } else if (lower.includes('appointment') || lower.includes('doctor') || lower.includes('sharma')) {
    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'create_appointment',
      title: 'Doctor Appointment Confirmed',
      description: 'Dr. Anita Sharma - Consultation tomorrow at 10:30 AM.',
      parameters: { doctorName: 'Dr. Anita Sharma', date: 'Tomorrow', time: '10:30 AM' },
      status: 'completed',
      timestamp: timestamp
    });

    if (!aiResponseText) {
      aiResponseText = "I've checked your schedule. Dr. Anita Sharma's consultation is confirmed for tomorrow at 10:30 AM.";
    }
  } else if (lower.includes('memory') || lower.includes('goa') || lower.includes('photo')) {
    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'retrieve_memory',
      title: 'Memory Card Loaded',
      description: 'Goa Vacation 1987 - "Watching the sunset by the waves with family."',
      parameters: { memoryId: 'mem_1' },
      status: 'completed',
      timestamp: timestamp
    });

    if (!aiResponseText) {
      aiResponseText = "Loaded your cherished Goa Beach family vacation photo memory from 1987!";
    }
  } else {
    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'get_patient_summary',
      title: 'Care Context Retrieved',
      description: 'Daily schedule and memory status updated.',
      parameters: { patientId: 'patient_001' },
      status: 'completed',
      timestamp: timestamp
    });

    if (!aiResponseText) {
      aiResponseText = `I processed: "${userPromptText}". Your daily care schedule and goals are up to date!`;
    }
  }

  timeline.push({
    id: 'step_3',
    stepName: 'AI Reasoning Engine',
    status: 'completed',
    timestamp: timestamp,
    result: 'Response synthesized using care context'
  });

  return {
    transcript: userPromptText,
    aiResponseText,
    actions,
    executionTimeline: timeline
  };
}
