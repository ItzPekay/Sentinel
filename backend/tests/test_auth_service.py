import asyncio
from unittest.mock import patch, MagicMock
import pytest
from fastapi import HTTPException

from app.core.security import hash_password, decode_access_token
from app.models.user import UserCreate, UserLogin, UserProfileUpdate, OTPVerifyRequest
from app.services.auth_service import (
    register_user,
    authenticate_user,
    verify_otp,
    update_profile,
)

_FAKE_USER_ROW = {
    "user_id": "uuid-abc-123",
    "email": "alice@example.com",
    "name": "Alice",
    "hashed_password": hash_password("correct-password"),
    "emergency_contact_email": None,
}


def test_register_user_returns_user_out():
    data = UserCreate(email="alice@example.com", name="Alice", password="correct-password")
    with patch("app.services.database_service.create_user", return_value=_FAKE_USER_ROW):
        result = asyncio.run(register_user(data))
    assert result.user_id == "uuid-abc-123"
    assert result.email == "alice@example.com"
    assert result.name == "Alice"


def test_register_user_propagates_409_on_duplicate_email():
    data = UserCreate(email="alice@example.com", name="Alice", password="correct-password")
    with patch(
        "app.services.database_service.create_user",
        side_effect=HTTPException(status_code=409, detail="Email already registered"),
    ):
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(register_user(data))
    assert exc_info.value.status_code == 409


def test_authenticate_user_returns_partial_token_and_email():
    data = UserLogin(email="alice@example.com", password="correct-password")
    with patch("app.services.database_service.get_user_by_email", return_value=_FAKE_USER_ROW), \
         patch("app.services.database_service.save_otp"), \
         patch("app.services.contact_service.send_otp_email"):
        partial_token, email = asyncio.run(authenticate_user(data))
    assert isinstance(partial_token, str) and len(partial_token) > 0
    payload = decode_access_token(partial_token)
    assert payload.get("2fa_pending") is True
    assert email == "alice@example.com"


def test_authenticate_user_raises_401_on_unknown_email():
    data = UserLogin(email="nobody@example.com", password="pass")
    with patch("app.services.database_service.get_user_by_email", return_value=None):
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(authenticate_user(data))
    assert exc_info.value.status_code == 401


def test_authenticate_user_raises_401_on_wrong_password():
    data = UserLogin(email="alice@example.com", password="wrong")
    with patch("app.services.database_service.get_user_by_email", return_value=_FAKE_USER_ROW):
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(authenticate_user(data))
    assert exc_info.value.status_code == 401


def test_verify_otp_returns_full_token():
    from app.core.security import create_partial_token
    partial = create_partial_token("uuid-abc-123", "alice@example.com")
    req = OTPVerifyRequest(partial_token=partial, otp_code="123456")
    fake_otp_row = {"id": "otp-id-1", "code": "123456", "used": False}
    with patch("app.services.database_service.get_valid_otp", return_value=fake_otp_row), \
         patch("app.services.database_service.mark_otp_used"), \
         patch("app.services.database_service.get_user_by_id", return_value=_FAKE_USER_ROW):
        full_token = asyncio.run(verify_otp(req))
    payload = decode_access_token(full_token)
    assert payload.get("2fa_pending") is None
    assert payload["user_id"] == "uuid-abc-123"


def test_verify_otp_raises_400_on_non_partial_token():
    from app.core.security import create_access_token
    full_token = create_access_token({"user_id": "uid", "email": "a@b.com"})
    req = OTPVerifyRequest(partial_token=full_token, otp_code="123456")
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(verify_otp(req))
    assert exc_info.value.status_code == 400


def test_verify_otp_raises_401_on_invalid_code():
    from app.core.security import create_partial_token
    partial = create_partial_token("uid", "a@b.com")
    req = OTPVerifyRequest(partial_token=partial, otp_code="000000")
    with patch("app.services.database_service.get_valid_otp", return_value=None):
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(verify_otp(req))
    assert exc_info.value.status_code == 401


def test_update_profile_returns_user_out():
    updated_row = {**_FAKE_USER_ROW, "emergency_contact_email": "guardian@example.com"}
    data = UserProfileUpdate(emergency_contact_email="guardian@example.com")
    with patch("app.services.database_service.update_user_profile", return_value=updated_row):
        result = asyncio.run(update_profile("uuid-abc-123", data))
    assert result.emergency_contact_email == "guardian@example.com"
