from datetime import datetime
from typing import List, Dict, Optional, Literal, Any
from pydantic import BaseModel, Field


class CaregiverChatHistoryItem(BaseModel):
    id: str = Field(..., description="Unique dialogue message ID")
    caregiver_id: str = Field(default="usr_demo_001", description="Caregiver User Identifier")
    patient_id: str = Field(default="patient_001", description="Associated Patient Identifier")
    role: Literal["user", "model", "assistant"] = Field(..., description="Speaker role")
    message_text: str = Field(..., description="Utterance text")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    tool_invocations: List[Dict[str, Any]] = Field(default_factory=list, description="Caregiver tools executed during turn")


class PatientChatHistoryItem(BaseModel):
    id: str = Field(..., description="Unique dialogue message ID")
    patient_id: str = Field(default="patient_001", description="Patient Identifier")
    role: Literal["user", "model", "assistant"] = Field(..., description="Speaker role")
    message_text: str = Field(..., description="Utterance text")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    sentiment_flag: str = Field(default="CALM", description="Detected sentiment: CALM, ANXIOUS, CONFUSED, HAPPY")
    grounding_cue_used: Optional[str] = Field(default=None, description="Memory vector or reminiscence cue applied")


class CaregiverVoiceTurnRequest(BaseModel):
    transcript: str = Field(..., description="Caregiver spoken prompt or text input")
    caregiver_id: str = Field(default="usr_demo_001", description="Caregiver User Identifier")
    patient_id: str = Field(default="patient_001", description="Associated Patient Identifier")
    conversation_history: Optional[List[Dict[str, Any]]] = Field(default=None, description="Client session history override")


class PatientVoiceTurnRequest(BaseModel):
    transcript: str = Field(..., description="Patient spoken prompt or text input")
    patient_id: str = Field(default="patient_001", description="Patient Identifier")
    conversation_history: Optional[List[Dict[str, Any]]] = Field(default=None, description="Client session history override")


class VoiceAgentTurnResponse(BaseModel):
    transcript: str
    speech_response: str
    agent_type: Literal["caregiver", "patient"]
    actions: List[Dict[str, Any]] = []
    ui_modal: Optional[str] = None  # 'VERIFY_ADD', 'VERIFY_COMPLETE', 'VERIFY_ACTION', 'MEMORIES_PREVIEW'
    target_route: Optional[str] = None
    patient_status_summary: Optional[Dict[str, Any]] = None
    retrieved_memory: Optional[Dict[str, Any]] = None
