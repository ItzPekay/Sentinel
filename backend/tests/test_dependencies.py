import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token, create_partial_token

client = TestClient(app)


def _auth_header(user_id="uid-1", email="a@b.com") -> dict:
    token = create_access_token({"user_id": user_id, "email": email})
    return {"Authorization": f"Bearer {token}"}


def test_protected_route_no_token_returns_401():
    resp = client.get("/camera/snapshot")
    assert resp.status_code == 401


def test_protected_route_invalid_token_returns_401():
    resp = client.get("/camera/snapshot", headers={"Authorization": "Bearer bad.token"})
    assert resp.status_code == 401


def test_protected_route_valid_token_does_not_return_401():
    resp = client.get("/camera/snapshot", headers=_auth_header())
    assert resp.status_code != 401


def test_partial_token_rejected_on_protected_route():
    partial = create_partial_token("uid-1", "a@b.com")
    resp = client.get("/camera/snapshot", headers={"Authorization": f"Bearer {partial}"})
    assert resp.status_code == 401
