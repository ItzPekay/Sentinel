from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    user_id: str
    email: str
    name: str
    emergency_contact_email: Optional[str] = None


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    emergency_contact_email: Optional[str] = None


class EmergencyContactCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class EmergencyContactOut(BaseModel):
    id: str
    user_id: str
    email: str
    name: Optional[str] = None
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PendingTwoFAResponse(BaseModel):
    pending_2fa: bool = True
    partial_token: str


class OTPVerifyRequest(BaseModel):
    partial_token: str
    otp_code: str


class TokenData(BaseModel):
    user_id: str
    email: str
