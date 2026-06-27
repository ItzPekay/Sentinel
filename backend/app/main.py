import asyncio
import traceback
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app import state
from app.core.security import validate_jwt_secret
from app.limiter import limiter
from app.routers import auth_route, camera_route, speech_route, usage_history_route
from app.routers import predict_route
from app.routers.predict_route import init_stroke_model
from app.routers.speech_route import init_speech_service
from app.services.camera_service import proxy_snapshot
from app.services.config_service import ALLOWED_ORIGINS, logger
from app.services.speech_service import SpeechService
from app.services.stroke_model import StrokeModel

app_dir = Path(__file__).resolve().parent


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_jwt_secret()

    speech_service = SpeechService()
    init_speech_service(speech_service)

    model_path = str(app_dir.parent / "ml" / "best.pt")
    stroke_model = StrokeModel(model_path)
    init_stroke_model(stroke_model)

    task = asyncio.create_task(fetch_loop())
    yield
    task.cancel()


async def fetch_loop():
    consecutive_failures = 0
    while True:
        frame = await proxy_snapshot()
        if frame:
            state.latest_frame = frame
            consecutive_failures = 0
            await asyncio.sleep(0.5)
        else:
            consecutive_failures += 1
            if consecutive_failures % 10 == 0:
                logger.warning(f"[Camera] Pi unreachable for {consecutive_failures} consecutive attempts")
            await asyncio.sleep(5.0)


app = FastAPI(
    lifespan=lifespan,
    title="Sentinel: Stroke Predictor & Life Saver",
    description="An application that predicts strokes in order to prevent damage.",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"[Unhandled] {request.method} {request.url}: {traceback.format_exc()}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None) or {},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_route.router)
app.include_router(speech_route.router)
app.include_router(camera_route.router, prefix="/camera")
app.include_router(predict_route.router)
app.include_router(usage_history_route.router)


@app.get("/")
async def root():
    return {"message": "Stroke Detector core API active"}


@app.get("/health")
async def health():
    return {"status": "ok"}
