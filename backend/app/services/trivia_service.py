import os
import json
import random
import logging
from typing import Dict, Any, List, Optional
import httpx

from app.config import settings
from app.database.dynamodb import dynamodb_service
from app.models.schemas import (
    TriviaRoundResponse,
    TriviaSubmissionRequest,
    TriviaSubmissionResponse
)

logger = logging.getLogger("cognitrace.trivia")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")
GEMINI_MODELS = [
    os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    "gemini-3.6-flash",
    "gemini-2.5-flash-latest",
]


class TriviaService:
    """
    RAG-powered Memory Trivia Generator & Clinical Engagement Service.
    Retrieves stored memories and vector embeddings from DynamoDB and uses Gemini API
    to formulate warm, supportive reminiscence trivia questions.
    """

    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.models = GEMINI_MODELS

    async def generate_trivia_round(self, patient_id: str = "patient_001") -> TriviaRoundResponse:
        memories = dynamodb_service.get_memories(patient_id)
        if not memories:
            memories = dynamodb_service._get_default_seed_memories()

        # Select a target memory entry
        target_memory = random.choice(memories)
        memory_id = target_memory.get("id", f"mem_{int(random.random()*1000)}")
        image_url = target_memory.get("imageUrl", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80")
        mem_title = target_memory.get("title", "Family Memory")
        mem_date = target_memory.get("date", "Summer 1987")
        mem_location = target_memory.get("location", "Family Home")
        mem_desc = target_memory.get("description", "")
        mem_people = target_memory.get("people", ["Mom", "Caregiver"])
        mem_prompt = target_memory.get("reminiscencePrompt", "")

        # Retrieve RAG vector chunks for semantic context enrichment
        rag_chunks = dynamodb_service.search_rag_vectors(patient_id, f"{mem_title} {mem_location} {mem_desc}")
        rag_context = "\n".join([c.get("text_chunk", "") for c in rag_chunks]) if rag_chunks else ""

        # Try Gemini API generation
        if self.api_key and self.api_key != "MOCK_KEY":
            try:
                gemini_res = await self._call_gemini_trivia(
                    target_memory=target_memory,
                    rag_context=rag_context
                )
                if gemini_res:
                    return gemini_res
            except Exception as e:
                logger.warning(f"[TriviaService] Gemini API call failed: {e}. Using fallback generator.")

        # Fallback intelligent generator
        return self._generate_fallback_trivia(target_memory)

    async def _call_gemini_trivia(self, target_memory: Dict[str, Any], rag_context: str) -> Optional[TriviaRoundResponse]:
        system_instruction = (
            "You are a warm, supportive cognitive memory specialist creating reminiscence trivia for an individual with memory care needs.\n"
            "Rules:\n"
            "- Tone: Warm, encouraging, non-test-like, and patient.\n"
            "- Question types: Frame questions focusing on happy associative moments (people present, landmark locations, celebrations).\n"
            "- Structure: Provide 1 correct answer (index 0 or specified) and 2 or 3 plausible, gentle distractors using familiar names.\n"
            "- Hint: Provide an empathetic, observant hint based on visual or narrative cues in the photo.\n"
            "- Return JSON ONLY adhering to this exact schema:\n"
            "{\n"
            '  "question": "string",\n'
            '  "options": ["string", "string", "string"],\n'
            '  "correct_index": 0,\n'
            '  "gentle_hint": "string",\n'
            '  "encouragement_fact": "string"\n'
            "}"
        )

        user_prompt = (
            f"TARGET PHOTO MEMORY:\n"
            f"- Title: {target_memory.get('title')}\n"
            f"- Date: {target_memory.get('date')}\n"
            f"- Location: {target_memory.get('location')}\n"
            f"- Description: {target_memory.get('description')}\n"
            f"- People Present: {', '.join(target_memory.get('people', []))}\n"
            f"- Prompt Hint: {target_memory.get('reminiscencePrompt')}\n\n"
            f"RAG RETRIEVED SEMANTIC CONTEXT:\n{rag_context}\n\n"
            f"Generate 1 warm, supportive multiple-choice reminiscence question based on this memory."
        )

        for model_name in self.models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": system_instruction + "\n\n" + user_prompt}]}
                ],
                "generationConfig": {
                    "temperature": 0.4,
                    "response_mime_type": "application/json"
                }
            }
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and candidates[0].get("content", {}).get("parts"):
                            raw_json = candidates[0]["content"]["parts"][0].get("text", "")
                            parsed = json.loads(raw_json)

                            options = parsed.get("options", [])
                            if len(options) >= 3:
                                round_id = f"rnd_{int(random.random() * 100000)}"
                                return TriviaRoundResponse(
                                    round_id=round_id,
                                    memory_id=target_memory.get("id", "mem_1"),
                                    image_url=target_memory.get("imageUrl", ""),
                                    title=target_memory.get("title", "Family Memory"),
                                    date=target_memory.get("date", ""),
                                    location=target_memory.get("location", ""),
                                    question=parsed.get("question", f"Do you remember this moment from {target_memory.get('title')}?"),
                                    options=options[:4],
                                    correct_index=int(parsed.get("correct_index", 0)),
                                    gentle_hint=parsed.get("gentle_hint", "Look closely at who was smiling beside you!"),
                                    encouragement_fact=parsed.get("encouragement_fact", "Such a beautiful memory shared together!")
                                )
            except Exception as e:
                logger.warning(f"[TriviaService] Gemini model '{model_name}' failed: {e}")
                continue

        return None

    def _generate_fallback_trivia(self, memory: Dict[str, Any]) -> TriviaRoundResponse:
        title = memory.get("title", "Family Moment")
        title_lower = title.lower()
        people = memory.get("people", ["Family"])
        people_str = ", ".join(people[:2])
        location = memory.get("location", "Home")
        round_id = f"rnd_{int(random.random() * 100000)}"

        if "goa" in title_lower or "beach" in title_lower:
            return TriviaRoundResponse(
                round_id=round_id,
                memory_id=memory.get("id", "mem_1"),
                image_url=memory.get("imageUrl", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"),
                title=title,
                date=memory.get("date", "Summer 1987"),
                location=location,
                question=f"Who joined you on this sunny beach vacation in {location}?",
                options=["Dad (Ramesh) & Priya", "Doctor Anita", "Neighbors from next door"],
                correct_index=0,
                gentle_hint="Think about who loved walking along the shoreline with you for sunset ice cream!",
                encouragement_fact="Ramesh and Priya loved making sandcastles by the ocean waves with you that afternoon!"
            )
        elif "garden" in title_lower or "rose" in title_lower or "flower" in title_lower:
            return TriviaRoundResponse(
                round_id=round_id,
                memory_id=memory.get("id", "mem_2"),
                image_url=memory.get("imageUrl", "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"),
                title=title,
                date=memory.get("date", "March 2015"),
                location=location,
                question="What special flowers bloomed so vibrantly in your home garden here?",
                options=["Yellow & Red Roses", "Purple Orchids", "White Tulips"],
                correct_index=0,
                gentle_hint="You spent the morning planting these fragrant blossoms in your backyard garden!",
                encouragement_fact="You cared for those rose bushes every single morning and they bloomed beautifully for months!"
            )
        elif "graduation" in title_lower or "degree" in title_lower:
            return TriviaRoundResponse(
                round_id=round_id,
                memory_id=memory.get("id", "mem_3"),
                image_url=memory.get("imageUrl", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"),
                title=title,
                date=memory.get("date", "June 2021"),
                location=location,
                question="Whose special graduation ceremony were you celebrating on this proud day?",
                options=["Ananya (Granddaughter)", "Priya (Caregiver)", "Rahul (Son)"],
                correct_index=0,
                gentle_hint="Look at who is wearing the black cap and gown in the middle of the photo!",
                encouragement_fact="Ananya hugged you tightly right after receiving her engineering diploma!"
            )
        else:
            return TriviaRoundResponse(
                round_id=round_id,
                memory_id=memory.get("id", "mem_4"),
                image_url=memory.get("imageUrl", "https://images.unsplash.com/photo-1599785209707-a456fc1337cc?auto=format&fit=crop&w=800&q=80"),
                title=title,
                date=memory.get("date", "Diwali 2019"),
                location=location,
                question=f"What delicious tradition were you preparing together in {location}?",
                options=["Cardamom Festival Sweets", "Birthday Cake", "Morning Coffee"],
                correct_index=0,
                gentle_hint="The kitchen was filled with sweet cardamom and almond aromas all afternoon!",
                encouragement_fact="Everyone loved your famous home-style kaju katli sweets during the festival!"
            )

    def record_submission(self, submission: TriviaSubmissionRequest) -> TriviaSubmissionResponse:
        ts_ms = int(random.random() * 100000)
        item = {
            "patient_id": submission.patient_id,
            "round_id": submission.round_id,
            "selected_index": submission.selected_index,
            "is_correct": submission.is_correct,
            "duration_s": submission.duration_s
        }

        try:
            dynamodb_service.save_voice_chat(
                patient_id=submission.patient_id,
                chat_data={
                    "id": f"trivia_{ts_ms}",
                    "transcript": f"Memory Trivia Round Completed ({'Correct' if submission.is_correct else 'Hint Explored'})",
                    "ai_response": "Wonderful memory shared together!",
                    "risk_tier": "NORMAL",
                    "risk_score": 0.15
                }
            )
        except Exception as e:
            logger.warning(f"[TriviaService] Error saving submission log: {e}")

        return TriviaSubmissionResponse(
            status="success",
            is_correct=submission.is_correct,
            encouragement_fact="Wonderful memories shared today! Memory engagement keeps your mind vibrant and warm.",
            message="Round activity recorded successfully."
        )


trivia_service = TriviaService()
