import asyncio
import os
import shutil
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, BackgroundTasks

from app.dependencies import get_current_user
from app.limiter import limiter
from app.models.user import TokenData
from app.models.response import (
    AlertPayload,
    BloodSugarResponse,
    CommandResponse,
    SpeechAnalysisResponse,
    SpeechData,
)
from app.services import config_service, contact_service
from app.services.database_service import (
    append_blood_sugar_record,
    append_voice_command_record,
    get_emergency_contacts,
)
from app.services.extra_check_service import parse_blood_glucose
from app.services.speech_service import SpeechService

router = APIRouter(prefix="/speech", tags=["Speech Anomaly Detection"])

_ALLOWED_EXTENSIONS = (".wav", ".mp3", ".m4a", ".ogg", ".webm", ".opus")

_speech_service: SpeechService | None = None


def init_speech_service(service: SpeechService) -> None:
    global _speech_service
    _speech_service = service


def _get_speech_service() -> SpeechService:
    if _speech_service is None:
        raise HTTPException(status_code=503, detail="Speech service not initialized")
    return _speech_service


async def _send_to_all_contacts(contacts: list[dict], *args) -> bool:
    """Send create_report to every emergency contact. Returns True if at least one succeeded."""
    sent = False
    for contact in contacts:
        try:
            await asyncio.to_thread(contact_service.create_report, contact["email"], *args)
            sent = True
        except Exception as e:
            config_service.logger.error(f"[Alert] Email to {contact['email']} failed: {e}")
    return sent


@router.post("/analyze", response_model=SpeechAnalysisResponse)
@limiter.limit("10/minute")
async def analyze_audio_endpoint(
    request: Request,
    file: UploadFile = File(...),
    service: SpeechService = Depends(_get_speech_service),
    current_user: TokenData = Depends(get_current_user),
):
    if not file.filename or not file.filename.endswith(_ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Invalid audio file format.")

    ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(config_service.UPLOAD_FOLDER, f"{uuid.uuid4().hex}{ext}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Filesystem streaming error: {str(e)}")

    try:
        t_score, text = service.analyze_transcription(file_path)
        a_score = service.analyze_audio_features(file_path)
        classification, final_score, alert_payload = service.evaluate_risk_and_alerts(t_score, a_score)

        alert_sent = False
        if classification == "Stroke":
            contacts = get_emergency_contacts(current_user.user_id)
            if contacts:
                alert_sent = await _send_to_all_contacts(contacts, final_score, current_user.email, True)

        db_document_id = service.save_to_history(
            filename=file.filename,
            text=text,
            t_score=t_score,
            a_score=a_score,
            final_score=final_score,
            classification=classification,
            alert_payload=alert_payload,
            user_id=current_user.user_id,
        )
        config_service.logger.info(f"[Speech] user={current_user.user_id} score={final_score:.1f} class={classification}")

        return SpeechAnalysisResponse(
            status="success",
            db_record_id=db_document_id,
            data=SpeechData(
                transcription=text,
                overall_slur_score=final_score,
                classification=classification,
            ),
            alert=AlertPayload(**alert_payload),
            alert_sent=alert_sent,
        )
    except HTTPException:
        raise
    except Exception as e:
        config_service.logger.error(f"[Speech] Extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Diagnostic error: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/command", response_model=CommandResponse)
async def process_voice_command(
    file: UploadFile = File(...),
    service: SpeechService = Depends(_get_speech_service),
    current_user: TokenData = Depends(get_current_user),
):
    if not file.filename or not file.filename.endswith(_ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Invalid audio format.")

    ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(config_service.UPLOAD_FOLDER, f"{uuid.uuid4().hex}{ext}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File save error: {str(e)}")

    try:
        raw_text = service.transcribe_audio(file_path)
        cleaned_text = service.clean_text(raw_text)
        command_result = service.detect_command(cleaned_text)

        alert_sent = False
        alert_skipped_reason: str | None = None

        if command_result["intent"] == "contact_guardian":
            append_voice_command_record(current_user.user_id, "Contact family")
            contacts = get_emergency_contacts(current_user.user_id)
            if not contacts:
                alert_skipped_reason = "No emergency contacts set. Add one in your profile."
            else:
                alert_sent = await _send_to_all_contacts(contacts, 0.95, current_user.email, True)
                if not alert_sent:
                    alert_skipped_reason = "Email delivery failed. Please try again."
            append_blood_sugar_record(
                patient_id=current_user.user_id,
                event_type="voice_panic_override",
                message=f"Voice panic trigger activated. Cleaned text: '{cleaned_text}'",
                is_critical=True,
            )

        config_service.logger.info(f"[Command] user={current_user.user_id} intent={command_result['intent']} alert_sent={alert_sent}")
        return CommandResponse(
            status="success",
            user_id=current_user.user_id,
            raw_audio_heard=raw_text,
            matched_intent=command_result["intent"],
            frontend_ui_direction=command_result["message"],
            alert_sent=alert_sent,
            alert_skipped_reason=alert_skipped_reason,
        )
    except HTTPException:
        raise
    except Exception as e:
        config_service.logger.error(f"[Command] Failed: {e}")
        raise HTTPException(status_code=500, detail=f"Processing breakdown: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/submit-blood-sugar", response_model=BloodSugarResponse)
async def submit_blood_sugar_data(
    background_tasks: BackgroundTasks,
    glucose_value: float = Form(..., ge=20, le=600),
    current_user: TokenData = Depends(get_current_user),
):
    patient_id = current_user.user_id
    analysis = parse_blood_glucose(glucose_value)

    append_blood_sugar_record(
        patient_id=patient_id,
        event_type="form_blood_sugar_submission",
        message=f"Blood sugar form submitted. Value: {glucose_value}",
        glucose_val=glucose_value,
        is_critical=analysis["contact_family"],
    )

    if analysis["contact_family"]:
        contacts = get_emergency_contacts(patient_id)
        for contact in contacts:
            background_tasks.add_task(
                contact_service.create_report,
                contact["email"],
                0.0,
                current_user.email,
                False,
                glucose_value,
            )

    config_service.logger.info(f"[BloodSugar] user={patient_id} glucose={glucose_value} critical={analysis['contact_family']}")
    return BloodSugarResponse(
        status="success",
        patient_id=patient_id,
        logged_value=glucose_value,
        emergency_alert_dispatched=analysis["contact_family"],
        medical_assessment=analysis["message"],
    )
