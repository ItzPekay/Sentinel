from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel


class AlertPayload(BaseModel):
    trigger_alarm: bool
    alert_level: str
    message: str


class SpeechData(BaseModel):
    transcription: str
    overall_slur_score: float
    classification: str


class SpeechAnalysisResponse(BaseModel):
    status: str
    db_record_id: str
    data: SpeechData
    alert: AlertPayload
    alert_sent: bool = False


class CommandResponse(BaseModel):
    status: str
    user_id: str
    raw_audio_heard: str
    matched_intent: str
    frontend_ui_direction: str
    alert_sent: bool = False
    alert_skipped_reason: str | None = None


class BloodSugarResponse(BaseModel):
    status: str
    patient_id: str
    logged_value: float
    emergency_alert_dispatched: bool
    medical_assessment: str


class DetectionItem(BaseModel):
    box: list[float]
    confidence: float
    class_id: int
    label: str


class PredictionResponse(BaseModel):
    label: str
    confidence: float
    detections: list[DetectionItem]
    source: Literal["upload", "live_frame"]
    db_record_id: str
    created_at: datetime
