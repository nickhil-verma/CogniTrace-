import json
import re
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Request
from app.models.schemas import (
    AcousticFeatures,
    LinguisticFeatures,
    TelemetryData,
    RiskReport,
    AudioTaskTurnResponse,
    TelemetrySyncRequest,
    TelemetrySyncResponse,
    VoiceCommandResponse,
    VoiceUIAction,
    VoiceCommandRequest,
    VoiceAgentResponse,
    TriviaRoundRequest,
    TriviaRoundResponse,
    TriviaSubmissionRequest,
    TriviaSubmissionResponse,
)
from app.services.acoustic_extractor import acoustic_extractor
from app.services.linguistic_extractor import linguistic_extractor
from app.services.risk_engine import risk_engine
from app.services.redis_service import redis_service
from app.guardrails.manager import guardrail_manager
from app.routers.auth import get_current_user_from_token


def _parse_reminder_request(prompt: str) -> tuple[str, str]:
    normalized = re.sub(r"\s+", " ", prompt).strip()
    title = normalized
    prefixes = (
        "set a reminder for me to",
        "set a reminder to",
        "set a reminder for",
        "set reminder to",
        "set reminder for",
        "add a reminder for me to",
        "add a reminder to",
        "add a reminder for",
        "add reminder to",
        "add reminder for",
        "remind me to",
        "remind me for",
        "schedule a reminder to",
        "schedule reminder to",
        "schedule reminder for",
        "don't let me forget to",
        "dont let me forget to",
    )
    for prefix in prefixes:
        if title.lower().startswith(prefix):
            title = title[len(prefix):].strip()
            break

    title = re.sub(
        r"\s+at\s+\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?\s*$",
        "",
        title,
        flags=re.IGNORECASE,
    ).strip()
    title = re.sub(r"^to\s+", "", title, flags=re.IGNORECASE).strip()
    title = title.capitalize() if title else "Medication check"

    time_match = re.search(
        r"\bat\s+(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?)\b",
        normalized,
        flags=re.IGNORECASE,
    )
    scheduled_time = time_match.group(1).replace(".", "").upper() if time_match else "8:00 PM"
    return title, scheduled_time


def _reminder_category(title: str) -> str:
    medication_terms = ("medicine", "medication", "pill", "tablet", "capsule", "dose")
    return "Medication" if any(term in title.lower() for term in medication_terms) else "Daily Routine"


async def _resolve_session_context(request: Request, fallback_patient_id: str = "patient_001"):
    patient_id = fallback_patient_id
    user_context = {
        "role": "patient",
        "name": "Sunita Sharma",
        "patient_name": "Sunita",
        "patient_id": patient_id,
    }

    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return patient_id, user_context

    try:
        current_user = await get_current_user_from_token(auth_header)
        user_context = {
            "role": current_user.role,
            "name": current_user.name,
            "patient_name": current_user.patient_name,
            "patient_id": patient_id,
        }
        if current_user.role.lower() == "patient":
            patient_id = current_user.id
            user_context["patient_id"] = current_user.id
        elif current_user.role.lower() == "caregiver":
            patient_id = current_user.patient_name and fallback_patient_id or fallback_patient_id
            user_context["patient_id"] = fallback_patient_id
    except HTTPException:
        raise

    return patient_id, user_context

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

from app.services.grok_agent import grok_agent


@router.post("/v1/patient/audio-task-turn", response_model=AudioTaskTurnResponse)
async def submit_audio_task_turn(
    request: Request,
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    patient_id: str = Form("patient_001")
):
    """
    Web App & Mobile App endpoint for patient voice interaction turns with Redis rate limiting and LangGraph Grok agent.
    """
    resolved_patient_id, user_context = await _resolve_session_context(request, fallback_patient_id=patient_id)
    p_id = resolved_patient_id or patient_id

    # Rate limiting check (30 minutes sliding window per patient for task completion actions)
    allowed = await redis_service.check_sliding_rate_limit(p_id, "audio_turn", window_seconds=1800, max_requests=10)
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

    # Execute LangGraph Grok Agent State Machine
    agent_response = await grok_agent.run_agent_turn(linguistic.transcript, patient_id=p_id, user_context=user_context)

    # Check emergency keywords guardrail
    guardrail = guardrail_manager.check_emergency_keywords(linguistic.transcript)
    alert = report.risk_tier in ["MCI", "HIGH_RISK"] or guardrail.emergency_detected

    if guardrail.emergency_detected:
        ai_response = f"Emergency Alert Triggered! {guardrail.recommended_action}"
    else:
        ai_response = agent_response.ai_response or (
            f"Thank you. I have analyzed your voice recording. "
            f"Speech clarity and fluency recorded. Risk tier: {report.risk_tier}."
        )

    # Persist voice chat turn into DB for memory references & longitudinal tracking
    try:
        from app.database.dynamodb import dynamodb_service
        dynamodb_service.save_voice_chat(
            patient_id=p_id,
            chat_data={
                "transcript": linguistic.transcript,
                "ai_response": ai_response,
                "risk_tier": report.risk_tier,
                "risk_score": report.composite_score,
                "acoustic_features": acoustic.model_dump() if hasattr(acoustic, "model_dump") else acoustic,
                "linguistic_features": linguistic.model_dump() if hasattr(linguistic, "model_dump") else linguistic,
            }
        )
    except Exception as db_err:
        import logging
        logging.getLogger(__name__).warning(f"Failed to persist voice chat: {db_err}")

    # Create intent & UI action details for AudioTaskTurnResponse
    intent_val = "COMPLETE_REMINDER" if any(k in linguistic.transcript.lower() for k in ["complete", "done", "finished"]) else ("SHOW_MEMORIES" if any(k in linguistic.transcript.lower() for k in ["memories", "photo", "picture", "album"]) else "CREATE_REMINDER")
    modal_val = "VERIFY_COMPLETE" if intent_val == "COMPLETE_REMINDER" else ("MEMORIES_PREVIEW" if intent_val == "SHOW_MEMORIES" else "VERIFY_ADD")
    target_rt = "/memories" if intent_val == "SHOW_MEMORIES" else None

    ui_action_obj = VoiceUIAction(
        open_modal=True,
        modal_type=modal_val,
        target_route=target_rt,
        data={"transcript": linguistic.transcript}
    )

    return AudioTaskTurnResponse(
        transcript=linguistic.transcript,
        aiResponse=ai_response,
        suggestedAction="Review memory album or complete verbal fluency check" if alert else None,
        biomarkerAlert=alert,
        riskTier=report.risk_tier,
        riskScore=report.composite_score,
        acousticFeatures=acoustic,
        linguisticFeatures=linguistic,
        actions=[act.model_dump() for act in agent_response.actions] if agent_response.actions else None,
        executionTimeline=[step.model_dump() for step in agent_response.timeline] if agent_response.timeline else None,
        intent=intent_val,
        action_executed=True,
        speech_response=ai_response,
        ui_action=ui_action_obj
    )


@router.post("/api/voice/command", response_model=VoiceCommandResponse)
@router.post("/v1/voice/command", response_model=VoiceCommandResponse)
@router.post("/api/v1/voice/command", response_model=VoiceCommandResponse)
async def process_voice_command(
    request: Request,
    file: Optional[UploadFile] = File(None),
    transcript: Optional[str] = Form(None),
    text: Optional[str] = Form(None),
    patient_id: Optional[str] = Form("patient_001")
):
    """
    End-to-End Voice Command Execution Pipeline: Audio STT -> Intent Classification -> Direct DB Execution -> Verification UI Payload.
    """
    from app.database.dynamodb import dynamodb_service

    raw_prompt = transcript or text or ""
    resolved_patient_id, user_context = await _resolve_session_context(request, fallback_patient_id=patient_id or "patient_001")
    p_id = resolved_patient_id or (patient_id or "patient_001")

    # Support application/json payload body
    if "application/json" in request.headers.get("content-type", "").lower():
        try:
            body = await request.json()
            raw_prompt = body.get("transcript") or body.get("text") or raw_prompt
            p_id = body.get("patient_id") or p_id
        except Exception:
            pass

    audio_bytes = b""
    if file:
        audio_bytes = await file.read()

    if audio_bytes:
        try:
            linguistic = await linguistic_extractor.extract_features_async(audio_bytes, fallback_text=raw_prompt)
            prompt_text = linguistic.transcript
        except Exception:
            prompt_text = raw_prompt or "Voice command received"
    else:
        prompt_text = raw_prompt or "What should I do next?"

    lower = prompt_text.lower()
    intent = "UNKNOWN"
    action_executed = False
    speech_response = ""
    ui_action_data = {}
    modal_type = "VERIFY_ADD"
    target_route = None

    # Intent 1: COMPLETE_REMINDER
    if any(phrase in lower for phrase in ["complete", "done", "finished", "took pills", "pills done", "mark finished", "mark completed", "took medicine"]):
        intent = "COMPLETE_REMINDER"
        modal_type = "VERIFY_COMPLETE"
        reminders = dynamodb_service.get_reminders(p_id)
        target_rem = next((r for r in reminders if r.get("status") != "Completed"), None)
        if not target_rem and reminders:
            target_rem = reminders[0]

        if target_rem:
            updated = dynamodb_service.toggle_reminder(p_id, target_rem["id"])
            action_executed = True
            rem_title = target_rem.get("title", "Evening Medication")
            speech_response = f"Great job! I have marked '{rem_title}' as completed."
            ui_action_data = {
                "reminder_id": target_rem["id"],
                "title": rem_title,
                "time": target_rem.get("time", "8:00 PM"),
                "status": "Completed"
            }
        else:
            speech_response = "All your reminders for today are already marked completed! Great job!"
            ui_action_data = {"status": "Completed", "title": "Daily Reminders Completed"}

    # Intent 2: CREATE_REMINDER
    elif any(phrase in lower for phrase in ["remind", "add reminder", "don't let me forget", "schedule reminder", "set reminder"]):
        intent = "CREATE_REMINDER"
        modal_type = "VERIFY_ADD"
        parsed_title, parsed_time = _parse_reminder_request(prompt_text)

        new_rem = {
            "title": parsed_title,
            "time": parsed_time,
            "date": "Today",
            "category": _reminder_category(parsed_title),
            "status": "Upcoming",
            "patientName": "Mom",
            "dosageOrDetails": f"Scheduled via Voice Command",
            "recurring": "Daily"
        }
        saved = dynamodb_service.save_reminder(p_id, new_rem)
        action_executed = True
        speech_response = f"I have scheduled a new reminder for '{saved['title']}' at {saved['time']}."
        ui_action_data = {
            "reminder_id": saved["id"],
            "title": saved["title"],
            "time": saved["time"],
            "date": saved["date"],
            "category": saved["category"]
        }

    # Intent 3: SHOW_MEMORIES
    elif any(phrase in lower for phrase in ["memories", "photos", "pictures", "family", "show album", "open album"]):
        intent = "SHOW_MEMORIES"
        modal_type = "MEMORIES_PREVIEW"
        target_route = "/memories"
        memories = dynamodb_service.get_memories(p_id)
        action_executed = True
        speech_response = "Here is your family photo album! Tap anywhere on the preview to open full memories."
        ui_action_data = {
            "album": "Family Memories",
            "count": len(memories),
            "top_memory": memories[0] if memories else None
        }

    else:
        # Fall back to Grok Agent turn with memory questioning
        agent_res = await grok_agent.run_agent_turn(prompt_text, patient_id=p_id, user_context=user_context)
        speech_response = agent_res.ai_response
        intent = "UNKNOWN"
        action_executed = True
        ui_action_data = {"prompt": prompt_text}

    # Persist voice chat turn into DB
    try:
        dynamodb_service.save_voice_chat(
            patient_id=p_id,
            chat_data={
                "transcript": prompt_text,
                "ai_response": speech_response,
                "intent": intent,
                "risk_tier": "NORMAL",
                "risk_score": 0.2,
            }
        )
    except Exception:
        pass

    action_item = {
        "id": f"act_{abs(hash(prompt_text)) % 1000000}",
        "toolType": "complete_reminder" if intent == "COMPLETE_REMINDER" else ("retrieve_memory" if intent == "SHOW_MEMORIES" else "create_reminder"),
        "title": "Task Completed" if intent == "COMPLETE_REMINDER" else ("Family Memories" if intent == "SHOW_MEMORIES" else "New Reminder Scheduled"),
        "description": speech_response,
        "parameters": ui_action_data,
        "modalType": modal_type,
        "targetRoute": target_route,
        "status": "completed"
    }

    return VoiceCommandResponse(
        intent=intent,
        action_executed=action_executed,
        speech_response=speech_response,
        ui_action=VoiceUIAction(
            open_modal=True,
            modal_type=modal_type,
            target_route=target_route,
            data=ui_action_data
        ),
        transcript=prompt_text,
        ai_response=speech_response,
        actions=[action_item],
        executionTimeline=[]
    )


@router.post("/api/voice/chat-turn", response_model=VoiceAgentResponse)
@router.post("/v1/voice/chat-turn", response_model=VoiceAgentResponse)
@router.post("/api/v1/voice/chat-turn", response_model=VoiceAgentResponse)
async def process_voice_chat_turn(
    request: Request,
    payload: Optional[VoiceCommandRequest] = None
):
    """
    Stateful Conversational Voice Agent Endpoint: Handles multi-turn slot filling,
    role-differentiated prompts (PATIENT vs CAREGIVER), direct tool execution, and UI modal instructions.
    """
    from app.database.dynamodb import dynamodb_service
    from app.services.grok_agent import grok_agent

    transcript = ""
    user_role = "PATIENT"
    pending_state: Optional[dict] = None
    patient_id = "patient_001"

    if payload:
        transcript = payload.transcript or ""
        user_role = payload.user_role or "PATIENT"
        pending_state = payload.pending_state
        patient_id = payload.patient_id or "patient_001"
    else:
        try:
            body = await request.json()
            transcript = body.get("transcript", "")
            user_role = body.get("user_role", "PATIENT")
            pending_state = body.get("pending_state")
            patient_id = body.get("patient_id", "patient_001")
        except Exception:
            pass

    resolved_patient_id, user_context = await _resolve_session_context(request, fallback_patient_id=patient_id)
    patient_id = resolved_patient_id or patient_id
    lower = transcript.strip().lower()
    is_caregiver = (user_role == "CAREGIVER")

    action_executed = False
    requires_followup = False
    updated_state: Optional[dict] = None
    speech_response = ""
    modal_type = "VERIFY_ADD"
    target_route = None
    ui_data = {}
    intent = "UNKNOWN"

    # --- 1. MULTI-TURN SLOT FILLING FOR CREATE_REMINDER ---
    # Case A1: Active pending state for CREATE_REMINDER
    if pending_state and pending_state.get("intent") == "CREATE_REMINDER":
        step = pending_state.get("step")
        task_title = pending_state.get("task_title")

        if step == "AWAITING_TITLE":
            # Current turn supplies task title
            task_title = transcript.strip()
            if not task_title or len(task_title) < 2:
                task_title = "Scheduled care activity"

            # Check if time was also mentioned in transcript
            time_match = re.search(r'at (\d{1,2}(?::\d{2})?\s*(?:am|pm)?)', lower)
            if time_match:
                scheduled_time = time_match.group(1).upper()
                new_rem = {
                    "title": task_title.capitalize(),
                    "time": scheduled_time,
                    "date": "Today",
                    "category": _reminder_category(task_title),
                    "status": "Upcoming",
                    "patientName": "Mom",
                    "dosageOrDetails": "Scheduled via Conversational Voice Agent",
                    "recurring": "Daily"
                }
                saved = dynamodb_service.save_reminder(patient_id, new_rem)
                action_executed = True
                requires_followup = False
                updated_state = None
                intent = "CREATE_REMINDER"
                modal_type = "VERIFY_ADD"
                speech_response = f"Got it. Reminder set for {saved['title']} at {saved['time']}." if not is_caregiver else f"Reminder created: {saved['title']} scheduled for {saved['time']}."
                ui_data = {"reminder_id": saved["id"], "title": saved["title"], "time": saved["time"], "date": saved["date"]}
            else:
                requires_followup = True
                action_executed = False
                intent = "CREATE_REMINDER"
                updated_state = {
                    "intent": "CREATE_REMINDER",
                    "task_title": task_title,
                    "scheduled_time": None,
                    "step": "AWAITING_TIME"
                }
                speech_response = f"And what time should I set that for?" if not is_caregiver else f"What time should this reminder for '{task_title}' be set for?"
                ui_data = {"title": task_title, "step": "AWAITING_TIME"}

        elif step == "AWAITING_TIME":
            # Current turn supplies scheduled time
            time_match = re.search(r'(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)', lower)
            scheduled_time = time_match.group(1).upper() if time_match else transcript.strip().upper()
            if not scheduled_time or len(scheduled_time) < 2:
                scheduled_time = "6:00 PM"

            task_title = task_title or "Scheduled task"
            new_rem = {
                "title": task_title.capitalize(),
                "time": scheduled_time,
                "date": "Today",
                "category": _reminder_category(task_title),
                "status": "Upcoming",
                "patientName": "Mom",
                "dosageOrDetails": "Scheduled via Conversational Voice Agent",
                "recurring": "Daily"
            }
            saved = dynamodb_service.save_reminder(patient_id, new_rem)
            action_executed = True
            requires_followup = False
            updated_state = None
            intent = "CREATE_REMINDER"
            modal_type = "VERIFY_ADD"
            speech_response = f"Got it. Reminder set for {saved['title']} at {saved['time']}." if not is_caregiver else f"Reminder created: {saved['title']} scheduled for {saved['time']}."
            ui_data = {"reminder_id": saved["id"], "title": saved["title"], "time": saved["time"], "date": saved["date"]}

    # Case A2: Initial turn for CREATE_REMINDER
    elif any(phrase in lower for phrase in ["remind", "reminder", "don't let me forget", "dont let me forget", "schedule"]):
        parsed_title, parsed_time = _parse_reminder_request(transcript)
        time_match = re.search(r"\bat\s+\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?\b", lower)
        if time_match and len(parsed_title) > 2:
            scheduled_time = parsed_time
            clean_title = parsed_title
            new_rem = {
                "title": clean_title if len(clean_title) > 2 else "Medication check",
                "time": scheduled_time,
                "date": "Today",
                "category": _reminder_category(clean_title),
                "status": "Upcoming",
                "patientName": "Mom",
                "dosageOrDetails": "Scheduled via Conversational Voice Agent",
                "recurring": "Daily"
            }
            saved = dynamodb_service.save_reminder(patient_id, new_rem)
            action_executed = True
            requires_followup = False
            intent = "CREATE_REMINDER"
            modal_type = "VERIFY_ADD"
            speech_response = f"Got it. Reminder set for {saved['title']} at {saved['time']}." if not is_caregiver else f"Reminder created: {saved['title']} scheduled for {saved['time']}."
            ui_data = {"reminder_id": saved["id"], "title": saved["title"], "time": saved["time"], "date": saved["date"]}
        elif len(parsed_title) > 2:
            requires_followup = True
            action_executed = False
            intent = "CREATE_REMINDER"
            updated_state = {
                "intent": "CREATE_REMINDER",
                "task_title": parsed_title.capitalize(),
                "scheduled_time": None,
                "step": "AWAITING_TIME"
            }
            speech_response = f"And what time should I set that for?" if not is_caregiver else f"What time should this reminder for '{parsed_title.capitalize()}' be set for?"
            ui_data = {"title": parsed_title.capitalize(), "step": "AWAITING_TIME"}
        else:
            requires_followup = True
            action_executed = False
            intent = "CREATE_REMINDER"
            updated_state = {
                "intent": "CREATE_REMINDER",
                "task_title": None,
                "scheduled_time": None,
                "step": "AWAITING_TITLE"
            }
            speech_response = "What would you like the reminder for?" if not is_caregiver else "What task would you like to schedule?"
            ui_data = {"step": "AWAITING_TITLE"}

    # --- 2. COMPLETE_REMINDER INTENT ---
    elif any(phrase in lower for phrase in ["complete", "done", "finished", "took pills", "pills done", "mark finished", "mark completed", "took medicine"]):
        intent = "COMPLETE_REMINDER"
        modal_type = "VERIFY_COMPLETE"
        reminders = dynamodb_service.get_reminders(patient_id)
        target_rem = next((r for r in reminders if r.get("status") != "Completed"), None)
        if not target_rem and reminders:
            target_rem = reminders[0]

        if target_rem:
            dynamodb_service.toggle_reminder(patient_id, target_rem["id"])
            action_executed = True
            rem_title = target_rem.get("title", "Evening Medication")
            speech_response = f"Great job! I've marked '{rem_title}' as completed." if not is_caregiver else f"Reminder '{rem_title}' marked as completed."
            ui_data = {"reminder_id": target_rem["id"], "title": rem_title, "status": "Completed"}
        else:
            speech_response = "All your reminders for today are already marked completed!"
            ui_data = {"status": "Completed"}

    # --- 3. SHOW_MEMORIES INTENT ---
    elif any(phrase in lower for phrase in ["memories", "photos", "pictures", "family", "show album", "open album"]):
        intent = "SHOW_MEMORIES"
        modal_type = "MEMORIES_PREVIEW"
        target_route = "/memories"
        memories = dynamodb_service.get_memories(patient_id)
        action_executed = True
        speech_response = "Here is your family photo album! Tap anywhere on the preview card to open full memories." if not is_caregiver else "Opening memory album preview cards."
        ui_data = {"album": "Family Memories", "count": len(memories), "top_memory": memories[0] if memories else None}

    # --- 4. GENERAL CONVERSATION & MEMORY RECALL QUESTIONING ---
    else:
        agent_res = await grok_agent.run_agent_turn(transcript, patient_id=patient_id, user_context=user_context)
        speech_response = agent_res.ai_response
        intent = "UNKNOWN"
        action_executed = True
        ui_data = {"prompt": transcript}

    # Persist voice chat in database
    try:
        dynamodb_service.save_voice_chat(
            patient_id=patient_id,
            chat_data={
                "transcript": transcript,
                "ai_response": speech_response,
                "intent": intent,
                "user_role": user_role,
                "risk_tier": "NORMAL",
                "risk_score": 0.2
            }
        )
    except Exception:
        pass

    action_item = {
        "id": f"act_{abs(hash(transcript)) % 1000000}",
        "toolType": "complete_reminder" if intent == "COMPLETE_REMINDER" else ("retrieve_memory" if intent == "SHOW_MEMORIES" else "create_reminder"),
        "title": "Task Marked Completed" if intent == "COMPLETE_REMINDER" else ("Family Memory Album" if intent == "SHOW_MEMORIES" else "New Reminder Scheduled"),
        "description": speech_response,
        "parameters": ui_data,
        "modalType": modal_type,
        "targetRoute": target_route,
        "status": "completed"
    }

    return VoiceAgentResponse(
        speech_response=speech_response,
        action_executed=action_executed,
        requires_followup=requires_followup,
        updated_state=updated_state,
        ui_action=VoiceUIAction(
            open_modal=True if action_executed else False,
            modal_type=modal_type,
            target_route=target_route,
            data=ui_data
        ),
        transcript=transcript,
        intent=intent,
        actions=[action_item],
        executionTimeline=[]
    )


@router.get("/v1/patient/voice-chats")
@router.get("/api/v1/patient/voice-chats")
async def get_patient_voice_chats(patient_id: str = "patient_001", limit: int = 20):
    """
    Retrieves stored patient voice chat logs from DB for memory reference & performance tracking.
    """
    from app.database.dynamodb import dynamodb_service
    chats = dynamodb_service.get_voice_chats(patient_id, limit=limit)
    return {
        "patient_id": patient_id,
        "count": len(chats),
        "chats": chats
    }



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


# Memory Trivia Game Endpoints
@router.post("/api/games/memory-trivia/round", response_model=TriviaRoundResponse)
@router.post("/v1/patient/reminiscence/trivia-round", response_model=TriviaRoundResponse)
async def get_memory_trivia_round(payload: TriviaRoundRequest = TriviaRoundRequest()):
    """
    RAG-powered Memory Trivia Round Generator.
    Retrieves stored photo memories and vector embeddings, then uses Gemini API to construct warm reminiscence questions.
    """
    from app.services.trivia_service import trivia_service
    return await trivia_service.generate_trivia_round(payload.patient_id)


@router.post("/api/games/memory-trivia/submit", response_model=TriviaSubmissionResponse)
@router.post("/v1/patient/reminiscence/trivia-submit", response_model=TriviaSubmissionResponse)
async def submit_memory_trivia_round(payload: TriviaSubmissionRequest):
    """
    Logs gentle completion metrics for clinical tracking without stress-inducing scores or timers.
    """
    from app.services.trivia_service import trivia_service
    return trivia_service.record_submission(payload)

