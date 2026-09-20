from datetime import datetime, timedelta
from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException, Path, Depends
from app.routers.auth import require_caregiver, require_patient_or_caregiver
from app.models.schemas import (
    LongitudinalDriftRequest,
    DriftAnalysisResponse,
    HistoricalAssessment,
    PatientSummaryResponse,
    ReminiscencePromptRequest,
    ReminiscencePromptResponse,
    CaretakerReminderRequest,
    CommandCenterTipsRequest,
    CommandCenterTipsResponse,
    CommandCenterTipItem,
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
# Caretaker Dashboard & Patient Summary Endpoints (Caregiver Protected)
# ------------------------------------------------------------------

@router.get("/v1/caretaker/patient/{patient_id}/summary", response_model=PatientSummaryResponse, dependencies=[Depends(require_caregiver)])
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


@router.get("/v1/caretaker/reminders", dependencies=[Depends(require_patient_or_caregiver)])
@router.get("/api/reminders", dependencies=[Depends(require_patient_or_caregiver)])
async def get_caretaker_reminders(patient_id: str = "patient_001"):
    """
    Retrieves all patient reminders from DynamoDB.
    """
    return dynamodb_service.get_reminders(patient_id)


@router.post("/v1/caretaker/reminders", dependencies=[Depends(require_patient_or_caregiver)])
@router.post("/api/reminders", dependencies=[Depends(require_patient_or_caregiver)])
async def create_caretaker_reminder(payload: dict):
    """
    Creates or updates patient reminder in DynamoDB.
    """
    patient_id = payload.get("patient_id") or payload.get("user_id", "patient_001") if isinstance(payload, dict) else getattr(payload, "patient_id", "patient_001")
    data = payload.model_dump(exclude_none=True) if hasattr(payload, "model_dump") else payload
    saved_item = dynamodb_service.save_reminder(patient_id, data)
    return {
        "status": "created",
        "id": saved_item.get("id"),
        "reminder": saved_item
    }


@router.put("/v1/caretaker/reminders/{rem_id}/toggle", dependencies=[Depends(require_patient_or_caregiver)])
@router.post("/v1/caretaker/reminders/{rem_id}/toggle", dependencies=[Depends(require_patient_or_caregiver)])
@router.post("/api/reminders/{rem_id}/toggle", dependencies=[Depends(require_patient_or_caregiver)])
async def toggle_caretaker_reminder(rem_id: str, patient_id: str = "patient_001"):
    """
    Toggles completion status of reminder in DynamoDB.
    """
    updated = dynamodb_service.toggle_reminder(patient_id, rem_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"status": "updated", "reminder": updated}


@router.delete("/v1/caretaker/reminders/{rem_id}", dependencies=[Depends(require_patient_or_caregiver)])
@router.post("/v1/caretaker/reminders/{rem_id}/delete", dependencies=[Depends(require_patient_or_caregiver)])
@router.delete("/api/reminders/{rem_id}", dependencies=[Depends(require_patient_or_caregiver)])
@router.post("/api/reminders/{rem_id}/delete", dependencies=[Depends(require_patient_or_caregiver)])
async def delete_caretaker_reminder(rem_id: str, patient_id: str = "patient_001"):
    """
    Deletes reminder from DynamoDB.
    """
    dynamodb_service.delete_reminder(patient_id, rem_id)
    return {"status": "deleted", "id": rem_id, "success": True}


@router.get("/v1/caretaker/appointments", dependencies=[Depends(require_patient_or_caregiver)])
async def get_caretaker_appointments(patient_id: str = "patient_001"):
    """
    Retrieves all medical appointments from DynamoDB.
    """
    return dynamodb_service.get_appointments(patient_id)


@router.post("/v1/caretaker/appointments", dependencies=[Depends(require_patient_or_caregiver)])
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


@router.post("/v1/caretaker/appointments/{apt_id}", dependencies=[Depends(require_patient_or_caregiver)])
@router.put("/v1/caretaker/appointments/{apt_id}", dependencies=[Depends(require_patient_or_caregiver)])
async def update_caretaker_appointment(apt_id: str, payload: dict):
    """
    Updates medical appointment in DynamoDB.
    """
    patient_id = payload.get("patient_id") or payload.get("user_id", "patient_001")
    payload["id"] = apt_id
    saved_item = dynamodb_service.save_appointment(patient_id, payload)
    return {
        "status": "updated",
        "id": apt_id,
        "appointment": saved_item
    }


@router.delete("/v1/caretaker/appointments/{apt_id}", dependencies=[Depends(require_patient_or_caregiver)])
@router.post("/v1/caretaker/appointments/{apt_id}/delete", dependencies=[Depends(require_patient_or_caregiver)])
async def delete_caretaker_appointment(apt_id: str, patient_id: str = "patient_001"):
    """
    Deletes medical appointment from DynamoDB.
    """
    dynamodb_service.delete_appointment(patient_id, apt_id)
    return {"status": "deleted", "id": apt_id, "success": True}


from app.services.vector_store import vector_store


@router.get("/v1/caretaker/memories", dependencies=[Depends(require_patient_or_caregiver)])
@router.get("/api/caregiver/memories", dependencies=[Depends(require_patient_or_caregiver)])
async def get_caretaker_memories(patient_id: str = "patient_001"):
    """
    Retrieves all photo memories from DynamoDB & Vector Store.
    """
    return dynamodb_service.get_memories(patient_id)


@router.post("/v1/caretaker/memories", dependencies=[Depends(require_patient_or_caregiver)])
@router.post("/api/caregiver/memories", dependencies=[Depends(require_patient_or_caregiver)])
async def create_caretaker_memory(payload: dict):
    """
    Ingests photo memory album item with vector embeddings into VectorStore & DynamoDB.
    """
    patient_id = payload.get("patient_id") or payload.get("user_id", "patient_001")
    saved_item = vector_store.add_memory(patient_id, payload)
    return {
        "status": "created",
        "id": saved_item.get("id"),
        "memory": saved_item
    }


@router.delete("/v1/caretaker/memories/{mem_id}", dependencies=[Depends(require_patient_or_caregiver)])
@router.post("/v1/caretaker/memories/{mem_id}/delete", dependencies=[Depends(require_patient_or_caregiver)])
async def delete_caretaker_memory(mem_id: str, patient_id: str = "patient_001"):

    """
    Deletes photo memory item from DynamoDB.
    """
    dynamodb_service.delete_memory(patient_id, mem_id)
    return {"status": "deleted", "id": mem_id, "success": True}


# ------------------------------------------------------------------
# Command Center Quick Tips API
# ------------------------------------------------------------------

@router.post("/api/cognitrace/command-center/tips", response_model=CommandCenterTipsResponse)
async def generate_command_center_tips(payload: CommandCenterTipsRequest):
    """
    Returns brief, actionable, empathetic tips tailored specifically to caregiver-patient relationship dynamics.
    """
    caregiver = payload.caregiver_name or "Caregiver"
    patient = payload.patient_name or "loved one"
    rel = (payload.relation or "Daughter").strip().lower()

    if "daughter" in rel or "son" in rel or "child" in rel:
        greeting = f"Welcome back, {caregiver}. Remember to pause and take a gentle breath today."
        relational_insight = f"As a caring {payload.relation.capitalize()}, balancing support for {patient} with your own rest is vital for lasting strength."
        tips = [
            CommandCenterTipItem(
                id="tip_1",
                category="Emotional Balance",
                title="Gentle Reassurance",
                tip=f"When {patient} feels anxious or confused, softly validate their feelings rather than correcting minor details.",
                badge="Emotional Health",
                theme="teal"
            ),
            CommandCenterTipItem(
                id="tip_2",
                category="Burnout Prevention",
                title="Micro Caregiver Rest",
                tip="Take 5 quiet minutes during afternoon routines for yourself. Your peace helps steady your loved one's day.",
                badge="Self Care",
                theme="purple"
            ),
            CommandCenterTipItem(
                id="tip_3",
                category="Communication",
                title="No-Confrontation Cues",
                tip=f"Use familiar photo prompts or soft background music to guide {patient} through daily transitions.",
                badge="Daily Routine",
                theme="amber"
            )
        ]
    elif "spouse" in rel or "husband" in rel or "wife" in rel or "partner" in rel:
        greeting = f"Hello {caregiver}, honoring your shared journey with {patient} today."
        relational_insight = f"Leveraging your deep shared history and familiar daily rhythms brings comfort and emotional stability to {patient}."
        tips = [
            CommandCenterTipItem(
                id="tip_1",
                category="Memory Anchors",
                title="Shared Routine Cueing",
                tip=f"Anchor daily tasks around morning tea or old favorite melodies you and {patient} both cherish.",
                badge="Spousal Connection",
                theme="teal"
            ),
            CommandCenterTipItem(
                id="tip_2",
                category="Orientation",
                title="Familiar Touchpoints",
                tip="Keep cherished photo albums or memory boxes within easy reach to ease unexpected moments of disorientation.",
                badge="Orientation",
                theme="amber"
            ),
            CommandCenterTipItem(
                id="tip_3",
                category="Pacing",
                title="Gentle Pacing",
                tip="Break complex steps into single, reassuring cues to maintain independence with calm confidence.",
                badge="Pacing",
                theme="purple"
            )
        ]
    else:
        greeting = f"Greetings, {caregiver}. Directing evidence-informed cognitive guidance for {patient}'s care schedule."
        relational_insight = f"Professional observations, routine pacing, and structured orientation maintain peak safety and engagement."
        tips = [
            CommandCenterTipItem(
                id="tip_1",
                category="Cognitive Observation",
                title="Fluency & Pause Tracking",
                tip=f"Monitor speech pause intervals during memory tasks to detect subtle fatigue before frustration occurs.",
                badge="Clinical Marker",
                theme="teal"
            ),
            CommandCenterTipItem(
                id="tip_2",
                category="Pacing",
                title="Structured Task Pacing",
                tip="Space motor and speech exercises evenly across 15-minute blocks with clear visual confirmation steps.",
                badge="Routine Pacing",
                theme="purple"
            ),
            CommandCenterTipItem(
                id="tip_3",
                category="Orientation Cues",
                title="Visual Schedule Sync",
                tip=f"Confirm completed tasks on the Command Center board to reinforce orientation for {patient}.",
                badge="Orientation",
                theme="amber"
            )
        ]

    return CommandCenterTipsResponse(
        greeting=greeting,
        relational_insight=relational_insight,
        quick_tips=tips
    )


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




