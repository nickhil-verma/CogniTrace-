from datetime import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class MemoryIngestionRequest(BaseModel):
    patient_id: str = Field(default="patient_001", description="Unique Patient Identifier")
    title: str = Field(..., description="Title of the family memory or life story")
    narrative: str = Field(..., description="Full story text, life event narrative, or memory description")
    photo_url: Optional[str] = Field(default=None, description="URL of the archival photo")
    date: Optional[str] = Field(default="Recent", description="Historical date or time period")
    location: Optional[str] = Field(default="Home", description="Location where memory occurred")
    people: List[str] = Field(default_factory=list, description="Tagged family members or friends")
    relationship_cues: List[str] = Field(default_factory=list, description="Relationship tags (e.g. Daughter, Husband, Grandchild)")
    tags: List[str] = Field(default_factory=list, description="Category tags")
    reminiscence_prompt: Optional[str] = Field(default=None, description="Therapeutic reminiscence question prompt")


class MemoryRecordResponse(BaseModel):
    id: str
    patient_id: str
    title: str
    narrative: str
    photo_url: str
    date: str
    location: str
    people: List[str]
    relationship_cues: List[str]
    tags: List[str]
    reminiscence_prompt: str
    embedding_dimension: int = 768
    created_at: str


class ReminderIngestionRequest(BaseModel):
    patient_id: str = Field(default="patient_001", description="Unique Patient Identifier")
    title: str = Field(..., description="Activity or medication title")
    due_time: str = Field(..., description="Scheduled time (e.g., 8:00 PM)")
    date: Optional[str] = Field(default="Today", description="Due date")
    category: Optional[str] = Field(default="Medication", description="Category: Medication, Activity, Hydration")
    recurring: Optional[str] = Field(default="Daily", description="Recurrence pattern")
    dosage_or_details: Optional[str] = Field(default=None, description="Additional dosage instructions or task details")


class AppointmentIngestionRequest(BaseModel):
    patient_id: str = Field(default="patient_001", description="Unique Patient Identifier")
    title: str = Field(..., description="Consultation title")
    doctor_name: str = Field(..., description="Specialist doctor name")
    clinic: Optional[str] = Field(default="City Care Hospital", description="Clinic, hospital, or suite location")
    specialty: Optional[str] = Field(default="Cognitive Neurology", description="Medical specialty")
    date: str = Field(..., description="Appointment date")
    time: str = Field(..., description="Appointment time")
    notes: Optional[str] = Field(default=None, description="Clinical notes or preparation instructions")


class MemoryReminiscenceQuery(BaseModel):
    patient_id: str = Field(default="patient_001", description="Patient Identifier")
    query: str = Field(..., description="Search topic, person, or keyword for vector retrieval")
    top_k: int = Field(default=3, ge=1, le=10, description="Top matches count")
