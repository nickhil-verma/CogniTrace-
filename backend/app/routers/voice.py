import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Query

from app.models.voice_chat import (
    CaregiverVoiceTurnRequest,
    PatientVoiceTurnRequest,
    VoiceAgentTurnResponse,
    CaregiverChatHistoryItem,
    PatientChatHistoryItem
)
from app.services.caregiver_agent import caregiver_voice_agent
from app.services.patient_agent import patient_voice_agent
from app.database.dynamodb import dynamodb_service

logger = logging.getLogger("cognitrace.voice_router")

router = APIRouter(prefix="/api/voice", tags=["Bifurcated AI Voice Agents"])


@router.post("/caregiver/chat-turn", response_model=VoiceAgentTurnResponse)
async def caregiver_voice_chat_turn(req: CaregiverVoiceTurnRequest):
    """
    Caregiver Voice Turn Endpoint.
    Uses Executive Clinical Coordinator persona, caregiver scheduling/status tools,
    and isolates history into caregiver_chat_history.
    """
    try:
        response = await caregiver_voice_agent.process_turn(
            transcript=req.transcript,
            caregiver_id=req.caregiver_id,
            patient_id=req.patient_id
        )
        return response
    except Exception as e:
        logger.error(f"Error in caregiver voice turn: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Caregiver voice agent execution failed: {str(e)}"
        )


@router.post("/patient/chat-turn", response_model=VoiceAgentTurnResponse)
async def patient_voice_chat_turn(req: PatientVoiceTurnRequest):
    """
    Patient Voice Turn Endpoint.
    Uses Gentle Validation Companion persona (Naomi Feil Validation Therapy),
    patient-safe tools, and isolates history into patient_chat_history.
    """
    try:
        response = await patient_voice_agent.process_turn(
            transcript=req.transcript,
            patient_id=req.patient_id
        )
        return response
    except Exception as e:
        logger.error(f"Error in patient voice turn: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Patient voice agent execution failed: {str(e)}"
        )


@router.get("/caregiver/chat-history")
async def get_caregiver_history(caregiver_id: str = Query("usr_demo_001"), limit: int = Query(20)):
    """
    Fetches dialogue history strictly from caregiver_chat_history.
    """
    history = dynamodb_service.get_caregiver_chat_history(caregiver_id, limit=limit)
    return {"caregiver_id": caregiver_id, "history": history}


@router.get("/patient/chat-history")
async def get_patient_history(patient_id: str = Query("patient_001"), limit: int = Query(20)):
    """
    Fetches dialogue history strictly from patient_chat_history.
    """
    history = dynamodb_service.get_patient_chat_history(patient_id, limit=limit)
    return {"patient_id": patient_id, "history": history}


@router.post("/chat-turn", response_model=VoiceAgentTurnResponse)
async def legacy_unified_voice_chat_turn(
    transcript: str,
    user_role: str = Query("patient"),
    patient_id: str = Query("patient_001"),
    caregiver_id: str = Query("usr_demo_001")
):
    """
    Unified Voice Endpoint routing based on user_role ('caregiver' vs 'patient').
    """
    if user_role.lower() == "caregiver":
        return await caregiver_voice_agent.process_turn(
            transcript=transcript,
            caregiver_id=caregiver_id,
            patient_id=patient_id
        )
    else:
        return await patient_voice_agent.process_turn(
            transcript=transcript,
            patient_id=patient_id
        )
