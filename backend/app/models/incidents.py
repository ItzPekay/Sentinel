from enum import Enum
from pydantic import BaseModel, Field


class Severity(str, Enum):
    NONE = "none"
    MINOR = "minor"
    MODERATE = "moderate"
    SEVERE = "severe"
    CRITICAL = "critical"


class VoiceCommands(str, Enum):
    CONTACT_FAMILY = "Contact family"
    CHECK_BLOOD_SUGAR = "Check blood sugar"


class StrokeIncident(BaseModel):
    severity: Severity
    caused_by_bg: bool
    age: int = Field(gt=0, lt=150)
    blood_sugar: float = Field(ge=70, le=800)
    confidence: float = Field(gt=0)
