from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.models.user import TokenData

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(_oauth2_scheme)) -> TokenData:
    payload = decode_access_token(token)
    if payload.get("2fa_pending"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="2FA verification required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id: str | None = payload.get("user_id")
    email: str | None = payload.get("email")
    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenData(user_id=user_id, email=email)
