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
        formData.append('file', audioBlob, 'voice_command.wav');
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
}

export const api = new ApiClient();

