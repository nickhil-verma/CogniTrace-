import os
import json
import logging
import httpx
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from app.config import settings

logger = logging.getLogger("cognitrace.asr_corrector")


class ASRCorrectionResult(BaseModel):
    raw_transcript: str
    corrected_transcript: str
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0)
    corrections_made: List[str] = Field(default_factory=list)


CORRECTION_SYSTEM_PROMPT = """
You are CogniTrace's High-Precision ASR Phonetic Post-Correction Middleware Engine.
Your task is to inspect raw Speech-to-Text (STT) transcripts from dementia patients or caregivers and fix acoustic distortions, slurred speech, or phonetic mishearings.

GROUND-TRUTH DOMAIN DICTIONARY & PATIENT ENTITIES:
- Medications: Donepezil, Memantine, Galantamine, Rivastigmine, Aricept, Namenda, Exelon.
- Clinical Terms: Validation therapy, reminiscence, orientation, caregiver, neurologist, compliance, telemetry.

RULES:
1. Detect phonetic mishearings, acoustic substitutions, or slurred words (e.g. "done a pestil" -> "Donepezil", "remember berry" -> "remember Mary", "ari cept" -> "Aricept").
2. Anchor entity matching against PATIENT CONTEXT (known family member names, active medications, reminders, doctor names).
3. STRICT NEGATION PRESERVATION: You MUST NEVER remove, invert, or alter strict negations ("no", "never", "didn't", "don't", "wasn't", "not", "won't"). "no I didn't take pills" MUST remain "no I didn't take pills".
4. ZERO REPHRASING: Do NOT summarize, smooth, or rewrite the transcript into formal English. Preserve original spoken grammar, pauses, false starts, and intent.
5. Return ONLY a valid JSON object with the following exact keys:
   - "corrected_transcript": (string) cleaned transcript with phonetic substitutions fixed
   - "confidence_score": (float between 0.0 and 1.0)
   - "corrections_made": (array of strings, e.g. ["done a pestil -> Donepezil"])
"""


class ASRCorrector:
    """
    Two-Stage Phonetic Post-Correction Service using Gemini Flash at zero temperature.
    Grounds phonetic reconstruction in patient entities and guarantees negation preservation.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")

    async def correct_transcription(
        self,
        raw_transcript: str,
        patient_context: Optional[Dict[str, Any]] = None
    ) -> ASRCorrectionResult:
        if not raw_transcript or not raw_transcript.strip():
            return ASRCorrectionResult(
                raw_transcript=raw_transcript or "",
                corrected_transcript=raw_transcript or "",
                confidence_score=1.0,
                corrections_made=[]
            )

        trimmed = raw_transcript.strip()
        context = patient_context or {}

        # If API key is missing, return raw transcript safely
        if not self.api_key:
            logger.warning("[ASRCorrector] GEMINI_API_KEY not set. Returning raw transcript.")
            return ASRCorrectionResult(
                raw_transcript=trimmed,
                corrected_transcript=trimmed,
                confidence_score=1.0,
                corrections_made=[]
            )

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
            
            user_prompt = f"""
PATIENT CONTEXT ENTITIES:
{json.dumps(context, indent=2)}

RAW STT TRANSCRIPT:
"{trimmed}"

Perform deterministic zero-temperature phonetic correction and return JSON only.
"""
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": CORRECTION_SYSTEM_PROMPT},
                            {"text": user_prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.0,
                    "responseMimeType": "application/json"
                }
            }

            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    if hasattr(data, "__await__"):
                        data = await data
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            raw_json = parts[0].get("text", "").strip()
                            parsed = json.loads(raw_json)
                            corrected = parsed.get("corrected_transcript", trimmed)
                            confidence = float(parsed.get("confidence_score", 0.95))
                            corrections = parsed.get("corrections_made", [])

                            # Extra Safety Check: Ensure negations are preserved
                            lower_raw = trimmed.lower()
                            lower_corrected = corrected.lower()
                            negation_words = ["no", "didn't", "don't", "never", "wasn't", "not", "won't"]
                            for neg in negation_words:
                                if f" {neg} " in f" {lower_raw} " or lower_raw.startswith(f"{neg} "):
                                    if neg not in lower_corrected:
                                        logger.warning(f"[ASRCorrector] Negation '{neg}' dropped by model. Reverting correction.")
                                        return ASRCorrectionResult(
                                            raw_transcript=trimmed,
                                            corrected_transcript=trimmed,
                                            confidence_score=1.0,
                                            corrections_made=[]
                                        )

                            return ASRCorrectionResult(
                                raw_transcript=trimmed,
                                corrected_transcript=corrected,
                                confidence_score=confidence,
                                corrections_made=corrections if isinstance(corrections, list) else []
                            )

        except Exception as e:
            logger.error(f"[ASRCorrector] Exception during phonetic correction pass: {e}", exc_info=True)

        # Fallback: Safely return raw transcript without failing voice stream
        return ASRCorrectionResult(
            raw_transcript=trimmed,
            corrected_transcript=trimmed,
            confidence_score=1.0,
            corrections_made=[]
        )


asr_corrector = ASRCorrector()
