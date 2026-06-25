import asyncio
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException

from app.core.security import (
    verify_password,
    create_access_token,
    create_partial_token,
    decode_access_token,
)
from app.models.user import UserCreate, UserLogin, UserOut, UserProfileUpdate, EmergencyContactCreate, EmergencyContactOut, OTPVerifyRequest
from app.services import database_service, contact_service
from app.services.config_service import logger, OAUTH_CLIENT_ID, OAUTH_SECRET, OAUTH_REDIRECT_URI


def _row_to_out(row: dict) -> UserOut:
    return UserOut(
        user_id=str(row["user_id"]),
        email=row["email"],
        name=row["name"],
    )


def _contact_row_to_out(row: dict) -> EmergencyContactOut:
    return EmergencyContactOut(
        id=str(row["id"]),
        user_id=str(row["user_id"]),
        email=row["email"],
        name=row.get("name"),
        created_at=str(row["created_at"]),
    )


async def list_emergency_contacts(user_id: str) -> list[EmergencyContactOut]:
    rows = database_service.get_emergency_contacts(user_id)
    return [_contact_row_to_out(r) for r in rows]


async def add_emergency_contact(user_id: str, data: EmergencyContactCreate) -> EmergencyContactOut:
    row = database_service.add_emergency_contact(user_id, data.email, data.name)
    return _contact_row_to_out(row)


async def remove_emergency_contact(contact_id: str, user_id: str) -> None:
    database_service.remove_emergency_contact(contact_id, user_id)


async def register_user(data: UserCreate) -> UserOut:
    user_row = database_service.create_user(data)
    logger.info(f"[Auth] Registered: {data.email}")
    return _row_to_out(user_row)


async def authenticate_user(data: UserLogin) -> tuple[str, str]:
    user = database_service.get_user_by_email(email=data.email)
    if user is None or not user.get("hashed_password") or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials", headers={"WWW-Authenticate": "Bearer"})

    otp_code = str(secrets.randbelow(10 ** 6)).zfill(6)
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    database_service.save_otp(str(user["user_id"]), otp_code, expires_at)
    await asyncio.to_thread(contact_service.send_otp_email, user["email"], otp_code)
    logger.info(f"[Auth] OTP sent to {data.email}")

    partial_token = create_partial_token(str(user["user_id"]), user["email"])
    return partial_token, user["email"]


async def verify_otp(request: OTPVerifyRequest) -> str:
    payload = decode_access_token(request.partial_token)
    if not payload.get("2fa_pending"):
        raise HTTPException(status_code=400, detail="Token is not a 2FA partial token")

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid partial token payload")
    otp_row = database_service.get_valid_otp(user_id, request.otp_code)
    if otp_row is None:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    database_service.mark_otp_used(otp_row["id"])
    user = database_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Account not found")
    full_token = create_access_token({"user_id": str(user["user_id"]), "email": user["email"]})
    logger.info(f"[Auth] 2FA verified for user_id={user_id}")
    return full_token


def get_google_auth_url() -> str:
    params = {
        "client_id": OAUTH_CLIENT_ID,
        "redirect_uri": OAUTH_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"


async def handle_google_callback(code: str) -> str:
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": OAUTH_CLIENT_ID,
                "client_secret": OAUTH_SECRET,
                "redirect_uri": OAUTH_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        token_res.raise_for_status()
        tokens = token_res.json()

        userinfo_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        userinfo_res.raise_for_status()
        profile = userinfo_res.json()

    user_row = database_service.upsert_oauth_user(profile["email"], profile.get("name", ""))
    full_token = create_access_token({"user_id": str(user_row["user_id"]), "email": user_row["email"]})
    logger.info(f"[Auth] Google OAuth login: {profile['email']}")
    return full_token


async def update_profile(user_id: str, data: UserProfileUpdate) -> UserOut:
    user_row = database_service.update_user_profile(user_id, data)
    return _row_to_out(user_row)
