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


from app.database.dynamodb import dynamodb_service


@router.get("/v1/caretaker/reminders")
async def get_caretaker_reminders(patient_id: str = "patient_001"):
    """
    Retrieves all patient reminders from DynamoDB.
    """
    return dynamodb_service.get_reminders(patient_id)


@router.post("/v1/caretaker/reminders")
async def create_caretaker_reminder(payload: dict):
    """
    Creates or updates patient reminder in DynamoDB.
    """
    patient_id = payload.get("patient_id") or payload.get("user_id", "patient_001")
    saved_item = dynamodb_service.save_reminder(patient_id, payload)
    return {
        "status": "created",
        "id": saved_item.get("id"),
        "reminder": saved_item
    }


@router.put("/v1/caretaker/reminders/{rem_id}/toggle")
async def toggle_caretaker_reminder(rem_id: str, patient_id: str = "patient_001"):
    """
    Toggles completion status of reminder in DynamoDB.
    """
    updated = dynamodb_service.toggle_reminder(patient_id, rem_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"status": "updated", "reminder": updated}


@router.delete("/v1/caretaker/reminders/{rem_id}")
async def delete_caretaker_reminder(rem_id: str, patient_id: str = "patient_001"):
    """
    Deletes reminder from DynamoDB.
    """
    dynamodb_service.delete_reminder(patient_id, rem_id)
    return {"status": "deleted", "id": rem_id}


@router.get("/v1/caretaker/appointments")
async def get_caretaker_appointments(patient_id: str = "patient_001"):
    """
    Retrieves all medical appointments from DynamoDB.
    """
    return dynamodb_service.get_appointments(patient_id)


@router.post("/v1/caretaker/appointments")
async def create_caretaker_appointment(payload: dict):
    """
    Schedules medical appointment in DynamoDB.
    """
    patient_id = payload.get("patient_id") or payload.get("user_id", "patient_001")
    saved_item = dynamodb_service.save_appointment(patient_id, payload)
    return {
        "status": "scheduled",
        "id": saved_item.get("id"),
        "appointment": saved_item
    }


@router.get("/v1/caretaker/memories")
async def get_caretaker_memories(patient_id: str = "patient_001"):
    """
    Retrieves all photo memories from DynamoDB.
    """
    return dynamodb_service.get_memories(patient_id)


@router.post("/v1/caretaker/memories")
async def create_caretaker_memory(payload: dict):
    """
    Creates photo memory album item in DynamoDB.
    """
    patient_id = payload.get("patient_id") or payload.get("user_id", "patient_001")
    saved_item = dynamodb_service.save_memory(patient_id, payload)
    return {
        "status": "created",
        "id": saved_item.get("id"),
        "memory": saved_item
    }



@router.post("/v1/rag/vectors", tags=["RAG Research & DynamoDB Vectors"])
async def store_rag_vector(payload: dict):
    """
    Stores text chunk, vector embeddings array, and metadata in AWS DynamoDB for RAG research.
    """
    user_id = payload.get("user_id") or payload.get("patient_id", "usr_demo_001")
    vector_id = payload.get("vector_id") or f"vec_{int(datetime.utcnow().timestamp() * 1000)}"
    text_chunk = payload.get("text_chunk", "")
    embedding = payload.get("embedding", [0.0] * 1536)
    metadata = payload.get("metadata", {})

    success = dynamodb_service.save_rag_vector(
        user_id=user_id,
        vector_id=vector_id,
        text_chunk=text_chunk,
        embedding=embedding,
        metadata=metadata
    )

    return {
        "status": "stored" if success else "fallback_stored",
        "user_id": user_id,
        "vector_id": vector_id,
        "embedding_dimensions": len(embedding),
        "table": dynamodb_service.table_name,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/v1/rag/vectors/{patient_id}", tags=["RAG Research & DynamoDB Vectors"])
async def get_rag_vectors(patient_id: str):
    """
    Retrieves all RAG vector chunks stored in DynamoDB for a patient for RAG context retrieval.
    """
    vectors = dynamodb_service.get_user_rag_vectors(patient_id)
    return {
        "patient_id": patient_id,
        "count": len(vectors),
        "vectors": vectors
    }


@router.post("/v1/rag/search", tags=["RAG Research & DynamoDB Vectors"])
async def search_rag_context(payload: dict):
    """
    Performs RAG context search matching query against stored vector chunks in DynamoDB.
    """
    query = payload.get("query", "")
    patient_id = payload.get("patient_id") or payload.get("user_id", "patient_001")

    matching_chunks = dynamodb_service.search_rag_vectors(patient_id, query)
    context_text = "\n".join([c.get("text_chunk", "") for c in matching_chunks])

    return {
        "query": query,
        "patient_id": patient_id,
        "matched_chunks_count": len(matching_chunks),
        "context": context_text,
        "chunks": matching_chunks
    }



