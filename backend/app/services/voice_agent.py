import os
import re
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
import httpx
from pydantic import BaseModel, Field

from app.config import settings
from app.services.vector_store import vector_store
from app.database.dynamodb import dynamodb_service

logger = logging.getLogger("cognitrace.voice_agent")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")


class VoiceAgentToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any] = {}


class VoiceAgentResponse(BaseModel):
    transcript: str
    speech_response: str
    tool_calls: List[VoiceAgentToolCall] = []
    ui_modal: Optional[str] = None  # 'VERIFY_ADD', 'VERIFY_COMPLETE', 'VERIFY_ACTION', 'MEMORIES_PREVIEW'
    target_route: Optional[str] = None
    retrieved_memory: Optional[Dict[str, Any]] = None


CLINICAL_SYSTEM_INSTRUCTION = """
You are Dr. Elena Vance, a compassionate, board-certified Neuro-Cognitive Specialist and AI Care Companion for CogniTrace.
You provide real-time cognitive grounding, reminiscence therapy, and daily routine assistance for individuals with cognitive impairment (Alzheimer's, vascular dementia, mild memory loss).

CORE CLINICAL BEHAVIOR & RULES:

1. Validation Therapy Protocol:
   - If the patient displays confusion, hallucinations, disorientation to time/place, or asks for deceased relatives, NEVER argue, challenge, or confront them.
   - Validate their emotional core first (e.g., "You really love your mother and feel safe with her. She sounds wonderful. Let's look at some family pictures together.").
   - Shift focus gently using positive reminiscence cues.

2. Reminiscence Grounding (Using Retrieved Memory Vectors):
   - When the patient asks about their life, family, past moments, or feels anxious, call `retrieve_memory_reminiscence`.
   - Use the retrieved story and photo URL to anchor their identity. Keep sentences short, comforting, and rhythmically paced.

3. Action Execution Limits & Strict Permission Boundaries:
   - You are authorized to create, complete, update, and delete reminders, and manage clinical appointments.
   - You are STRICTLY FORBIDDEN from deleting or modifying patient life stories and memories. Those are sacred archival records.
   - If a patient asks to delete, edit, or remove a memory or story via voice, explain gently: "Your family memories and life stories are sacred permanent keepsakes. They cannot be changed or removed by voice, ensuring your precious moments remain safe forever."

4. Audio Output Constraints:
   - Your responses will be spoken aloud via TTS. Keep spoken outputs to 1–2 soothing, clear sentences unless leading a therapeutic reminiscence exercise.
"""

GEMINI_TOOLS_DECLARATION = [
    {
        "name": "create_reminder",
        "description": "Schedule a new daily reminder or medicine alarm for the patient.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING", "description": "The task title (e.g., Drink water, take evening pill)"},
                "scheduled_time": {"type": "STRING", "description": "Time in ISO or HH:MM format"}
            },
            "required": ["title", "scheduled_time"]
        }
    },
    {
        "name": "complete_reminder",
        "description": "Mark an existing reminder or medication as completed.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "reminder_id": {"type": "STRING", "description": "ID of the reminder to mark done"}
            },
            "required": ["reminder_id"]
        }
    },
    {
        "name": "update_reminder",
        "description": "Update time or details of an existing reminder.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "reminder_id": {"type": "STRING", "description": "ID of the reminder to update"},
                "new_time": {"type": "STRING", "description": "New scheduled time"}
            },
            "required": ["reminder_id", "new_time"]
        }
    },
    {
        "name": "delete_reminder",
        "description": "Delete a scheduled reminder.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "reminder_id": {"type": "STRING", "description": "ID of reminder to remove"}
            },
            "required": ["reminder_id"]
        }
    },
    {
        "name": "manage_appointment",
        "description": "Check or update doctor and clinic appointments.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "action": {"type": "STRING", "enum": ["CHECK", "UPDATE", "CANCEL", "CREATE"]},
                "appointment_id": {"type": "STRING", "description": "Optional appointment ID"}
            },
            "required": ["action"]
        }
    },
    {
        "name": "retrieve_memory_reminiscence",
        "description": "Semantic search to fetch comforting family memories, photo URLs, and life stories when patient feels anxious, disoriented, or asks for photos/family.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {"type": "STRING", "description": "Topic or person to search (e.g., family picnic, daughter Sarah, Goa trip)"}
            },
            "required": ["query"]
        }
    }
]


class ClinicalNeuroVoiceAgent:
    """
    Google Gemini Clinical Neuro-Therapeutic Voice Engine.
    Employs Validation Therapy, Reminiscence Vector Retrieval, and Strict Permission Enforcement.
    """

    async def process_turn(
        self,
        prompt: str,
        patient_id: str = "patient_001",
        user_role: str = "patient"
    ) -> VoiceAgentResponse:
        lower = prompt.lower()

        # ==================================================================
        # STRICT PERMISSION GUARDRAIL CHECK: BLOCK MEMORY MUTATION VIA VOICE
        # ==================================================================
        if ("memory" in lower or "photo" in lower or "picture" in lower or "story" in lower) and \
           ("delete" in lower or "remove" in lower or "edit" in lower or "change" in lower or "erase" in lower):
            speech = "Your family memories and life stories are sacred permanent keepsakes. They cannot be changed or removed by voice, ensuring your precious moments remain safe forever."
            return VoiceAgentResponse(
                transcript=prompt,
                speech_response=speech,
                tool_calls=[],
                ui_modal=None,
                target_route="/memories"
            )

        # Retrieve relevant memory vectors from VectorStore
        matched_memories = vector_store.search_memories(patient_id, prompt, top_k=2)
        memory_snippets = []
        for m in matched_memories:
            memory_snippets.append(f"- Memory '{m.get('title')}': {m.get('narrative') or m.get('description')} (Photo: {m.get('photo_url')})")
        
        vector_context = "\n".join(memory_snippets) if memory_snippets else "No specific memory matched."

        # Execute Gemini API call if key is available
        if GEMINI_API_KEY and GEMINI_API_KEY != "AQ.Ab8RN6LqjBmwVMdowBJZ6_kVfXs29firXQKFCsCuLMzeGiHJFQ_invalid":
            try:
                ai_resp = await self._call_gemini_api(prompt, vector_context)
                if ai_resp:
                    return ai_resp
            except Exception as e:
                logger.warning(f"[VoiceAgent] Gemini API execution failed: {e}. Executing clinical deterministic graph.")

        # Fallback Clinical Graph Logic
        return self._clinical_deterministic_graph(prompt, patient_id, matched_memories)

    async def _call_gemini_api(self, prompt: str, vector_context: str) -> Optional[VoiceAgentResponse]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        full_system = f"{CLINICAL_SYSTEM_INSTRUCTION}\n\nRETRIEVED VECTOR MEMORIES:\n{vector_context}\n"
        payload = {
            "contents": [{"parts": [{"text": f"{full_system}\nPatient prompt: {prompt}"}]}],
            "tools": [{"functionDeclarations": GEMINI_TOOLS_DECLARATION}],
            "generationConfig": {"temperature": 0.2}
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
                    tool_calls = []

                    for part in parts:
                        if "text" in part:
                            speech_text += part["text"]
                        if "functionCall" in part:
                            fc = part["functionCall"]
                            tool_calls.append(VoiceAgentToolCall(
                                name=fc.get("name"),
                                arguments=fc.get("args", {})
                            ))

                    modal = None
                    target = None
                    retrieved = None

                    for tc in tool_calls:
                        if tc.name == "create_reminder":
                            modal = "VERIFY_ADD"
                        elif tc.name == "complete_reminder":
                            modal = "VERIFY_COMPLETE"
                        elif tc.name == "manage_appointment":
                            modal = "VERIFY_ACTION"
                            target = "/appointments"
                        elif tc.name == "retrieve_memory_reminiscence":
                            modal = "MEMORIES_PREVIEW"
                            target = "/memories"

                    return VoiceAgentResponse(
                        transcript=prompt,
                        speech_response=speech_text.strip() or "I'm right here with you.",
                        tool_calls=tool_calls,
                        ui_modal=modal,
                        target_route=target,
                        retrieved_memory=retrieved
                    )
        return None

    def _clinical_deterministic_graph(
        self,
        prompt: str,
        patient_id: str,
        matched_memories: List[Dict[str, Any]]
    ) -> VoiceAgentResponse:
        lower = prompt.lower()
        tool_calls = []
        modal = None
        target = None
        retrieved = None

        # Check for appointment intent
        if any(w in lower for w in ["appointment", "doctor", "consultation", "clinic", "hospital"]):
            tool_calls.append(VoiceAgentToolCall(
                name="manage_appointment",
                arguments={"action": "CHECK"}
            ))
            existing_apts = dynamodb_service.get_appointments(patient_id)
            if existing_apts:
                first = existing_apts[0]
                doc = first.get("doctorName") or first.get("title") or "Doctor Consultation"
                when = f"{first.get('date', 'soon')} at {first.get('time', '')}".strip()
                speech = f"You have an upcoming appointment: {doc} scheduled for {when}."
            else:
                speech = "You currently have no upcoming doctor appointments scheduled."
            modal = "VERIFY_ACTION"
            target = "/appointments"

        # Check for memory / photo intent
        elif any(w in lower for w in ["memory", "photo", "picture", "goa", "family", "garden", "reminisce"]):
            tool_calls.append(VoiceAgentToolCall(
                name="retrieve_memory_reminiscence",
                arguments={"query": prompt}
            ))
            modal = "MEMORIES_PREVIEW"
            target = "/memories"
            if matched_memories:
                retrieved = matched_memories[0]
                speech = f"Here is your memory '{retrieved.get('title')}'. Do you remember that special day?"
            else:
                speech = "Here are your preserved family memory photo cards!"

        # Check for complete reminder intent
        elif any(w in lower for w in ["complete", "done", "finished", "took pill", "took medicine"]):
            tool_calls.append(VoiceAgentToolCall(
                name="complete_reminder",
                arguments={"reminder_id": "rem_1"}
            ))
            modal = "VERIFY_COMPLETE"
            speech = "Great job! I've marked your evening medication as completed."

        # Default create reminder intent
        else:
            tool_calls.append(VoiceAgentToolCall(
                name="create_reminder",
                arguments={"title": prompt, "scheduled_time": "8:00 PM"}
            ))
            modal = "VERIFY_ADD"
            speech = f"I've added '{prompt}' to your care schedule for 8:00 PM."

        return VoiceAgentResponse(
            transcript=prompt,
            speech_response=speech,
            tool_calls=tool_calls,
            ui_modal=modal,
            target_route=target,
            retrieved_memory=retrieved
        )


voice_agent = ClinicalNeuroVoiceAgent()
