import io
import re
import tempfile
import os
import anyio
from typing import Optional
from app.config import settings
from app.models.schemas import LinguisticFeatures

HESITATION_PATTERNS = {"um", "umm", "uh", "uhh", "ah", "ahh", "er", "err", "hm", "hmm"}


class LinguisticExtractor:
    def __init__(self):
        self.model = None

    def _get_model(self):
        if self.model is None:
            try:
                from faster_whisper import WhisperModel
                # Check for baked model path first
                download_root = settings.WHISPER_MODEL_DIR if os.path.exists(settings.WHISPER_MODEL_DIR) else None
                self.model = WhisperModel(
                    settings.WHISPER_MODEL_SIZE,
                    device=settings.WHISPER_DEVICE,
                    compute_type=settings.WHISPER_COMPUTE_TYPE,
                    download_root=download_root
                )
            except Exception as e:
                print(f"[LinguisticExtractor] Faster-Whisper init warning: {e}")
                self.model = False
        return self.model if self.model is not False else None

    def transcribe_with_gemini(self, audio_bytes: bytes) -> Optional[str]:
        api_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")
        if not api_key or len(audio_bytes) < 100:
            return None
        try:
            import base64
            import httpx

            b64_data = base64.b64encode(audio_bytes).decode("utf-8")
            mime_type = "audio/wav" if audio_bytes[:4] == b"RIFF" else "audio/webm"

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            domain_bias_prompt = (
                "Transcribe this patient speech audio recording into clear english text. "
                "Domain & Clinical Vocabulary Guidance: Donepezil, Memantine, Galantamine, Rivastigmine, Aricept, "
                "Namenda, Exelon, validation therapy, reminiscence, orientation, caregiver, neurologist, daily routines, "
                "appointments, family relationships, dosage times. Output ONLY the exact transcribed spoken words."
            )
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": domain_bias_prompt
                            },
                            {"inlineData": {"mimeType": mime_type, "data": b64_data}},
                        ]
                    }
                ],
                "generationConfig": {"temperature": 0.1},
            }
            resp = httpx.post(url, json=payload, timeout=10.0)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    parts = candidates[0]["content"].get("parts", [])
                    if parts:
                        text = parts[0].get("text", "").strip()
                        if text and "issue with the video" not in text.lower():
                            return text
        except Exception as e:
            print(f"[LinguisticExtractor] Gemini audio STT error: {e}")
        return None

    def transcribe_audio(self, audio_bytes: bytes) -> str:
        # 1. Primary STT: Gemini Multimodal Audio API
        gemini_text = self.transcribe_with_gemini(audio_bytes)
        if gemini_text and len(gemini_text) > 1:
            return gemini_text

        # 2. Secondary STT: Faster-Whisper Model with Domain Vocabulary Biasing
        model = self._get_model()
        if model:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                tmp_path = tmp_file.name
                tmp_file.write(audio_bytes)

            try:
                whisper_initial_prompt = (
                    "Clinical & Dementia Care Vocabulary: Donepezil, Memantine, Galantamine, Rivastigmine, "
                    "Aricept, Namenda, Exelon, validation therapy, reminiscence, caregiver, neurologist, appointment, dosage."
                )
                segments, _ = model.transcribe(tmp_path, beam_size=1, initial_prompt=whisper_initial_prompt)
                text = " ".join([segment.text for segment in segments]).strip()
                if text:
                    return text
            except Exception as e:
                print(f"[LinguisticExtractor] Faster-Whisper transcription error: {e}")
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

        return "Patient response recorded."

    def analyze_text(self, text: str) -> LinguisticFeatures:
        words = re.findall(r"\b[a-zA-Z']+\b", text.lower())
        total_words = len(words)

        if total_words == 0:
            return LinguisticFeatures(
                type_token_ratio=0.0,
                repetitions=0,
                hesitation_markers=0,
                transcript=text
            )

        unique_words = set(words)
        ttr = len(unique_words) / total_words

        repetitions = 0
        for i in range(len(words) - 1):
            if words[i] == words[i + 1]:
                repetitions += 1

        hesitation_markers = sum(1 for word in words if word in HESITATION_PATTERNS)

        return LinguisticFeatures(
            type_token_ratio=round(ttr, 4),
            repetitions=repetitions,
            hesitation_markers=hesitation_markers,
            transcript=text
        )

    def extract_features(self, audio_bytes: bytes, fallback_text: Optional[str] = None) -> LinguisticFeatures:
        transcript = ""
        if audio_bytes and len(audio_bytes) > 200:
            transcript = self.transcribe_audio(audio_bytes)

        generic_placeholders = {
            "",
            "patient response recorded.",
            "patient response recorded with acoustic pauses.",
            "patient described memory task with minor hesitation.",
        }
        if (not transcript or transcript.strip().lower() in generic_placeholders) and fallback_text and fallback_text.strip():
            transcript = fallback_text.strip()

        if not transcript:
            transcript = "Patient response recorded."

        return self.analyze_text(transcript)

    async def extract_features_async(self, audio_bytes: bytes, fallback_text: Optional[str] = None) -> LinguisticFeatures:
        """
        Non-blocking worker thread wrapper offloading ASR inference off the asyncio event loop.
        """
        return await anyio.to_thread.run_sync(self.extract_features, audio_bytes, fallback_text)


linguistic_extractor = LinguisticExtractor()

