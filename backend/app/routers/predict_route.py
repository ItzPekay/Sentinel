import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app import state
from app.dependencies import get_current_user
from app.models.response import DetectionItem, PredictionResponse
from app.models.user import TokenData
from app.services import config_service, contact_service, database_service
from app.services.stroke_model import StrokeModel

_STROKE_CONFIDENCE_THRESHOLD = 0.7
_STROKE_LABELS = {"Stroke"}  # class names from best.pt: {0: 'Stroke', 1: 'NonStroke'}

router = APIRouter(prefix="/predict", tags=["Stroke Prediction"])

_stroke_model: Optional[StrokeModel] = None


def init_stroke_model(model: StrokeModel) -> None:
    global _stroke_model
    _stroke_model = model


def _get_stroke_model() -> StrokeModel:
    if _stroke_model is None:
        raise HTTPException(status_code=503, detail="Prediction model not initialized")
    return _stroke_model


@router.post("/", response_model=PredictionResponse)
async def predict(
    file: Optional[UploadFile] = File(default=None),
    current_user: TokenData = Depends(get_current_user),
    model: StrokeModel = Depends(_get_stroke_model),
):
    if file is not None:
        image_bytes = await file.read()
        source = "upload"
    elif state.latest_frame is not None:
        image_bytes = state.latest_frame
        source = "live_frame"
    else:
        raise HTTPException(status_code=503, detail="No frame available — upload an image or wait for camera feed")

    result = model.predict(image_bytes)
    config_service.logger.info(f"[Predict] source={source} label={result['label']} conf={result['confidence']:.4f} boxes={len(result['detections'])}")

    try:
        db_record = database_service.save_prediction(
            user_id=current_user.user_id,
            label=result["label"],
            confidence=result["confidence"],
            raw_detections=result["detections"],
            source=source,
        )
        db_record_id = str(db_record["id"])
    except Exception:
        db_record_id = "LOCAL_MOCK_ID"

    alert_sent = False
    if result["label"] in _STROKE_LABELS and result["confidence"] >= _STROKE_CONFIDENCE_THRESHOLD:
        contacts = database_service.get_emergency_contacts(current_user.user_id)
        for contact in contacts:
            try:
                await asyncio.to_thread(
                    contact_service.create_report,
                    contact["email"],
                    result["confidence"] * 100,
                    current_user.email,
                    True,
                )
                alert_sent = True
            except Exception as e:
                config_service.logger.error(f"[Alert] Predict email to {contact['email']} failed: {e}")

    return PredictionResponse(
        label=result["label"],
        confidence=result["confidence"],
        detections=[DetectionItem(**d) for d in result["detections"]],
        source=source,
        db_record_id=db_record_id,
        created_at=datetime.now(timezone.utc),
        alert_sent=alert_sent,
    )
