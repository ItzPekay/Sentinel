import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException
from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_JWT_SECRET = os.getenv("JWT_SECRET", "changeme-set-JWT_SECRET-in-env!!")
_JWT_ALGORITHM = "HS256"
_JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
_JWT_SECRET_DEFAULT = "changeme-set-JWT_SECRET-in-env!!"


def validate_jwt_secret() -> None:
    if _JWT_SECRET == _JWT_SECRET_DEFAULT:
        raise RuntimeError(
            "JWT_SECRET is set to the insecure default. "
            "Set a real secret in your .env file before starting the server."
        )


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta is not None else timedelta(minutes=_JWT_EXPIRE_MINUTES)
    )
    payload["exp"] = expire
    return jwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALGORITHM)


def create_partial_token(user_id: str, email: str) -> str:
    return create_access_token(
        {"user_id": user_id, "email": email, "2fa_pending": True},
        expires_delta=timedelta(minutes=10),
    )


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, _JWT_SECRET, algorithms=[_JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
