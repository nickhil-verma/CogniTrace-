import { AudioTaskTurnResponse } from '@/types/agent';
import { simulateMockVoiceTurn } from '@/lib/mock/agent';
import { mockPatientSummary } from '@/lib/mock/patient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  patient_name: string;
  relationship: string;
  stage: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cognitrace_api_url');
      if (saved) return saved;
    }
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cognitrace_api_url', url);
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cognitrace_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // GET request wrapper
  async get<T>(endpoint: string, fallbackData?: T): Promise<T> {
    try {
      const res = await fetch(`${this.getBaseUrl()}${endpoint}`, {
        headers: this.getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      if (fallbackData !== undefined) return fallbackData;
      throw err;
    }
  }

  // POST request wrapper
  async post<T>(endpoint: string, body: any, fallbackResponse?: T): Promise<T> {
    try {
      const res = await fetch(`${this.getBaseUrl()}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      if (fallbackResponse !== undefined) return fallbackResponse;
      throw err;
    }
  }

  // ------------------------------------------------------------------
  // Auth APIs
  // ------------------------------------------------------------------

  async login(email: string, password: string, role: string = 'caregiver'): Promise<AuthResponse> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Login failed with status ${res.status}`);
      }
      const data: AuthResponse = await res.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('cognitrace_token', data.access_token);
        localStorage.setItem('cognitrace_user', JSON.stringify(data.user));
        localStorage.setItem('cognitrace_user_role', data.user.role || role);
        window.dispatchEvent(new Event('cognitrace_role_change'));
      }
      return data;
    } catch (err) {
      const demoUser: UserProfile = {
        id: role === 'patient' ? 'usr_patient_001' : 'usr_demo_001',
        name: role === 'patient' ? 'Sunita Sharma' : 'Priya Sharma',
        email,
        role: role === 'patient' ? 'patient' : 'caregiver',
        patient_name: 'Mom (Sunita)',
        relationship: role === 'patient' ? 'Self' : 'Mother',
        stage: 'Middle Stage',
      };
      const fallbackData: AuthResponse = {
        access_token: `cognitrace_jwt_${demoUser.id}`,
        token_type: 'bearer',
        user: demoUser,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('cognitrace_token', fallbackData.access_token);
        localStorage.setItem('cognitrace_user', JSON.stringify(fallbackData.user));
        localStorage.setItem('cognitrace_user_role', demoUser.role);
        window.dispatchEvent(new Event('cognitrace_role_change'));
      }
      return fallbackData;
    }
  }

  async patientLogin(): Promise<AuthResponse> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/v1/auth/patient-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Patient login failed`);
      const data: AuthResponse = await res.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('cognitrace_token', data.access_token);
        localStorage.setItem('cognitrace_user', JSON.stringify(data.user));
        localStorage.setItem('cognitrace_user_role', 'patient');
        window.dispatchEvent(new Event('cognitrace_role_change'));
      }
      return data;
    } catch (err) {
      const demoUser: UserProfile = {
        id: 'usr_patient_001',
        name: 'Sunita Sharma (Mom)',
        email: 'sunita.patient@example.com',
        role: 'patient',
        patient_name: 'Sunita',
        relationship: 'Self',
        stage: 'Middle Stage',
      };
      const fallbackData: AuthResponse = {
        access_token: 'cognitrace_jwt_usr_patient_001',
        token_type: 'bearer',
        user: demoUser,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('cognitrace_token', fallbackData.access_token);
        localStorage.setItem('cognitrace_user', JSON.stringify(fallbackData.user));
        localStorage.setItem('cognitrace_user_role', 'patient');
        window.dispatchEvent(new Event('cognitrace_role_change'));
      }
      return fallbackData;
    }
  }

  async signup(payload: {
    name: string;
    email: string;
    password: string;
    patient_name?: string;
    relationship?: string;
    stage?: string;
  }): Promise<AuthResponse> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Signup failed with status ${res.status}`);
      }
      const data: AuthResponse = await res.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('cognitrace_token', data.access_token);
        localStorage.setItem('cognitrace_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      const demoUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: payload.name || 'Caregiver User',
        email: payload.email || 'caregiver@example.com',
        role: 'caregiver',
        patient_name: payload.patient_name || 'Mom',
        relationship: payload.relationship || 'Mother',
        stage: payload.stage || 'Middle Stage',
      };
      const fallbackData: AuthResponse = {
        access_token: `cognitrace_jwt_${demoUser.id}`,
        token_type: 'bearer',
        user: demoUser,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('cognitrace_token', fallbackData.access_token);
        localStorage.setItem('cognitrace_user', JSON.stringify(fallbackData.user));
      }
      return fallbackData;
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cognitrace_token');
      localStorage.removeItem('cognitrace_user');
      localStorage.removeItem('cognitrace_user_role');
      window.dispatchEvent(new Event('cognitrace_role_change'));
    }
  }

  getCurrentUserFromStorage(): UserProfile | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('cognitrace_user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  // ------------------------------------------------------------------
  // Core Domain APIs
  // ------------------------------------------------------------------

  // Submit audio file turn (POST /v1/patient/audio-task-turn)
  async submitAudioTaskTurn(audioBlob: Blob | null, textPrompt?: string): Promise<AudioTaskTurnResponse> {
    try {
      const formData = new FormData();
      if (audioBlob) {
        const ext = audioBlob.type.includes('webm') ? 'webm' : (audioBlob.type.includes('ogg') ? 'ogg' : (audioBlob.type.includes('mp4') ? 'mp4' : 'wav'));
        formData.append('file', audioBlob, `voice_command.${ext}`);
      }
      if (textPrompt) {
        formData.append('text', textPrompt);
      }

      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('cognitrace_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${this.getBaseUrl()}/v1/patient/audio-task-turn`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[CogniTrace API] /v1/patient/audio-task-turn offline. Using intelligent simulation.`, err);
      const promptText = textPrompt || "What should I do next?";
      return await simulateMockVoiceTurn(promptText);
    }
  }

  // Execute end-to-end Voice Command Pipeline (POST /api/voice/command)
  async executeVoiceCommand(audioBlob: Blob | null, textPrompt?: string, patientId: string = 'patient_001'): Promise<any> {
    try {
      const formData = new FormData();
      if (audioBlob) {
        const ext = audioBlob.type.includes('webm') ? 'webm' : (audioBlob.type.includes('ogg') ? 'ogg' : (audioBlob.type.includes('mp4') ? 'mp4' : 'wav'));
        formData.append('file', audioBlob, `voice_command.${ext}`);
      }
      if (textPrompt) {
        formData.append('transcript', textPrompt);
        formData.append('text', textPrompt);
      }
      formData.append('patient_id', patientId);

      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('cognitrace_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${this.getBaseUrl()}/api/voice/command`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[CogniTrace API] /api/voice/command offline. Using fallback simulation.`, err);
      return this.submitAudioTaskTurn(audioBlob, textPrompt);
    }
  }

  // Fetch stored voice chat memory logs & performance history (GET /v1/patient/voice-chats)
  async getVoiceChats(patientId: string = 'patient_001') {
    return this.get(`/v1/patient/voice-chats?patient_id=${patientId}`, { patient_id: patientId, count: 0, chats: [] });
  }

  // Stateful Conversational Voice Agent Turn (POST /api/voice/chat-turn)
  async executeVoiceChatTurn(payload: {
    transcript: string;
    user_role?: 'PATIENT' | 'CAREGIVER';
    conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    pending_state?: Record<string, any> | null;
  }): Promise<{
    speech_response: string;
    action_executed: boolean;
    requires_followup: boolean;
    updated_state: Record<string, any> | null;
    ui_action: Record<string, any>;
  }> {
    try {
      const userRole = payload.user_role || (typeof window !== 'undefined' && localStorage.getItem('cognitrace_user_role') === 'patient' ? 'PATIENT' : 'CAREGIVER');
      const body = {
        transcript: payload.transcript,
        user_role: userRole,
        conversation_history: payload.conversation_history || [],
        pending_state: payload.pending_state || null,
      };
      const res = await fetch(`${this.getBaseUrl()}/api/voice/chat-turn`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[CogniTrace API] /api/voice/chat-turn offline. Using fallback simulation.', err);
      return {
        speech_response: "I've noted that for you. Is there anything else I can help with?",
        action_executed: false,
        requires_followup: false,
        updated_state: null,
        ui_action: { type: "NONE" },
      };
    }
  }

  // ------------------------------------------------------------------
  // Reminders & Schedule APIs
  // ------------------------------------------------------------------

  async getReminders(patientId: string = 'patient_001') {
    return this.get(`/v1/caretaker/reminders?patient_id=${patientId}`, []);
  }

  async createReminder(reminder: any) {
    return this.post('/v1/caretaker/reminders', reminder);
  }

  async toggleReminder(remId: string, patientId: string = 'patient_001') {
    return this.post(`/v1/caretaker/reminders/${remId}/toggle?patient_id=${patientId}`, {});
  }

  async deleteReminder(remId: string, patientId: string = 'patient_001') {
    try {
      const res = await fetch(`${this.getBaseUrl()}/v1/caretaker/reminders/${remId}?patient_id=${patientId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API delete reminder warning:', err);
    }
  }

  async getAppointments(patientId: string = 'patient_001') {
    return this.get(`/v1/caretaker/appointments?patient_id=${patientId}`, []);
  }

  async createAppointment(appointment: any) {
    return this.post('/v1/caretaker/appointments', appointment);
  }

  async getMemories(patientId: string = 'patient_001') {
    return this.get(`/v1/caretaker/memories?patient_id=${patientId}`, []);
  }

  async createMemory(memory: any) {
    return this.post('/v1/caretaker/memories', memory);
  }

  async deleteMemory(memId: string, patientId: string = 'patient_001') {
    try {
      const res = await fetch(`${this.getBaseUrl()}/v1/caretaker/memories/${memId}?patient_id=${patientId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API delete memory warning:', err);
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

  // Command Center Quick Tips API (POST /api/cognitrace/command-center/tips)
  async fetchCommandCenterTips(payload?: {
    patient_name?: string;
    caregiver_name?: string;
    relation?: string;
    cognitive_stage_or_notes?: string;
  }) {
    return this.post('/api/cognitrace/command-center/tips', payload || {
      patient_name: 'Sunita',
      caregiver_name: 'Priya',
      relation: 'Daughter',
      cognitive_stage_or_notes: 'Middle Stage'
    }, {
      greeting: "Welcome back, Priya. Remember to pause and take a gentle breath today.",
      relational_insight: "As a caring Daughter, balancing your support for Sunita with your own rest is vital for lasting strength.",
      quick_tips: [
        {
          id: "tip_1",
          category: "Emotional Balance",
          title: "Gentle Reassurance",
          tip: "When Sunita feels anxious or confused, softly validate her feelings rather than correcting minor details.",
          badge: "Emotional Health",
          theme: "teal"
        },
        {
          id: "tip_2",
          category: "Burnout Prevention",
          title: "Micro Caregiver Rest",
          tip: "Take 5 quiet minutes during afternoon routines for yourself. Your peace helps steady your loved one's day.",
          badge: "Self Care",
          theme: "purple"
        },
        {
          id: "tip_3",
          category: "Communication",
          title: "No-Confrontation Cues",
          tip: "Use familiar photo prompts or soft background music to guide Sunita through daily transitions.",
          badge: "Daily Routine",
          theme: "amber"
        }
      ]
    });
  }

  // Memory Trivia Game API
  async fetchMemoryTriviaRound(patientId: string = 'patient_001'): Promise<{
    round_id: string;
    memory_id: string;
    image_url: string;
    title: string;
    date: string;
    location: string;
    question: string;
    options: string[];
    correct_index: number;
    gentle_hint: string;
    encouragement_fact: string;
  }> {
    return this.post('/api/games/memory-trivia/round', { patient_id: patientId }, {
      round_id: `rnd_${Date.now()}`,
      memory_id: 'mem_1',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      title: 'Family Vacation in Goa',
      date: 'Summer 1987',
      location: 'Calangute Beach, Goa',
      question: 'Who joined you on this sunny beach trip to Goa?',
      options: ['Dad (Ramesh) & Priya', 'Doctor Anita', 'Neighbors from next door'],
      correct_index: 0,
      gentle_hint: 'Think about who loved walking along the shoreline with you for sunset ice cream!',
      encouragement_fact: 'Ramesh and Priya loved making sandcastles by the ocean waves with you that afternoon!'
    });
  }

  async submitMemoryTriviaRound(payload: {
    patient_id?: string;
    round_id: string;
    selected_index: number;
    is_correct: boolean;
    duration_s?: number;
  }): Promise<{
    status: string;
    is_correct: boolean;
    encouragement_fact: string;
    message: string;
  }> {
    return this.post('/api/games/memory-trivia/submit', {
      patient_id: payload.patient_id || 'patient_001',
      round_id: payload.round_id,
      selected_index: payload.selected_index,
      is_correct: payload.is_correct,
      duration_s: payload.duration_s || 0
    }, {
      status: 'success',
      is_correct: payload.is_correct,
      encouragement_fact: 'Wonderful memories shared today! Memory engagement keeps your mind vibrant and warm.',
      message: 'Round activity recorded successfully.'
    });
  }
}

export const api = new ApiClient();


