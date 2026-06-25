from fastapi import APIRouter, Body, Depends

from app.dependencies import get_current_user
from app.models.incidents import StrokeIncident, VoiceCommands
from app.models.user import TokenData
from app.services.database_service import (
    append_blood_sugar_record,
    append_stroke_record,
    append_voice_command_record,
    get_blood_sugar_history,
    get_speech_history,
    get_stroke_history,
    get_voice_command_history,
)

router = APIRouter(prefix="/usage_history", tags=["Usage History"])


@router.get("/speech_history")
async def read_speech_history(user: TokenData = Depends(get_current_user)):
    return get_speech_history(user.user_id)


@router.get("/stroke_history")
async def read_stroke_history(user: TokenData = Depends(get_current_user)):
    return get_stroke_history(user.user_id)


@router.post("/stroke_history")
async def append_stroke(
    stroke_incident: StrokeIncident,
    user: TokenData = Depends(get_current_user),
):
    return append_stroke_record(user.user_id, stroke_incident)


@router.get("/blood_sugar_history")
async def read_blood_sugar_history(user: TokenData = Depends(get_current_user)):
    return get_blood_sugar_history(user.user_id)


@router.get("/voice_command_history")
async def read_voice_cmd_history(user: TokenData = Depends(get_current_user)):
    return get_voice_command_history(user.user_id)


@router.post("/voice_command_history")
async def append_voice_cmd(
    voice_cmd: VoiceCommands = Body(...),
    user: TokenData = Depends(get_current_user),
):
    return append_voice_command_record(user.user_id, voice_cmd)
