import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.asr_corrector import ASRCorrector, ASRCorrectionResult


def test_medication_mishearing_correction():
    async def run():
        corrector = ASRCorrector()
        raw_transcript = "take done a pestil at eight"
        patient_context = {
            "patient_id": "patient_001",
            "medications": ["Donepezil", "Memantine"],
            "family_members": ["Priya", "Mary"]
        }

        mock_llm_json = '{"corrected_transcript": "take Donepezil at 8:00 AM", "confidence_score": 0.98, "corrections_made": ["done a pestil -> Donepezil"]}'

        with patch("httpx.AsyncClient.post") as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "candidates": [
                    {
                        "content": {
                            "parts": [{"text": mock_llm_json}]
                        }
                    }
                ]
            }
            mock_post.return_value = mock_response

            result: ASRCorrectionResult = await corrector.correct_transcription(raw_transcript, patient_context)

            assert "Donepezil" in result.corrected_transcript
            assert result.confidence_score >= 0.9
            assert len(result.corrections_made) > 0

    asyncio.run(run())


def test_negation_preservation():
    async def run():
        corrector = ASRCorrector()
        raw_transcript = "no I didn't take pills"
        patient_context = {
            "patient_id": "patient_001",
            "medications": ["Donepezil"]
        }

        # Even if model attempts to strip negation, our corrector safety check reverts it
        mock_bad_json = '{"corrected_transcript": "I took pills", "confidence_score": 0.90, "corrections_made": ["cleaned sentence"]}'

        with patch("httpx.AsyncClient.post") as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "candidates": [
                    {
                        "content": {
                            "parts": [{"text": mock_bad_json}]
                        }
                    }
                ]
            }
            mock_post.return_value = mock_response

            result: ASRCorrectionResult = await corrector.correct_transcription(raw_transcript, patient_context)

            # Must preserve original strict negations ("no", "didn't")
            assert "no" in result.corrected_transcript.lower()
            assert "didn't" in result.corrected_transcript.lower()

    asyncio.run(run())


def test_entity_anchoring():
    async def run():
        corrector = ASRCorrector()
        raw_transcript = "I miss remember berry today"
        patient_context = {
            "patient_id": "patient_001",
            "family_members": ["Mary", "Priya"]
        }

        mock_llm_json = '{"corrected_transcript": "I miss Mary today", "confidence_score": 0.96, "corrections_made": ["remember berry -> Mary"]}'

        with patch("httpx.AsyncClient.post") as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "candidates": [
                    {
                        "content": {
                            "parts": [{"text": mock_llm_json}]
                        }
                    }
                ]
            }
            mock_post.return_value = mock_response

            result: ASRCorrectionResult = await corrector.correct_transcription(raw_transcript, patient_context)

            assert "Mary" in result.corrected_transcript
            assert result.confidence_score > 0.9

    asyncio.run(run())


def test_fallback_on_api_error():
    async def run():
        corrector = ASRCorrector()
        raw_transcript = "i feel a bit tired today"

        with patch("httpx.AsyncClient.post", side_effect=Exception("API Timeout Connection Error")):
            result: ASRCorrectionResult = await corrector.correct_transcription(raw_transcript)

            # Fallback must return original raw transcript safely without throwing unhandled exception
            assert result.corrected_transcript == raw_transcript
            assert result.confidence_score == 1.0

    asyncio.run(run())
