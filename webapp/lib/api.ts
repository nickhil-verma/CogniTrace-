import { AudioTaskTurnResponse } from '@/types/agent';
import { simulateMockVoiceTurn } from '@/lib/mock/agent';
import { mockPatientSummary } from '@/lib/mock/patient';
import { initialMockReminders } from '@/lib/mock/reminders';
import { initialMockAppointments } from '@/lib/mock/appointments';
import { initialMockMemories } from '@/lib/mock/memories';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // GET request wrapper
  async get<T>(endpoint: string, fallbackData?: T): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      // Backend offline or unreachable: return fallback data seamlessly
      if (fallbackData !== undefined) return fallbackData;
      throw err;
    }
  }

  // POST request wrapper
  async post<T>(endpoint: string, body: any, fallbackResponse?: T): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      if (fallbackResponse !== undefined) return fallbackResponse;
      throw err;
    }
  }

  // Submit audio file turn (POST /v1/patient/audio-task-turn)
  async submitAudioTaskTurn(audioBlob: Blob | null, textPrompt?: string): Promise<AudioTaskTurnResponse> {
    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append('file', audioBlob, 'voice_command.wav');
      }
      if (textPrompt) {
        formData.append('text', textPrompt);
      }

      const res = await fetch(`${this.baseUrl}/v1/patient/audio-task-turn`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[CogniTrace API] /v1/patient/audio-task-turn offline. Using intelligent simulation.`, err);
      const promptText = textPrompt || "Remind Mom to take her medicine at 8 tonight.";
      return await simulateMockVoiceTurn(promptText);
    }
  }

  // Get patient summary (GET /v1/caretaker/patient/{patient_id}/summary)
  async getPatientSummary(patientId: string = 'patient_001') {
    return this.get(`/v1/caretaker/patient/${patientId}/summary`, mockPatientSummary);
  }

  // Reminiscence Prompt (POST /v1/patient/reminiscence/prompt)
  async getReminiscencePrompt(memoryId: string, memoryDescription: string) {
    return this.post('/v1/patient/reminiscence/prompt', { memory_id: memoryId, description: memoryDescription }, {
      prompt: `Mom, do you remember this picture from ${memoryDescription}? You looked so happy that day.`
    });
  }

  // Telemetry Sync (POST /v1/patient/telemetry/sync)
  async syncTelemetry(eventData: any) {
    return this.post('/v1/patient/telemetry/sync', eventData, { status: 'synced', timestamp: new Date().toISOString() });
  }

  // Upload memory file URL (POST /v1/caretaker/memories/upload-url)
  async getMemoryUploadUrl(filename: string, fileType: string) {
    return this.post('/v1/caretaker/memories/upload-url', { filename, fileType }, {
      uploadUrl: 'https://mock-s3-upload.aws.com/presigned-url',
      fileKey: `memories/${Date.now()}_${filename}`
    });
  }
}

export const api = new ApiClient();
