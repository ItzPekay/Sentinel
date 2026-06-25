from datetime import datetime, timezone
from typing import Any, cast

from fastapi import HTTPException
from supabase import Client

from app.services.config_service import SUPABASE_CLIENT, logger
from app.models.user import UserCreate, UserProfileUpdate
from app.models.incidents import StrokeIncident
from app.core.security import hash_password


def _require_client() -> Client:
    if SUPABASE_CLIENT is None:
        raise HTTPException(status_code=503, detail="Database not available")
    return SUPABASE_CLIENT


def create_user(data: UserCreate) -> dict[str, Any]:
    db = _require_client()
    existing = db.table("users").select("user_id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Email already registered")
    res = db.table("users").insert({
        "email": data.email,
        "name": data.name,
        "hashed_password": hash_password(data.password),
    }).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="User creation failed")
    return cast(dict[str, Any], res.data[0])


def get_user_by_email(email: str) -> dict[str, Any] | None:
    db = _require_client()
    res = db.table("users").select("*").eq("email", email).execute()
    return res.data[0] if res.data else None


def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    db = _require_client()
    res = db.table("users").select("*").eq("user_id", user_id).execute()
    return res.data[0] if res.data else None


def upsert_oauth_user(email: str, name: str) -> dict[str, Any]:
    db = _require_client()
    existing = db.table("users").select("*").eq("email", email).execute()
    if existing.data:
        return cast(dict[str, Any], existing.data[0])
    res = db.table("users").insert({"email": email, "name": name}).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="OAuth user creation failed")
    return cast(dict[str, Any], res.data[0])


def update_user_profile(user_id: str, data: UserProfileUpdate) -> dict[str, Any]:
    db = _require_client()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        res = db.table("users").select("*").eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")
        return cast(dict[str, Any], res.data[0])
    res = db.table("users").update(updates).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return cast(dict[str, Any], res.data[0])


def get_emergency_contacts(user_id: str) -> list[dict]:
    db = _require_client()
    res = db.table("emergency_contacts").select("*").eq("user_id", user_id).order("created_at").execute()
    return res.data


def add_emergency_contact(user_id: str, email: str, name: str | None = None) -> dict:
    db = _require_client()
    res = db.table("emergency_contacts").insert({"user_id": user_id, "email": email, "name": name}).execute()
    return res.data[0]


def remove_emergency_contact(contact_id: str, user_id: str) -> None:
    db = _require_client()
    db.table("emergency_contacts").delete().eq("id", contact_id).eq("user_id", user_id).execute()


def save_otp(user_id: str, code: str, expires_at: str) -> None:
    db = _require_client()
    db.table("otp_codes").upsert({
        "user_id": user_id,
        "code": code,
        "expires_at": expires_at,
        "used": False,
    }, on_conflict="user_id").execute()


def get_valid_otp(user_id: str, code: str) -> dict[str, Any] | None:
    db = _require_client()
    now = datetime.now(timezone.utc).isoformat()
    res = (
        db.table("otp_codes")
        .select("*")
        .eq("user_id", user_id)
        .eq("code", code)
        .eq("used", False)
        .gt("expires_at", now)
        .execute()
    )
    return res.data[0] if res.data else None


def mark_otp_used(otp_id: str) -> None:
    db = _require_client()
    db.table("otp_codes").update({"used": True}).eq("id", otp_id).execute()


def get_stroke_history(user_id: str) -> list:
    db = _require_client()
    res = (
        db.table("stroke_history")
        .select("*")
        .eq("user_id", user_id)
        .order("date", desc=True)
        .execute()
    )
    return res.data


def append_stroke_record(user_id: str, stroke_event: StrokeIncident) -> Any:
    db = _require_client()
    res = db.table("stroke_history").insert({
        "user_id": user_id,
        "stroke_event": stroke_event.model_dump(),
    }).execute()
    return res.data[0]


def get_voice_command_history(user_id: str) -> list:
    db = _require_client()
    res = (
        db.table("voice_command_history")
        .select("*")
        .eq("user_id", user_id)
        .order("date", desc=True)
        .execute()
    )
    return res.data


def append_voice_command_record(user_id: str, voice_command: str) -> Any:
    db = _require_client()
    res = db.table("voice_command_history").insert({
        "user_id": user_id,
        "voice_command": voice_command,
    }).execute()
    return res.data[0]


def get_blood_sugar_history(user_id: str) -> list:
    db = _require_client()
    res = (
        db.table("blood_sugar_record")
        .select("*")
        .eq("user_id", user_id)
        .order("date", desc=True)
        .execute()
    )
    return res.data


def append_blood_sugar_record(
    patient_id: str,
    event_type: str,
    message: str,
    glucose_val: float | None = None,
    is_critical: bool = False,
) -> Any:
    try:
        db = _require_client()
        res = db.table("blood_sugar_record").insert({
            "user_id": patient_id,
            "event": event_type,
            "blood_sugar_reading": glucose_val,
            "message": message,
            "critical_alert": is_critical,
        }).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        logger.error(f"[DB] Blood sugar log insert failed: {e}")
        return None


def save_prediction(
    user_id: str,
    label: str,
    confidence: float,
    raw_detections: list,
    source: str,
) -> dict[str, Any]:
    db = _require_client()
    res = db.table("predictions").insert({
        "user_id": user_id,
        "label": label,
        "confidence": confidence,
        "raw_detections": raw_detections,
        "source": source,
    }).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Prediction save failed")
    return cast(dict[str, Any], res.data[0])


def get_speech_history(user_id: str) -> list:
    db = _require_client()
    res = (
        db.table("speech_history")
        .select("*")
        .eq("user_id", user_id)
        .order("timestamp", desc=True)
        .execute()
    )
    return res.data


def save_speech_history(record: dict) -> str:
    db = _require_client()
    response = db.table("speech_history").insert(record).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Speech history save failed")
    return str(response.data[0]["id"])
