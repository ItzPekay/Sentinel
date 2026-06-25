import pytest
from pydantic import ValidationError
from app.models.user import (
    UserCreate, UserLogin, UserOut, UserProfileUpdate,
    TokenResponse, PendingTwoFAResponse, OTPVerifyRequest, TokenData,
)
from app.models.response import (
    AlertPayload, SpeechData, SpeechAnalysisResponse,
    CommandResponse, BloodSugarResponse, PredictionResponse, DetectionItem,
)
from app.models.incidents import StrokeIncident, Severity


def test_user_create_rejects_invalid_email():
    with pytest.raises(ValidationError):
        UserCreate(email="not-an-email", name="Alice", password="pass12345")


def test_user_create_rejects_short_password():
    with pytest.raises(ValidationError):
        UserCreate(email="a@b.com", name="Alice", password="short")


def test_user_create_valid():
    u = UserCreate(email="a@b.com", name="Alice", password="longenough")
    assert u.email == "a@b.com"


def test_user_out_optional_emergency_contact():
    u = UserOut(user_id="uid", email="a@b.com", name="Alice")
    assert u.emergency_contact_email is None


def test_user_out_with_emergency_contact():
    u = UserOut(user_id="uid", email="a@b.com", name="Alice", emergency_contact_email="e@g.com")
    assert u.emergency_contact_email == "e@g.com"


def test_pending_2fa_response():
    r = PendingTwoFAResponse(partial_token="tok")
    assert r.pending_2fa is True
    assert r.partial_token == "tok"


def test_otp_verify_request():
    r = OTPVerifyRequest(partial_token="tok", otp_code="123456")
    assert r.otp_code == "123456"


def test_token_response_default_type():
    t = TokenResponse(access_token="tok")
    assert t.token_type == "bearer"


def test_token_data_valid():
    td = TokenData(user_id="uid", email="a@b.com")
    assert td.user_id == "uid"


def test_user_profile_update_all_optional():
    u = UserProfileUpdate()
    assert u.name is None
    assert u.emergency_contact_email is None


def test_speech_analysis_response_shape():
    r = SpeechAnalysisResponse(
        status="success",
        db_record_id="id-1",
        data=SpeechData(transcription="text", overall_slur_score=30.0, classification="Non Stroke"),
        alert=AlertPayload(trigger_alarm=False, alert_level="GREEN", message="ok"),
    )
    assert r.alert_sent is False


def test_prediction_response_shape():
    from datetime import datetime, timezone
    r = PredictionResponse(
        label="stroke",
        confidence=0.9,
        detections=[],
        source="live_frame",
        db_record_id="id-1",
        created_at=datetime.now(timezone.utc),
    )
    assert r.source == "live_frame"


def test_stroke_incident_valid():
    s = StrokeIncident(severity=Severity.SEVERE, caused_by_bg=False, age=65, blood_sugar=100.0, confidence=0.85)
    assert s.severity == Severity.SEVERE
