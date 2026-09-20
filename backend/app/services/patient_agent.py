import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx

from app.config import settings
from app.database.dynamodb import dynamodb_service
from app.services.vector_store import vector_store
from app.models.voice_chat import VoiceAgentTurnResponse

logger = logging.getLogger("cognitrace.patient_agent")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")

PATIENT_SYSTEM_INSTRUCTION = """
You are the CogniTrace Gentle Companion speaking directly with the PATIENT.

PATIENT MOTTO & OBJECTIVES:
- Keep the patient calm, grounded, and aware of their immediate next step (current medication, daily water, or a simple walk).
- Encourage them on their daily progress with warm praise ("You've already had your morning tea and your vitamins today!").
- Stimulate comforting memories through reminiscence and photo retrieval.

VALIDATION THERAPY & CLINICAL PROTOCOLS:
- NEVER argue, challenge, or attempt harsh reality-orientation if the patient is confused about time, year, or family members.
- Acknowledge the underlying emotion first ("You really miss your garden in spring. It was so peaceful. Let's look at a picture of your rose bushes.").
- Limit spoken responses to 1-2 short, soothing sentences.
- Speak in plain, accessible words (zero-literacy and cognitive-decline friendly).
- NEVER reveal administrative caregiver notes, clinical decline warnings, or complex schedules.

STRICT ACTION RESTRICTIONS:
- You are STRICTLY FORBIDDEN from deleting reminders, editing appointments, deleting memories/photos, or modifying settings.
- If asked to delete or cancel anything, respond with gentle, warm reassurance without deleting anything.
"""

PATIENT_TOOLS_DECLARATION = [
    {
        "name": "get_my_next_reminder",
        "description": "Returns the single upcoming task or medication in friendly terms for the patient.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "patient_id": {"type": "STRING", "description": "Patient identifier"}
            }
        }
    },
    {
        "name": "mark_reminder_done",
        "description": "Marks medicine/water/task as taken or finished today.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "reminder_id": {"type": "STRING", "description": "Reminder ID"}
            },
            "required": ["reminder_id"]
        }
    },
    {
        "name": "get_my_progress",
        "description": "Returns simple encouraging checkmark counts of tasks completed today.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "patient_id": {"type": "STRING", "description": "Patient identifier"}
            }
        }
    },
    {
        "name": "retrieve_memory_reminiscence",
        "description": "Semantic search for comforting family memories, photo URLs, and life stories when patient feels anxious, disoriented, or asks for photos/family.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {"type": "STRING", "description": "Topic, person, or place to search (e.g. garden, tea, daughter, Goa trip)"}
            },
            "required": ["query"]
        }
    }
]


class PatientVoiceAgent:
    """
    Gentle Validation Therapy Companion AI Engine for Patients.
    Uses patient_chat_history isolation and patient-safe tools (zero delete or appointment edit permissions).
    """

    async def process_turn(
        self,
        transcript: str,
        patient_id: str = "patient_001"
    ) -> VoiceAgentTurnResponse:
        lower = transcript.lower()

        # 1. Guardrail Check: Block Deletions & Administrative Mutations Gently
        if any(w in lower for w in ["delete", "remove", "cancel", "edit appointment", "change appointment", "settings"]):
            speech = "Everything is safe and taken care of for you today. Let's focus on your cozy day and your warm tea."
            
            dynamodb_service.save_patient_chat(
                patient_id=patient_id,
                role="user",
                message_text=transcript,
                sentiment_flag="ANXIOUS" if "anxious" in lower or "where" in lower else "CALM"
            )
            dynamodb_service.save_patient_chat(
                patient_id=patient_id,
                role="model",
                message_text=speech,
                sentiment_flag="CALM",
                grounding_cue_used="Validation Therapy De-escalation"
            )

            return VoiceAgentTurnResponse(
                transcript=transcript,
                speech_response=speech,
                agent_type="patient",
                actions=[],
                target_route="/patient/dashboard"
            )

        # 2. Fetch past Patient Chat History context ONLY
        past_history = dynamodb_service.get_patient_chat_history(patient_id, limit=10)
        history_str = "\n".join([f"{h.get('role').upper()}: {h.get('message_text')}" for h in past_history])

        # 3. Retrieve grounding memories from vector store
        matched_memories = vector_store.search_memories(patient_id, transcript, top_k=2)
        memory_snippets = []
        for m in matched_memories:
            memory_snippets.append(f"- Memory '{m.get('title')}': {m.get('narrative') or m.get('description')} (Photo: {m.get('photo_url')})")
        vector_context = "\n".join(memory_snippets) if memory_snippets else "No specific memory snippet."

        # 4. Save User turn in patient_chat_history
        dynamodb_service.save_patient_chat(
            patient_id=patient_id,
            role="user",
            message_text=transcript,
            sentiment_flag="CALM"
        )

        # 5. Attempt Gemini API Call if Key Present
        if GEMINI_API_KEY and GEMINI_API_KEY != "AQ.Ab8RN6LqjBmwVMdowBJZ6_kVfXs29firXQKFCsCuLMzeGiHJFQ_invalid":
            try:
                ai_resp = await self._call_gemini_api(transcript, history_str, vector_context, patient_id, matched_memories)
                if ai_resp:
                    grounding_cue = ai_resp.retrieved_memory.get("title") if ai_resp.retrieved_memory else None
                    dynamodb_service.save_patient_chat(
                        patient_id=patient_id,
                        role="model",
                        message_text=ai_resp.speech_response,
                        sentiment_flag="CALM",
                        grounding_cue_used=grounding_cue
                    )
                    return ai_resp
            except Exception as e:
                logger.warning(f"[PatientVoiceAgent] Gemini API failed: {e}. Using validation deterministic engine.")

        # 6. Fallback Validation Deterministic Engine
        resp = self._patient_deterministic_engine(transcript, patient_id, matched_memories)
        grounding_cue = resp.retrieved_memory.get("title") if resp.retrieved_memory else None
        dynamodb_service.save_patient_chat(
            patient_id=patient_id,
            role="model",
            message_text=resp.speech_response,
            sentiment_flag="CALM",
            grounding_cue_used=grounding_cue
        )
        return resp

    async def _call_gemini_api(
        self,
        transcript: str,
        history_str: str,
        vector_context: str,
        patient_id: str,
        matched_memories: List[Dict[str, Any]]
    ) -> Optional[VoiceAgentTurnResponse]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        full_system = (
            f"{PATIENT_SYSTEM_INSTRUCTION}\n\n"
            f"RECENT PATIENT CHAT HISTORY:\n{history_str}\n\n"
            f"REMINISCENCE MEMORY VECTORS:\n{vector_context}\n"
        )
        payload = {
            "contents": [{"parts": [{"text": f"{full_system}\nPatient prompt: {transcript}"}]}],
            "tools": [{"functionDeclarations": PATIENT_TOOLS_DECLARATION}],
            "generationConfig": {"temperature": 0.3}
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    content = candidates[0].get("content", {})
                    parts = content.get("parts", [])
                    speech_text = ""
                    actions = []
                    modal = None
                    target = "/patient/dashboard"
                    retrieved = None

                    for part in parts:
                        if "text" in part:
                            speech_text += part["text"]
                        if "functionCall" in part:
                            fc = part["functionCall"]
                            fn_name = fc.get("name")
                            fn_args = fc.get("args", {})
                            actions.append({"tool": fn_name, "args": fn_args})

                            if fn_name == "mark_reminder_done":
                                modal = "VERIFY_COMPLETE"
                                if fn_args.get("reminder_id"):
                                    dynamodb_service.complete_reminder(patient_id, fn_args.get("reminder_id"))
                            elif fn_name == "retrieve_memory_reminiscence":
                                modal = "MEMORIES_PREVIEW"
                                target = "/memories"
                                if matched_memories:
                                    retrieved = matched_memories[0]

                    # Enforce 1-2 soothing short sentences
                    sentences = [s.strip() for s in speech_text.split(".") if s.strip()]
                    if len(sentences) > 2:
                        speech_text = ". ".join(sentences[:2]) + "."

                    if not speech_text:
                        speech_text = "You're doing wonderfully today. I'm right here with you."

                    return VoiceAgentTurnResponse(
                        transcript=transcript,
                        speech_response=speech_text.strip(),
                        agent_type="patient",
                        actions=actions,
                        ui_modal=modal,
                        target_route=target,
                        retrieved_memory=retrieved
                    )
        return None

    def _patient_deterministic_engine(
        self,
        transcript: str,
        patient_id: str,
        matched_memories: List[Dict[str, Any]]
    ) -> VoiceAgentTurnResponse:
        lower = transcript.lower()
        actions = []
        modal = None
        target = "/patient/dashboard"
        retrieved = None

        # How am I doing / Progress query
        if any(w in lower for w in ["how am i", "my progress", "how did i do", "what did i do"]):
            actions.append({"tool": "get_my_progress", "args": {"patient_id": patient_id}})
            reminders = dynamodb_service.get_reminders(patient_id)
            completed_count = len([r for r in reminders if r.get("status") in ["Completed", "Done"]])
            speech = f"You are doing so wonderfully today! You've already completed {completed_count} tasks and taken your morning vitamins."

        # Next reminder / What is next query
        elif any(w in lower for w in ["next", "what should i do", "water", "medicine", "pill"]):
            actions.append({"tool": "get_my_next_reminder", "args": {"patient_id": patient_id}})
            reminders = dynamodb_service.get_reminders(patient_id)
            upcoming = [r for r in reminders if r.get("status") not in ["Completed", "Done"]]
            if upcoming:
                next_task = upcoming[0]
                speech = f"Your next step is to {next_task.get('title', 'take a sip of water')}. Take all the time you need."
            else:
                speech = "All your main routine steps for today are complete! Rest comfortably."

        # Mark done / Complete task
        elif any(w in lower for w in ["done", "took it", "drank water", "finished"]):
            actions.append({"tool": "mark_reminder_done", "args": {"reminder_id": "rem_1"}})
            modal = "VERIFY_COMPLETE"
            reminders = dynamodb_service.get_reminders(patient_id)
            if reminders:
                dynamodb_service.complete_reminder(patient_id, reminders[0].get("id"))
            speech = "Wonderful job! I've placed a bright green checkmark on your daily progress chart."

        # Memory / Reminiscence query
        elif any(w in lower for w in ["photo", "picture", "family", "memory", "goa", "garden", "home", "mother", "mom"]):
            actions.append({"tool": "retrieve_memory_reminiscence", "args": {"query": transcript}})
            modal = "MEMORIES_PREVIEW"
            target = "/memories"
            if matched_memories:
                retrieved = matched_memories[0]
                speech = f"You loved {retrieved.get('title')}. Let's look at this beautiful photo together."
            else:
                speech = "Let's look at your special family memories together."

        # Default gentle validation fallback
        else:
            speech = "I'm right here with you. Everything is calm and peaceful today."

        return VoiceAgentTurnResponse(
            transcript=transcript,
            speech_response=speech,
            agent_type="patient",
            actions=actions,
            ui_modal=modal,
            target_route=target,
            retrieved_memory=retrieved
        )


patient_voice_agent = PatientVoiceAgent()
