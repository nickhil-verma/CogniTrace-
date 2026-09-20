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
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash',
      'gemini-pro'
    ];

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

    for (const modelName of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
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
            break;
          }
        } else {
          const errBody = await res.json().catch(() => ({}));
          console.warn(`[Gemini API] Model '${modelName}' returned HTTP ${res.status}:`, errBody?.error?.message || res.statusText);
        }
      } catch (err) {
        console.warn(`[Gemini API] Request error for model '${modelName}':`, err);
      }
    }
  }

  // 4. Construct tool action payload and fallback text if API didn't return text
  if (lower.includes('complete') || lower.includes('done') || lower.includes('finish') || lower.includes('took')) {
    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'complete_reminder',
      title: 'Task Marked Completed',
      description: 'Marked evening medication as done',
      parameters: { reminderTitle: 'Evening Medication (Donepezil 5mg)', completed: true, time: '8:00 PM' },
      status: 'completed',
      timestamp: timestamp,
      ...({ modalType: 'VERIFY_COMPLETE', openModal: true } as any)
    });

    if (!aiResponseText) {
      aiResponseText = "Great job! I have marked your task as completed. By the way, Sunita, do you remember what cardamom sweets you prepared for Diwali in 2019?";
    }
  } else if (lower.includes('remind') || lower.includes('medicine') || lower.includes('medication')) {
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
      timestamp: timestamp,
      ...({ modalType: 'VERIFY_ADD', openModal: true } as any)
    });

    if (!aiResponseText) {
      aiResponseText = "I have updated your task to take your evening medicine (Donepezil 5mg) at 8:00 PM tonight. Do you remember what color roses bloomed in your home garden in March 2015?";
    }
  } else if (/(appointment|appointments|doctor|consultation|clinic|hospital|sharma|अपॉइंटमेंट|cita|rendez-vous|termin)/i.test(lower)) {
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
        timestamp: timestamp,
        ...({ modalType: 'VERIFY_ACTION', openModal: true, targetRoute: '/appointments' } as any)
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
        timestamp: timestamp,
        ...({ modalType: 'VERIFY_ACTION', openModal: true, targetRoute: '/appointments' } as any)
      });
    }
  } else if (lower.includes('memory') || lower.includes('goa') || lower.includes('photo') || lower.includes('picture')) {
    actions.push({
      id: `act_${Date.now()}`,
      toolType: 'retrieve_memory',
      title: 'Family Memory Album',
      description: 'Goa Vacation 1987 - "Watching the sunset by the waves with family."',
      parameters: { memoryId: 'mem_1', memory: 'Goa Family Vacation 1987' },
      status: 'completed',
      timestamp: timestamp,
      ...({ modalType: 'MEMORIES_PREVIEW', openModal: true, targetRoute: '/memories' } as any)
    });

    if (!aiResponseText) {
      aiResponseText = "Found your Goa family vacation memory from 1987! Sunita, do you remember which beach that photo was taken from in Goa?";
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
