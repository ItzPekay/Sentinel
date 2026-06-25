from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import UserOut
from app.core.security import create_partial_token

client = TestClient(app)


def test_register_returns_201_with_user_out():
    mock_user = UserOut(user_id="uuid-1", email="a@b.com", name="Alice")
    with patch("app.services.auth_service.register_user", new=AsyncMock(return_value=mock_user)):
        resp = client.post(
            "/auth/register",
            json={"email": "a@b.com", "name": "Alice", "password": "pass12345"},
        )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "a@b.com"
    assert "password" not in body


def test_register_missing_field_returns_422():
    resp = client.post("/auth/register", json={"email": "a@b.com", "password": "pass12345"})
    assert resp.status_code == 422


def test_register_invalid_email_returns_422():
    resp = client.post(
        "/auth/register",
        json={"email": "not-an-email", "name": "Alice", "password": "pass12345"},
    )
    assert resp.status_code == 422


def test_login_returns_200_with_pending_2fa():
    with patch(
        "app.services.auth_service.authenticate_user",
        new=AsyncMock(return_value=("partial.jwt.token", "a@b.com")),
    ):
        resp = client.post("/auth/login", json={"email": "a@b.com", "password": "pass12345"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["pending_2fa"] is True
    assert "partial_token" in body


def test_login_missing_password_returns_422():
    resp = client.post("/auth/login", json={"email": "a@b.com"})
    assert resp.status_code == 422


def test_verify_otp_returns_access_token():
    with patch(
        "app.services.auth_service.verify_otp",
        new=AsyncMock(return_value="full.jwt.token"),
    ):
        resp = client.post(
            "/auth/verify-otp",
            json={"partial_token": "partial.jwt.token", "otp_code": "123456"},
        )
    assert resp.status_code == 200
    body = resp.json()
    assert body["access_token"] == "full.jwt.token"
    assert body["token_type"] == "bearer"


def test_google_login_returns_auth_url():
    with patch("app.services.auth_service.get_google_auth_url", return_value="https://accounts.google.com/auth"):
        resp = client.get("/auth/google")
    assert resp.status_code == 200
    assert "auth_url" in resp.json()
