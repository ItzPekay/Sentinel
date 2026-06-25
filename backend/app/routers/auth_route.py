from fastapi import APIRouter, Depends, status, Request
from fastapi.responses import RedirectResponse

from app.dependencies import get_current_user
from app.limiter import limiter
from app.models.user import (
    UserCreate,
    UserLogin,
    UserOut,
    UserProfileUpdate,
    EmergencyContactCreate,
    EmergencyContactOut,
    TokenResponse,
    PendingTwoFAResponse,
    OTPVerifyRequest,
    TokenData,
)
from app.services import auth_service
from app.services.config_service import FRONTEND_URL

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate):
    return await auth_service.register_user(data)


@router.post("/login", response_model=PendingTwoFAResponse)
@limiter.limit("5/minute")
async def login(request: Request, data: UserLogin):
    partial_token, _ = await auth_service.authenticate_user(data)
    return PendingTwoFAResponse(partial_token=partial_token)


@router.post("/verify-otp", response_model=TokenResponse)
@limiter.limit("5/minute")
async def verify_otp(request: Request, body: OTPVerifyRequest):
    token = await auth_service.verify_otp(body)
    return TokenResponse(access_token=token)


@router.get("/google")
async def google_login():
    return {"auth_url": auth_service.get_google_auth_url()}


@router.get("/google/callback")
async def google_callback(code: str):
    token = await auth_service.handle_google_callback(code)
    return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?token={token}")


@router.patch("/profile", response_model=UserOut)
async def update_profile(
    data: UserProfileUpdate,
    current_user: TokenData = Depends(get_current_user),
):
    return await auth_service.update_profile(current_user.user_id, data)


@router.get("/emergency-contacts", response_model=list[EmergencyContactOut])
async def list_emergency_contacts(current_user: TokenData = Depends(get_current_user)):
    return await auth_service.list_emergency_contacts(current_user.user_id)


@router.post("/emergency-contacts", response_model=EmergencyContactOut, status_code=status.HTTP_201_CREATED)
async def add_emergency_contact(
    data: EmergencyContactCreate,
    current_user: TokenData = Depends(get_current_user),
):
    return await auth_service.add_emergency_contact(current_user.user_id, data)


@router.delete("/emergency-contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_emergency_contact(
    contact_id: str,
    current_user: TokenData = Depends(get_current_user),
):
    await auth_service.remove_emergency_contact(contact_id, current_user.user_id)
