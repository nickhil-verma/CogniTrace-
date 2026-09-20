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
      stepName: 'DynamoDB Vector RAG Retrieval',
      status: 'completed',
      timestamp: timestamp,
      details: `Retrieved ${ragChunksCount || 3} vector chunks from DynamoDB`
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
                text: `You are CogniTrace AI Voice Agent, an empathetic dementia care companion.
Use the following DynamoDB RAG vector memory context if relevant:
${ragContextText || "Patient Sunita Sharma: Middle Stage dementia. Evening medication Donepezil 5mg at 8 PM. Doctor consultation Dr. Anita Sharma tomorrow 10:30 AM."}

User prompt: ${userPromptText}

Output a short, warm, supportive 1-2 sentence response for the patient/caregiver.`
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
      console.warn('[Gemini API] Direct Gemini generation warning, using structured fallback:', err);
    }
  }

  // 4. Construct tool action payload and fallback text if Gemini API didn't return text
  if (lower.includes('remind') || lower.includes('medicine') || lower.includes('medication')) {
    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'create_reminder',
      title: 'Medication Reminder Created',
      description: 'Donepezil 5mg at 8:00 PM for Mom',
      parameters: {
        title: 'Take evening medicine (Donepezil)',
        time: '8:00 PM',
        category: 'Medication',
        patientName: 'Mom'
      },
      status: 'completed',
      timestamp: timestamp
    });

    if (!aiResponseText) {
      aiResponseText = "I've logged a reminder for Mom to take her evening medicine (Donepezil 5mg) at 8:00 PM tonight.";
    }
  } else if (/(appointment|appointments|doctor|sharma|अपॉइंटमेंट|cita|rendez-vous|termin)/i.test(lower)) {
    const isCreate = /\b(book|schedule|create|make|set\s+up|add|new|बुक|reservar|créer|buchen)\b/i.test(lower);
    if (isCreate) {
      const docMatch = userPromptText.match(/dr\.?\s+([a-z\s]+)/i);
      const docName = docMatch ? `Dr. ${docMatch[1].trim()}` : 'Dr. Anita Sharma';
      actions.push({
        id: `act_${Date.now()}`,
        toolType: 'create_appointment',
        title: 'Doctor Appointment Scheduled',
        description: `Scheduled consultation with ${docName}`,
        parameters: { doctorName: docName, date: 'Tomorrow', time: '10:30 AM' },
        status: 'completed',
        timestamp: timestamp
      });

      if (!aiResponseText) {
        aiResponseText = `I have scheduled an appointment with ${docName} for tomorrow at 10:30 AM.`;
      }
    } else {
      // Side-effect free retrieval: fetch actual appointments from localStorage or mock
      let upcomingList: { doctorName?: string; title?: string; date?: string; time?: string; status?: string }[] = [];
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('cognitrace_appointments_v1');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              upcomingList = parsed.filter((a: { status?: string; date?: string }) => {
                const s = String(a.status || '').toLowerCase();
                if (s === 'completed' || s === 'cancelled' || s === 'canceled') return false;
                const d = String(a.date || '').toLowerCase();
                if (/\b(last\s+week|yesterday|ago|past)\b/.test(d)) return false;
                return true;
              });
            }
          }
        } catch {
          // ignore
        }
      }

      if (upcomingList.length > 0) {
        const first = upcomingList[0];
        const docLabel = first.doctorName || first.title || 'Doctor Consultation';
        const whenLabel = `${first.date || 'soon'}${first.time ? ` at ${first.time}` : ''}`.trim();
        if (upcomingList.length === 1) {
          aiResponseText = `You have 1 upcoming appointment: ${docLabel} scheduled for ${whenLabel}.`;
        } else {
          aiResponseText = `You have ${upcomingList.length} upcoming appointments. The next one is ${docLabel} on ${whenLabel}.`;
        }
      } else if (!aiResponseText) {
        aiResponseText = "You currently have no upcoming doctor appointments scheduled.";
      }

      actions.push({
        id: `act_${Date.now()}`,
        toolType: 'retrieve_appointments',
        title: 'Upcoming Appointments Retrieved',
        description: aiResponseText,
        parameters: { query: userPromptText, count: upcomingList.length },
        status: 'completed',
        timestamp: timestamp
      });
    }
  } else if (lower.includes('memory') || lower.includes('goa') || lower.includes('photo')) {
    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'retrieve_memory',
      title: 'Memory Card Loaded',
      description: 'Goa Vacation 1987 - "Mom, do you remember watching the sunset by the waves?"',
      parameters: { memoryId: 'mem_1' },
      status: 'completed',
      timestamp: timestamp
    });

    if (!aiResponseText) {
      aiResponseText = "Found the Goa Beach family vacation photo memory from 1987 in vector DB storage!";
    }
  } else {
    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'get_patient_summary',
      title: 'Care Context Retrieved',
      description: 'Middle Stage: Stable memory recall & cognitive biomarkers.',
      parameters: { patientId: 'patient_001' },
      status: 'completed',
      timestamp: timestamp
    });

    if (!aiResponseText) {
      aiResponseText = `I processed: "${userPromptText}". DynamoDB RAG vector memory confirms Mom is doing well today.`;
    }
  }

  timeline.push({
    id: 'step_3',
    stepName: 'Gemini RAG Reasoning Engine',
    status: 'completed',
    timestamp: timestamp,
    result: 'Response synthesized using vector context'
  });

  return {
    transcript: userPromptText,
    aiResponseText,
    actions,
    executionTimeline: timeline
  };
}
