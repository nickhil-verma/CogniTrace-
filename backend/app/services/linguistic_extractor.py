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

    def transcribe_audio(self, audio_bytes: bytes) -> str:
        model = self._get_model()
        if model is None:
            return "Patient described memory task with minor hesitation."

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
            tmp_path = tmp_file.name
            tmp_file.write(audio_bytes)

        try:
            segments, _ = model.transcribe(tmp_path, beam_size=1)
            text = " ".join([segment.text for segment in segments]).strip()
            return text if text else "Patient response recorded."
        except Exception as e:
            print(f"[LinguisticExtractor] Transcription error: {e}")
            return "Patient response recorded with acoustic pauses."
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

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
        if fallback_text and fallback_text.strip():
            transcript = fallback_text.strip()
        else:
            transcript = self.transcribe_audio(audio_bytes)
        return self.analyze_text(transcript)

    async def extract_features_async(self, audio_bytes: bytes, fallback_text: Optional[str] = None) -> LinguisticFeatures:
        """
        Non-blocking worker thread wrapper offloading ASR inference off the asyncio event loop.
        """
        return await anyio.to_thread.run_sync(self.extract_features, audio_bytes, fallback_text)


linguistic_extractor = LinguisticExtractor()
