# CogniTrace

**CogniTrace** is an AI-powered dementia and cognitive-care companion designed for caregivers and patients.

## Key Features

- **AI Voice Command Center**: Speak naturally to manage reminders, appointments, care summary checks, and memories.
- **Observed Cognitive Care Tracking**: Track 6-month observations across memory recall, communication expressiveness, and daily independence using calm, neutral healthcare visualizers.
- **Family Photo Memories & Reminiscence**: Preserve family photo albums and trigger interactive Reminiscence Conversations.
- **Caregiver Daily Reflective Journal**: Record daily observations and generate AI weekly care digests.
- **Medication & Routine Reminders**: Schedule and complete daily care tasks.
- **Multilingual Support**: Supports English, Hindi (हिंदी), Bengali (বাংলা), and Assamese (অসমীয়া).

---

## Project Structure

```
cognitrace/
├── backend/        # FastAPI, Bedrock Claude, Polly, DynamoDB, S3 service architecture
└── webapp/         # Next.js 15+, Tailwind CSS, Framer Motion, Recharts frontend application
```

---

## Getting Started

### Web Application

```bash
cd webapp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
