import os
import pytest
from datetime import timedelta
from fastapi import HTTPException
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_partial_token,
    decode_access_token,
    validate_jwt_secret,
)


def test_hash_password_is_not_plaintext():
    assert hash_password("secret") != "secret"


def test_verify_password_correct():
    hashed = hash_password("secret")
    assert verify_password("secret", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("secret")
    assert verify_password("wrong", hashed) is False


def test_create_and_decode_token_roundtrip():
    token = create_access_token({"user_id": "abc123", "email": "a@b.com"})
    payload = decode_access_token(token)
    assert payload["user_id"] == "abc123"
    assert payload["email"] == "a@b.com"


def test_decode_expired_token_raises_401():
    token = create_access_token({"user_id": "x"}, expires_delta=timedelta(seconds=-1))
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token(token)
    assert exc_info.value.status_code == 401


def test_decode_invalid_token_raises_401():
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token("not.a.valid.token")
    assert exc_info.value.status_code == 401


def test_decode_401_includes_www_authenticate_header():
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token("bad")
    assert exc_info.value.headers["WWW-Authenticate"] == "Bearer"


def test_partial_token_has_2fa_pending_claim():
    token = create_partial_token("uid-1", "a@b.com")
    payload = decode_access_token(token)
    assert payload.get("2fa_pending") is True
    assert payload["user_id"] == "uid-1"


def test_validate_jwt_secret_raises_on_default(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "changeme-set-JWT_SECRET-in-env!!")
    import importlib
    import app.core.security as sec
    importlib.reload(sec)
    with pytest.raises(RuntimeError, match="JWT_SECRET"):
        sec.validate_jwt_secret()
