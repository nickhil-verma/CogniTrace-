import io
import pytest
import numpy as np
import soundfile as sf
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.models.schemas import (
    AcousticFeatures,
    LinguisticFeatures,
    TelemetryData,
    HistoricalAssessment,
)
from app.services.acoustic_extractor import acoustic_extractor
from app.services.linguistic_extractor import linguistic_extractor
from app.services.risk_engine import risk_engine
from app.services.longitudinal_tracker import longitudinal_tracker
from app.services.redis_service import redis_service
from app.guardrails.manager import guardrail_manager
from app.services.storage.local_storage import LocalStorageProvider

client = TestClient(app)


def generate_synthetic_audio(duration_s: float = 3.0, sample_rate: int = 16000, add_silence: bool = True) -> bytes:
    num_samples = int(duration_s * sample_rate)
    t = np.linspace(0, duration_s, num_samples, endpoint=False)
    audio_signal = 0.5 * np.sin(2 * np.pi * 440 * t)

    if add_silence:
        mid_start = int(1.0 * sample_rate)
        mid_end = int(1.8 * sample_rate)
        audio_signal[mid_start:mid_end] = 0.0

    buffer = io.BytesIO()
    sf.write(buffer, audio_signal, sample_rate, format='WAV')
    return buffer.getvalue()


# ------------------------------------------------------------------
# Service Unit Tests
# ------------------------------------------------------------------

def test_acoustic_extractor():
    audio_bytes = generate_synthetic_audio(duration_s=3.0, add_silence=True)
    features = acoustic_extractor.extract_features(audio_bytes)

    assert isinstance(features, AcousticFeatures)
    assert 0.0 <= features.speech_ratio <= 1.0
    assert features.pause_count >= 1
    assert features.mean_pause_duration_ms > 250.0


def test_linguistic_extractor_analysis():
    sample_text = "the patient um spoke about the memory album album with uh deep clarity"
    features = linguistic_extractor.analyze_text(sample_text)

    assert isinstance(features, LinguisticFeatures)
    assert 0.0 < features.type_token_ratio <= 1.0
    assert features.repetitions >= 1
    assert features.hesitation_markers >= 2


def test_risk_engine_tiers():
    normal_acoustic = AcousticFeatures(speech_ratio=0.85, mean_pause_duration_ms=180.0, pause_count=1, jitter=0.003)
    normal_lexical = LinguisticFeatures(type_token_ratio=0.75, repetitions=0, hesitation_markers=0, transcript="Clear speech")
    normal_telemetry = TelemetryData(tap_latencies_ms=[180.0, 195.0, 190.0], reaction_times_ms=[280.0], error_rate=0.02)

    normal_report = risk_engine.evaluate_risk(normal_acoustic, normal_lexical, normal_telemetry)
    assert normal_report.risk_tier == "NORMAL"
    assert normal_report.composite_score < 0.35

    high_acoustic = AcousticFeatures(speech_ratio=0.35, mean_pause_duration_ms=950.0, pause_count=8, jitter=0.035)
    high_lexical = LinguisticFeatures(type_token_ratio=0.30, repetitions=5, hesitation_markers=6, transcript="um um bad speech")
    high_telemetry = TelemetryData(tap_latencies_ms=[480.0, 520.0, 610.0], reaction_times_ms=[750.0], error_rate=0.35)

    high_report = risk_engine.evaluate_risk(high_acoustic, high_lexical, high_telemetry)
    assert high_report.risk_tier == "HIGH_RISK"
    assert high_report.composite_score >= 0.65


def test_longitudinal_tracker_drift():
    now = datetime.utcnow()
    stable_history = [
        HistoricalAssessment(timestamp=now - timedelta(days=20), risk_score=0.20),
        HistoricalAssessment(timestamp=now - timedelta(days=10), risk_score=0.21),
        HistoricalAssessment(timestamp=now - timedelta(days=1), risk_score=0.20),
    ]
    stable_drift = longitudinal_tracker.analyze_drift(stable_history, window_days=30)
    assert stable_drift.drift_detected is False

    decline_history = [
        HistoricalAssessment(timestamp=now - timedelta(days=25), risk_score=0.25),
        HistoricalAssessment(timestamp=now - timedelta(days=15), risk_score=0.38),
        HistoricalAssessment(timestamp=now - timedelta(days=5), risk_score=0.55),
        HistoricalAssessment(timestamp=now, risk_score=0.68),
    ]
    decline_drift = longitudinal_tracker.analyze_drift(decline_history, window_days=30)
    assert decline_drift.drift_detected is True
    assert decline_drift.percent_change > 20.0


def test_emergency_keyword_guardrails():
    sample_emergency_text = "I fell on the floor and have chest pain help me"
    res = guardrail_manager.check_emergency_keywords(sample_emergency_text)
    assert res.emergency_detected is True
    assert "fell" in res.matched_keywords or "chest pain" in res.matched_keywords
    assert res.latency_ms < 20.0  # <2ms latency target


@pytest.mark.anyio
async def test_redis_service_locking_and_rate_limiting():
    lock_token = await redis_service.acquire_lock("test_resource_key", ttl_seconds=2)
    assert lock_token is not None

    # Second lock attempt should fail
    duplicate_lock = await redis_service.acquire_lock("test_resource_key", ttl_seconds=2)
    assert duplicate_lock is None

    # Release lock
    released = await redis_service.release_lock("test_resource_key", lock_token)
    assert released is True

    # Rate limiting test
    user_id = "test_user_99"
    allowed1 = await redis_service.check_sliding_rate_limit(user_id, "test_action", window_seconds=60, max_requests=1)
    assert allowed1 is True

    allowed2 = await redis_service.check_sliding_rate_limit(user_id, "test_action", window_seconds=60, max_requests=1)
    assert allowed2 is False


@pytest.mark.anyio
async def test_storage_provider_adapter(tmp_path):
    storage = LocalStorageProvider(base_dir=str(tmp_path))
    filename = "test_sample.wav"
    test_bytes = b"RIFF_TEST_AUDIO_BYTES"

    saved_key = await storage.save_file(test_bytes, filename)
    assert saved_key == filename

    read_bytes = await storage.read_file(saved_key)
    assert read_bytes == test_bytes


# ------------------------------------------------------------------
# FastAPI API Integration Tests
# ------------------------------------------------------------------

def test_health_check_probes():
    # Liveness probe
    live_res = client.get("/health/live")
    assert live_res.status_code == 200
    assert live_res.json()["status"] == "alive"

    # Readiness probe
    ready_res = client.get("/health/ready")
    assert ready_res.status_code == 200
    assert "status" in ready_res.json()


def test_audio_assessment_route():
    audio_bytes = generate_synthetic_audio()
    response = client.post(
        "/api/v1/assessments/audio",
        files={"file": ("test.wav", audio_bytes, "audio/wav")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "composite_score" in data
    assert "risk_tier" in data


def test_telemetry_assessment_route():
    payload = {
        "tap_latencies_ms": [210.0, 225.0, 215.0],
        "reaction_times_ms": [340.0],
        "error_rate": 0.05,
        "session_duration_s": 45.0
    }
    response = client.post("/api/v1/assessments/telemetry", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "psychomotor_score" in data


def test_audio_task_turn_frontend_contract():
    audio_bytes = generate_synthetic_audio()
    response = client.post(
        "/v1/patient/audio-task-turn",
        files={"file": ("turn.wav", audio_bytes, "audio/wav")},
        data={"text": "Hello CogniTrace assistant"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "transcript" in data
    assert "aiResponse" in data


def test_auth_login_signup_endpoints():
    signup_payload = {
        "name": "Sarah Connor",
        "email": "sarah.connor.upgraded@example.com",
        "password": "securepassword123",
        "patient_name": "Father (John)",
        "relationship": "Father",
        "stage": "Early Stage"
    }
    signup_res = client.post("/v1/auth/signup", json=signup_payload)
    assert signup_res.status_code == 200
    signup_data = signup_res.json()
    assert "access_token" in signup_data

    login_payload = {
        "email": "sarah.connor.upgraded@example.com",
        "password": "securepassword123"
    }
    login_res = client.post("/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data


def test_auth_rejects_invalid_password():
    payload = {
        "email": "priya.caregiver@example.com",
        "password": "wrong-password"
    }
    response = client.post("/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_dynamodb_rag_vector_storage():
    rag_payload = {
        "user_id": "usr_test_rag_001",
        "vector_id": "vec_test_1001",
        "text_chunk": "Patient remembers ocean sunset view in Goa.",
        "embedding": [0.1, 0.2, 0.3, 0.4, 0.5],
        "metadata": {"topic": "Goa Vacation", "source": "Audio Transcript"}
    }
    store_res = client.post("/v1/rag/vectors", json=rag_payload)
    assert store_res.status_code == 200
    store_data = store_res.json()
    assert store_data["status"] in ["stored", "fallback_stored"]
    assert store_data["vector_id"] == "vec_test_1001"

    get_res = client.get("/v1/rag/vectors/usr_test_rag_001")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["count"] >= 1
    assert get_data["patient_id"] == "usr_test_rag_001"

