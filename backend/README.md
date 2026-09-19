# CogniTrace Dementia Detection Engine Backend API

Production-grade FastAPI, LangGraph Grok Agent, PyTorch/Faster-Whisper, Librosa, AWS DynamoDB, Postgres, and Redis backend pipeline for multimodal cognitive impairment and dementia risk detection.

---

## 🚀 Quick Start & How to Run Backend

### 1. Environment Setup
Make sure Python 3.10+ is installed and dependencies are configured:

```bash
cd backend
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Environment Variables (`.env`)
Create or edit `.env` in the `backend/` directory:

```env
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=*
WHISPER_MODEL_SIZE=tiny
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8

# AWS Credentials & DynamoDB
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_TABLE_NAME=CogniTrace

# AI Engine API Keys
GROK_API_KEY=your_grok_key
GEMINI_API_KEY=your_gemini_key
```

### 3. Launch Development Server
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 📡 Complete API Endpoint Reference

### 1. Authentication Router (`/v1/auth`)

#### `POST /v1/auth/signup`
Registers a new caregiver account and persists user profile into AWS DynamoDB.

- **Request Body**:
```json
{
  "name": "Priya Sharma",
  "email": "priya.caregiver@example.com",
  "password": "securepassword123",
  "patient_name": "Sunita (Mom)",
  "relationship": "Mother",
  "stage": "Middle Stage"
}
```
- **cURL**:
```bash
curl -X POST "http://localhost:8000/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya Sharma","email":"priya.caregiver@example.com","password":"password","patient_name":"Sunita (Mom)","relationship":"Mother","stage":"Middle Stage"}'
```

#### `POST /v1/auth/login`
Authenticates caregiver or patient credentials against DynamoDB user table.

- **Request Body**:
```json
{
  "email": "priya.caregiver@example.com",
  "password": "password",
  "role": "caregiver"
}
```

#### `POST /v1/auth/patient-login`
Dedicated quick 1-tap/PIN authentication portal for patient mode.

- **Response**:
```json
{
  "access_token": "cognitrace_jwt_usr_patient_001",
  "token_type": "bearer",
  "user": {
    "id": "usr_patient_001",
    "name": "Sunita Sharma",
    "email": "sunita.patient@example.com",
    "role": "patient",
    "patient_name": "Sunita",
    "relationship": "Self",
    "stage": "Middle Stage"
  }
}
```

#### `GET /v1/auth/me`
Retrieves current authenticated user session profile.
- **Headers**: `Authorization: Bearer <access_token>`

---

### 2. Assessments & Extraction Router (`/api/v1/assessments`, `/v1/patient`)

#### `POST /api/v1/assessments/audio`
Ingests speech audio (WAV/MP3/WebM), extracts acoustic (librosa pitch, pause ratio, jitter) & linguistic (faster-whisper transcript) digital biomarkers, and evaluates cognitive risk.

- **Form Data**: `file` (Binary Audio File)
- **Response**:
```json
{
  "patient_id": "patient_001",
  "composite_score": 0.34,
  "risk_tier": "MCI",
  "acoustic": {
    "speech_ratio": 0.72,
    "mean_pause_duration_ms": 380.0,
    "pause_count": 6,
    "jitter": 0.008
  },
  "linguistic": {
    "type_token_ratio": 0.58,
    "transcript": "I see a boy stealing cookies from the cookie jar while the mother washes dishes."
  },
  "clinical_indicators": [
    "Speech ratio slightly decreased over trailing 14 days.",
    "Pause hesitation observed in picture description."
  ]
}
```

#### `POST /api/v1/assessments/telemetry`
Evaluates psychomotor impairment risk from tap latency and reaction time interaction metrics.

- **Request Body**:
```json
{
  "tap_latencies_ms": [210.0, 225.0, 215.0],
  "reaction_times_ms": [340.0],
  "error_rate": 0.05,
  "session_duration_s": 45.0
}
```

#### `POST /api/v1/assessments/multimodal`
Multimodal ingestion endpoint accepting speech audio file + motor interaction telemetry JSON.

#### `POST /v1/patient/audio-task-turn`
Executes real-time voice turns for patients/caregivers with Redis sliding-window rate limiting, LangGraph Grok reasoning, and AWS DynamoDB RAG vector search.

- **Form Data**: `file` (Audio Blob, optional), `text` (Text Prompt, optional), `patient_id`
- **Response**:
```json
{
  "transcript": "Remind Mom to take her medicine at 8 tonight.",
  "aiResponse": "I have logged the medicine reminder into Mom's care schedule in DynamoDB.",
  "biomarkerAlert": false,
  "riskTier": "NORMAL",
  "riskScore": 0.20,
  "actions": [
    {
      "id": "act_823104",
      "toolType": "create_reminder",
      "title": "Medication Reminder Created",
      "parameters": {
        "title": "Take evening medicine (Donepezil 5mg)",
        "time": "8:00 PM"
      }
    }
  ],
  "executionTimeline": [
    { "stepIndex": 1, "title": "Acoustic & Intent Ingestion", "description": "Parsed transcript" },
    { "stepIndex": 2, "title": "DynamoDB Vector RAG Retrieval", "description": "Retrieved 4 vector memory chunks from DynamoDB" }
  ]
}
```

#### `POST /v1/patient/telemetry/sync`
Background motor interaction telemetry synchronization endpoint for mobile and web clients.

---

### 3. Analytics & Longitudinal Tracking Router (`/api/v1/analytics`, `/v1/caretaker`, `/v1/patient`)

#### `POST /api/v1/analytics/drift`
Calculates linear regression slope, 30-day percentage drift, and caregiver deterioration alerts across historical cognitive scores.

- **Request Body**:
```json
{
  "window_days": 30,
  "history": [
    { "timestamp": "2026-08-20T10:00:00Z", "risk_score": 0.22 },
    { "timestamp": "2026-08-27T10:00:00Z", "risk_score": 0.25 },
    { "timestamp": "2026-09-03T10:00:00Z", "risk_score": 0.28 },
    { "timestamp": "2026-09-10T10:00:00Z", "risk_score": 0.31 },
    { "timestamp": "2026-09-17T10:00:00Z", "risk_score": 0.34 }
  ]
}
```

#### `GET /v1/caretaker/patient/{patient_id}/summary`
Returns aggregated patient summary, longitudinal drift metrics, clinical indicators, and upcoming schedule.

#### `POST /v1/patient/reminiscence/prompt`
Generates calm, supportive voice prompts for reminiscing over photo memories.

- **Request Body**:
```json
{
  "memory_id": "mem_101",
  "description": "Goa Beach family vacation sunset 1987"
}
```

---

### 4. AWS DynamoDB RAG Research & Vector Router (`/v1/rag`)

#### `POST /v1/rag/vectors`
Ingests text chunks, embedding vector float arrays, and metadata into AWS DynamoDB (`CogniTrace` table).

- **Request Body**:
```json
{
  "user_id": "patient_001",
  "vector_id": "vec_mem_001",
  "text_chunk": "Goa Family Vacation Memory (1987): Mom watching the sunset by the ocean waves with family.",
  "embedding": [0.12, 0.45, 0.88, 0.33, 0.67, 0.91, 0.24, 0.15],
  "metadata": { "category": "Memory", "topic": "Goa Beach 1987" }
}
```

#### `GET /v1/rag/vectors/{patient_id}`
Queries all stored RAG vector chunks for a patient from AWS DynamoDB.

#### `POST /v1/rag/search`
Performs vector context retrieval matching user queries against stored vector memory chunks.

- **Request Body**:
```json
{
  "query": "Goa beach photo sunset memory",
  "patient_id": "patient_001"
}
```

---

### 5. System Health Probes (`/health/live`, `/health/ready`, `/health`)

#### `GET /health/live`
Kubernetes & AWS ALB Liveness Probe (`{"status": "alive"}`).

#### `GET /health/ready`
Readiness Probe checking Postgres Connection Pool, Redis Service, and AWS DynamoDB Table Status.

```json
{
  "status": "ready",
  "postgres": "connected",
  "redis": "connected",
  "dynamodb": "connected",
  "timestamp": 1789726800.0
}
```

---

## 🧪 Unit Testing

Run the full pytest suite (13 automated test cases covering acoustic signal extraction, risk scoring, sliding rate limit, LangGraph Grok agent, DynamoDB user persistence, and RAG vector search):

```bash
.\.venv\Scripts\pytest
```
