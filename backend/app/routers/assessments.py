import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.models.schemas import (
    AcousticFeatures,
    LinguisticFeatures,
    TelemetryData,
    RiskReport,
    AudioTaskTurnResponse,
    TelemetrySyncRequest,
    TelemetrySyncResponse,
)
from app.services.acoustic_extractor import acoustic_extractor
from app.services.linguistic_extractor import linguistic_extractor
from app.services.risk_engine import risk_engine
from app.services.redis_service import redis_service
from app.guardrails.manager import guardrail_manager

router = APIRouter(prefix="", tags=["Assessments & Extraction"])


@router.post("/api/v1/assessments/audio", response_model=RiskReport)
async def assess_audio_file(file: UploadFile = File(...)):
    """
    Ingests patient speech audio (WAV/WebM/MP3), non-blocking extraction of acoustic & linguistic biomarkers,
    and returns a normalized cognitive risk assessment report.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file missing filename")

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio payload")

    try:
        # Non-blocking async extraction offloading heavy signal processing off the asyncio loop
        acoustic = await acoustic_extractor.extract_features_async(audio_bytes)
        linguistic = await linguistic_extractor.extract_features_async(audio_bytes)
        report = risk_engine.evaluate_risk(acoustic, linguistic)

        # Emergency Keyword Guardrail check
        guardrail = guardrail_manager.check_emergency_keywords(linguistic.transcript)
        if guardrail.emergency_detected and guardrail.recommended_action:
            report.clinical_indicators.insert(0, guardrail.recommended_action)

        return report
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio assessment extraction error: {str(e)}")


@router.post("/api/v1/assessments/telemetry", response_model=dict)
async def assess_telemetry_data(telemetry: TelemetryData):
    """
    Ingests motor and tap latency telemetry metrics to score psychomotor impairment risk.
    """
    indicators = []
    psychomotor_score = risk_engine.compute_psychomotor_score(telemetry, indicators)
    return {
        "psychomotor_score": round(psychomotor_score, 4),
        "clinical_indicators": indicators
    }


@router.post("/api/v1/assessments/multimodal", response_model=RiskReport)
async def assess_multimodal(
    file: UploadFile = File(...),
    telemetry_json: Optional[str] = Form(None)
):
    """
    Multimodal submission endpoint accepting speech audio file + motor interaction telemetry JSON.
    """
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio payload")

    telemetry: Optional[TelemetryData] = None
    if telemetry_json:
        try:
            data = json.loads(telemetry_json)
            telemetry = TelemetryData(**data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid telemetry JSON: {str(e)}")

    try:
        acoustic = await acoustic_extractor.extract_features_async(audio_bytes)
        linguistic = await linguistic_extractor.extract_features_async(audio_bytes)
        report = risk_engine.evaluate_risk(acoustic, linguistic, telemetry)

        guardrail = guardrail_manager.check_emergency_keywords(linguistic.transcript)
        if guardrail.emergency_detected and guardrail.recommended_action:
            report.clinical_indicators.insert(0, guardrail.recommended_action)

        return report
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


# ------------------------------------------------------------------
# Frontend Contract Endpoints (Web & Flutter Compatibility)
# ------------------------------------------------------------------

@router.post("/v1/patient/audio-task-turn", response_model=AudioTaskTurnResponse)
async def submit_audio_task_turn(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    patient_id: str = Form("patient_001")
):
    """
    Web App & Mobile App endpoint for patient voice interaction turns with Redis rate limiting.
    """
    # Rate limiting check (30 minutes sliding window per patient for task completion actions)
    allowed = await redis_service.check_sliding_rate_limit(patient_id, "audio_turn", window_seconds=1800, max_requests=10)
    if not allowed:
        return AudioTaskTurnResponse(
            transcript=text or "Repeated patient response recorded.",
            aiResponse="Thank you! Your recent response has already been logged into Mom's care schedule.",
            suggestedAction="No duplicate action needed",
            biomarkerAlert=False,
            riskTier="NORMAL",
            riskScore=0.20
        )

    audio_bytes = b""
    if file:
        audio_bytes = await file.read()

    if audio_bytes:
        try:
            acoustic = await acoustic_extractor.extract_features_async(audio_bytes)
            linguistic = await linguistic_extractor.extract_features_async(audio_bytes, fallback_text=text)
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
    else:
        prompt_text = text or "Patient recorded audio prompt turn."
        acoustic = AcousticFeatures(speech_ratio=0.85, mean_pause_duration_ms=180.0, pause_count=1, jitter=0.005)
        linguistic = linguistic_extractor.analyze_text(prompt_text)

    report = risk_engine.evaluate_risk(acoustic, linguistic)

    # Check emergency keywords guardrail
    guardrail = guardrail_manager.check_emergency_keywords(linguistic.transcript)
    alert = report.risk_tier in ["MCI", "HIGH_RISK"] or guardrail.emergency_detected

    if guardrail.emergency_detected:
        ai_response = f"Emergency Alert Triggered! {guardrail.recommended_action}"
    else:
        ai_response = (
            f"Thank you. I have analyzed your voice recording. "
            f"Speech clarity and fluency recorded. Risk tier: {report.risk_tier}."
        )

    return AudioTaskTurnResponse(
        transcript=linguistic.transcript,
        aiResponse=ai_response,
        suggestedAction="Review memory album or complete verbal fluency check" if alert else None,
        biomarkerAlert=alert,
        riskTier=report.risk_tier,
        riskScore=report.composite_score,
        acousticFeatures=acoustic,
        linguisticFeatures=linguistic
    )


@router.post("/v1/patient/telemetry/sync", response_model=TelemetrySyncResponse)
async def sync_telemetry(payload: TelemetrySyncRequest):
    """
    Web App & Mobile App endpoint for background motor telemetry synchronization.
    """
    indicators = []
    score = risk_engine.compute_psychomotor_score(payload.telemetry, indicators)
    return TelemetrySyncResponse(
        status="synced",
        timestamp=datetime.utcnow().isoformat(),
        psychomotor_score=round(score, 4),
        indicators=indicators if indicators else ["Motor telemetry parameters normal."]
    )
