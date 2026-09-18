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

client = TestClient(app)


def generate_synthetic_audio(duration_s: float = 3.0, sample_rate: int = 16000, add_silence: bool = True) -> bytes:
    """
    Generates synthetic WAV audio bytes consisting of 440 Hz sine wave tone interspersed with silence.
    """
    num_samples = int(duration_s * sample_rate)
    t = np.linspace(0, duration_s, num_samples, endpoint=False)
    # 440 Hz sine wave
    audio_signal = 0.5 * np.sin(2 * np.pi * 440 * t)

    if add_silence:
        # Zero out middle segment to simulate hesitation pause (>500ms)
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
    assert features.repetitions >= 1  # "album album"
    assert features.hesitation_markers >= 2  # "um", "uh"


def test_risk_engine_tiers():
    # Normal risk case
    normal_acoustic = AcousticFeatures(speech_ratio=0.85, mean_pause_duration_ms=180.0, pause_count=1, jitter=0.003)
    normal_lexical = LinguisticFeatures(type_token_ratio=0.75, repetitions=0, hesitation_markers=0, transcript="Clear speech")
    normal_telemetry = TelemetryData(tap_latencies_ms=[180.0, 195.0, 190.0], reaction_times_ms=[280.0], error_rate=0.02)

    normal_report = risk_engine.evaluate_risk(normal_acoustic, normal_lexical, normal_telemetry)
    assert normal_report.risk_tier == "NORMAL"
    assert normal_report.composite_score < 0.35

    # High risk case
    high_acoustic = AcousticFeatures(speech_ratio=0.35, mean_pause_duration_ms=950.0, pause_count=8, jitter=0.035)
    high_lexical = LinguisticFeatures(type_token_ratio=0.30, repetitions=5, hesitation_markers=6, transcript="um um bad speech")
    high_telemetry = TelemetryData(tap_latencies_ms=[480.0, 520.0, 610.0], reaction_times_ms=[750.0], error_rate=0.35)

    high_report = risk_engine.evaluate_risk(high_acoustic, high_lexical, high_telemetry)
    assert high_report.risk_tier == "HIGH_RISK"
    assert high_report.composite_score >= 0.65
    assert len(high_report.clinical_indicators) > 0


def test_longitudinal_tracker_drift():
    now = datetime.utcnow()

    # Stable trajectory
    stable_history = [
        HistoricalAssessment(timestamp=now - timedelta(days=20), risk_score=0.20),
        HistoricalAssessment(timestamp=now - timedelta(days=10), risk_score=0.21),
        HistoricalAssessment(timestamp=now - timedelta(days=1), risk_score=0.20),
    ]
    stable_drift = longitudinal_tracker.analyze_drift(stable_history, window_days=30)
    assert stable_drift.drift_detected is False

    # Rapidly worsening trajectory (> 20% deterioration)
    decline_history = [
        HistoricalAssessment(timestamp=now - timedelta(days=25), risk_score=0.25),
        HistoricalAssessment(timestamp=now - timedelta(days=15), risk_score=0.38),
        HistoricalAssessment(timestamp=now - timedelta(days=5), risk_score=0.55),
        HistoricalAssessment(timestamp=now, risk_score=0.68),
    ]
    decline_drift = longitudinal_tracker.analyze_drift(decline_history, window_days=30)
    assert decline_drift.drift_detected is True
    assert decline_drift.percent_change > 20.0
    assert decline_drift.alert_message is not None


# ------------------------------------------------------------------
# FastAPI API Integration Tests
# ------------------------------------------------------------------

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


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
    assert "clinical_indicators" in data


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
    assert "riskTier" in data


def test_patient_summary_frontend_contract():
    response = client.get("/v1/caretaker/patient/patient_001/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["patientId"] == "patient_001"
    assert "drift30Days" in data
    assert "recentBiomarkers" in data


def test_auth_login_signup_endpoints():
    # Test Signup
    signup_payload = {
        "name": "Sarah Connor",
        "email": "sarah.connor@example.com",
        "password": "securepassword123",
        "patient_name": "Father (John)",
        "relationship": "Father",
        "stage": "Early Stage"
    }
    signup_res = client.post("/v1/auth/signup", json=signup_payload)
    assert signup_res.status_code == 200
    signup_data = signup_res.json()
    assert "access_token" in signup_data
    assert signup_data["user"]["email"] == "sarah.connor@example.com"

    # Test Login
    login_payload = {
        "email": "sarah.connor@example.com",
        "password": "securepassword123"
    }
    login_res = client.post("/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["name"] == "Sarah Connor"

    # Test Get Me
    token = login_data["access_token"]
    me_res = client.get("/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "sarah.connor@example.com"

