import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, StreamingResponse

from app import state
from app.dependencies import get_current_user
from app.models.user import TokenData
from app.services import camera_service

router = APIRouter()


@router.get("/stream")
async def view_stream(current_user: TokenData = Depends(get_current_user)):
    try:
        content_type, pi_response = await camera_service.open_stream()
    except (httpx.ConnectError, httpx.HTTPStatusError) as e:
        raise HTTPException(status_code=503, detail=f"Pi camera unavailable: {e}")

    async def _generate():
        try:
            async for chunk in pi_response.aiter_bytes():
                yield chunk
        finally:
            await pi_response.aclose()

    return StreamingResponse(
        _generate(),
        media_type=content_type,
        headers={"Cache-Control": "no-cache"},
    )


@router.get("/snapshot")
async def get_snapshot(current_user: TokenData = Depends(get_current_user)):
    if state.latest_frame is None:
        raise HTTPException(status_code=503, detail="No frame available")
    return Response(content=state.latest_frame, media_type="image/jpeg")
