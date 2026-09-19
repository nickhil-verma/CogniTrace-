from datetime import datetime, timedelta
from typing import List, Dict
from fastapi import APIRouter, HTTPException, Path
from app.models.schemas import (
    LongitudinalDriftRequest,
    DriftAnalysisResponse,
    HistoricalAssessment,
    PatientSummaryResponse,
    ReminiscencePromptRequest,
    ReminiscencePromptResponse,
    CaretakerReminderRequest,
)
from app.services.longitudinal_tracker import longitudinal_tracker

router = APIRouter(prefix="", tags=["Analytics & Longitudinal Tracking"])


@router.post("/api/v1/analytics/drift", response_model=DriftAnalysisResponse)
async def calculate_cognitive_drift(payload: LongitudinalDriftRequest):
    """
    Accepts historical assessment risk scores and calculates linear trend slope,
    percentage change, and caregiver drift alert over the designated rolling window.
    """
    if not payload.history:
        raise HTTPException(status_code=400, detail="History array cannot be empty")
    return longitudinal_tracker.analyze_drift(payload.history, window_days=payload.window_days)


# ------------------------------------------------------------------
# Caretaker Dashboard & Patient Summary Endpoints
# ------------------------------------------------------------------

@router.get("/v1/caretaker/patient/{patient_id}/summary", response_model=PatientSummaryResponse)
async def get_patient_summary(patient_id: str = Path(..., description="Unique Patient Identifier")):
    """
    Returns aggregated patient summary, longitudinal drift analysis, recent digital biomarkers,
    and upcoming caretaker schedule events.
    """
    now = datetime.utcnow()
    # Generate synthetic 30-day assessment history for demonstration
    history = [
        HistoricalAssessment(timestamp=now - timedelta(days=28), risk_score=0.22),
        HistoricalAssessment(timestamp=now - timedelta(days=21), risk_score=0.25),
        HistoricalAssessment(timestamp=now - timedelta(days=14), risk_score=0.28),
        HistoricalAssessment(timestamp=now - timedelta(days=7), risk_score=0.31),
        HistoricalAssessment(timestamp=now - timedelta(days=1), risk_score=0.34),
    ]

    drift = longitudinal_tracker.analyze_drift(history, window_days=30)

    latest_score = history[-1].risk_score
    risk_tier = "NORMAL" if latest_score < 0.35 else ("MCI" if latest_score < 0.65 else "HIGH_RISK")

    return PatientSummaryResponse(
        patientId=patient_id,
        name="Eleanor Vance",
        age=74,
        riskScore=latest_score,
        riskTier=risk_tier,
        lastAssessment=(now - timedelta(days=1)).strftime("%Y-%m-%d %H:%M"),
        drift30Days=drift.percent_change,
        recentBiomarkers={
            "speech_ratio": 0.72,
            "mean_pause_duration_ms": 380.0,
            "type_token_ratio": 0.58,
            "tap_latency_ms": 210.0,
            "jitter": 0.008
        },
        clinicalIndicators=[
            "Speech ratio slightly decreased over trailing 14 days.",
            "Subtle increase in pause hesitation during picture description task.",
            "Psychomotor tap latencies remain within stable range."
        ],
        reminders=[
            {"id": "r1", "title": "Evening Medication", "time": "20:00", "completed": "false"},
            {"id": "r2", "title": "Verbal Memory Exercise", "time": "14:30", "completed": "true"}
        ],
        appointments=[
            {"id": "a1", "title": "Neurology Follow-up", "date": "2026-10-05", "doctor": "Dr. Sarah Jenkins"}
        ]
    )


@router.post("/v1/patient/reminiscence/prompt", response_model=ReminiscencePromptResponse)
async def generate_reminiscence_prompt(payload: ReminiscencePromptRequest):
    """
    Generates personalized reminiscence conversation prompt based on photo memory description.
    """
    prompt = (
        f"Do you remember this special moment from '{payload.description}'? "
        f"Tell me about who was there with you that day and how you felt."
    )
    return ReminiscencePromptResponse(prompt=prompt)


@router.post("/v1/caretaker/reminders")
async def create_caretaker_reminder(payload: CaretakerReminderRequest):
    """
    Creates or updates patient reminder.
    """
    return {
        "status": "created",
        "id": f"rem_{int(datetime.utcnow().timestamp())}",
        "reminder": payload.model_dump(exclude_none=True)
    }


@router.post("/v1/caretaker/appointments")
async def create_caretaker_appointment(payload: dict):
    """
    Schedules medical appointment.
    """
    return {
        "status": "scheduled",
        "id": f"apt_{int(datetime.utcnow().timestamp())}",
        "appointment": payload
    }

