from datetime import datetime
from typing import List, Dict, Optional, Literal, Any
from pydantic import BaseModel, Field


# Motor & Interaction Telemetry Input Schema
class TelemetryData(BaseModel):
    tap_latencies_ms: List[float] = Field(default_factory=list, description="Array of tap latency durations in milliseconds")
    reaction_times_ms: List[float] = Field(default_factory=list, description="Array of visual/auditory reaction times in milliseconds")
    error_rate: float = Field(default=0.0, ge=0.0, le=1.0, description="Proportion of mis-taps or incorrect task interactions")
    session_duration_s: float = Field(default=0.0, ge=0.0, description="Total interactive session duration in seconds")


# Acoustic Signal Features Schema
class AcousticFeatures(BaseModel):
    speech_ratio: float = Field(..., description="Ratio of voiced speech time to total audio length [0.0 - 1.0]")
    mean_pause_duration_ms: float = Field(..., description="Average duration of pause intervals >250ms in milliseconds")
    pause_count: int = Field(..., description="Total count of significant speech hesitation pauses")
    jitter: float = Field(..., description="Pitch F0 perturbation / variance metric")


# Linguistic NLP Features Schema
class LinguisticFeatures(BaseModel):
    type_token_ratio: float = Field(..., description="Type-Token Ratio (unique words / total words)")
    repetitions: int = Field(..., description="Count of immediate consecutive word repetitions")
    hesitation_markers: int = Field(..., description="Count of filler words ('um', 'uh', 'ah')")
    transcript: str = Field(..., description="ASR speech transcription text")


# Risk Assessment Report Output Schema
class RiskReport(BaseModel):
    composite_score: float = Field(..., ge=0.0, le=1.0, description="Normalized composite risk score [0.0 - 1.0]")
    risk_tier: Literal["NORMAL", "MCI", "HIGH_RISK"] = Field(..., description="Risk tier threshold classification")
    clinical_indicators: List[str] = Field(default_factory=list, description="Explainable clinical indicator notes")
    breakdown: Dict[str, float] = Field(..., description="Sub-scores: acoustic, lexical, psychomotor")


# Historical Assessment Data Point for Longitudinal Analysis
class HistoricalAssessment(BaseModel):
    timestamp: datetime = Field(..., description="Timestamp of assessment session")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Composite risk score at time of assessment")


# Request schema for longitudinal drift analysis
class LongitudinalDriftRequest(BaseModel):
    history: List[HistoricalAssessment] = Field(..., description="List of historical assessment data points")
    window_days: int = Field(default=30, ge=1, description="Rolling analysis window in days")


# Drift Analysis Output Schema
class DriftAnalysisResponse(BaseModel):
    window_days: int = Field(..., description="Rolling analysis window in days")
    slope: float = Field(..., description="Linear regression trend slope per day")
    percent_change: float = Field(..., description="Percentage change over the 30-day window")
    drift_detected: bool = Field(..., description="True if cognitive deterioration exceeds 20% threshold")
    alert_message: Optional[str] = Field(None, description="Caregiver alert notification message")


# Multimodal Ingestion Payload
class MultimodalAssessmentRequest(BaseModel):
    patient_id: str = Field(default="patient_001")
    telemetry: Optional[TelemetryData] = None


class VoiceUIAction(BaseModel):
    open_modal: bool = True
    modal_type: Literal["VERIFY_COMPLETE", "VERIFY_ADD", "MEMORIES_PREVIEW"] = "VERIFY_COMPLETE"
    target_route: Optional[str] = None
    data: Dict[str, Any] = Field(default_factory=dict)


class VoiceCommandResponse(BaseModel):
    intent: Literal["COMPLETE_REMINDER", "CREATE_REMINDER", "SHOW_MEMORIES", "UNKNOWN"] = "UNKNOWN"
    action_executed: bool = True
    speech_response: str
    ui_action: VoiceUIAction
    transcript: str = ""
    ai_response: Optional[str] = None
    actions: Optional[List[Dict[str, Any]]] = None
    executionTimeline: Optional[List[Dict[str, Any]]] = None


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class SlotFillingState(BaseModel):
    intent: Optional[str] = None
    task_title: Optional[str] = None
    scheduled_time: Optional[str] = None
    step: Optional[str] = None


class VoiceCommandRequest(BaseModel):
    transcript: str = ""
    user_role: Literal["PATIENT", "CAREGIVER"] = "PATIENT"
    conversation_history: List[ConversationMessage] = Field(default_factory=list)
    pending_state: Optional[Dict[str, Any]] = None
    patient_id: str = "patient_001"


class VoiceAgentResponse(BaseModel):
    speech_response: str
    action_executed: bool = False
    requires_followup: bool = False
    updated_state: Optional[Dict[str, Any]] = None
    ui_action: VoiceUIAction
    transcript: str = ""
    intent: Optional[str] = None
    actions: Optional[List[Dict[str, Any]]] = None
    executionTimeline: Optional[List[Dict[str, Any]]] = None


class AudioTaskTurnResponse(BaseModel):
    transcript: str
    aiResponse: str
    suggestedAction: Optional[str] = None
    biomarkerAlert: bool = False
    riskTier: Literal["NORMAL", "MCI", "HIGH_RISK"] = "NORMAL"
    riskScore: float = 0.0
    acousticFeatures: Optional[AcousticFeatures] = None
    linguisticFeatures: Optional[LinguisticFeatures] = None
    actions: Optional[List[Dict[str, Any]]] = None
    executionTimeline: Optional[List[Dict[str, Any]]] = None
    intent: Optional[str] = None
    action_executed: Optional[bool] = None
    speech_response: Optional[str] = None
    ui_action: Optional[VoiceUIAction] = None


class TelemetrySyncRequest(BaseModel):
    patient_id: str = "patient_001"
    telemetry: TelemetryData


class TelemetrySyncResponse(BaseModel):
    status: str = "synced"
    timestamp: str
    psychomotor_score: float
    indicators: List[str]


class CaretakerReminderRequest(BaseModel):
    title: str
    time: Optional[str] = None
    category: Optional[str] = None
    patientId: str


class ReminiscencePromptRequest(BaseModel):
    memory_id: str
    description: str


class ReminiscencePromptResponse(BaseModel):
    prompt: str


class PatientSummaryResponse(BaseModel):
    patientId: str
    name: str
    age: int
    riskScore: float
    riskTier: Literal["NORMAL", "MCI", "HIGH_RISK"]
    lastAssessment: str
    drift30Days: float
    recentBiomarkers: Dict[str, float]
    clinicalIndicators: List[str]
    reminders: List[Dict[str, str]]
    appointments: List[Dict[str, str]]


# Authentication Schemas
class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "caregiver"


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    patient_name: str = "Mom"
    relationship: str = "Mother"
    stage: str = "Middle Stage"


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str = "caregiver"
    patient_name: str = "Mom"
    relationship: str = "Mother"
    stage: str = "Middle Stage"


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile



class CaretakerReminderRequest(BaseModel):
    id: Optional[str] = None
    title: str = "Care Task"
    time: str = "8:00 PM"
    date: Optional[str] = "Today"
    category: Optional[str] = "General"
    status: Optional[str] = "Upcoming"
    patientName: Optional[str] = "Mom"
    dosageOrDetails: Optional[str] = ""
    recurring: Optional[str] = "Daily"
    patient_id: Optional[str] = "patient_001"
    user_id: Optional[str] = None


class CommandCenterTipsRequest(BaseModel):
    patient_name: str = "Sunita"
    caregiver_name: str = "Priya"
    relation: str = "Daughter"
    cognitive_stage_or_notes: Optional[str] = "Middle Stage"


class CommandCenterTipItem(BaseModel):
    id: str
    category: str
    title: str
    tip: str
    badge: str = "Caregiver Tip"
    theme: str = "teal"


class CommandCenterTipsResponse(BaseModel):
    greeting: str
    relational_insight: str
    quick_tips: List[CommandCenterTipItem] = []


# Memory Trivia Game Schemas
class TriviaRoundRequest(BaseModel):
    patient_id: str = "patient_001"
    topic: Optional[str] = None


class TriviaRoundResponse(BaseModel):
    round_id: str
    memory_id: str
    image_url: str
    title: str
    date: str
    location: str
    question: str
    options: List[str]
    correct_index: int
    gentle_hint: str
    encouragement_fact: str


class TriviaSubmissionRequest(BaseModel):
    patient_id: str = "patient_001"
    round_id: str
    selected_index: int
    is_correct: bool
    duration_s: float = 0.0


class TriviaSubmissionResponse(BaseModel):
    status: str = "success"
    is_correct: bool
    encouragement_fact: str
    message: str



