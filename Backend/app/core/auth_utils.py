from datetime import datetime, timezone, timedelta
import jwt
from app.core.config import settings


def create_access_token(user_id: str, user_email: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(minutes=15)
    payload = {"sub": user_id, "email": user_email, "exp": expiration, "type": "access"}
    return jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")


def create_refresh_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(days=7)
    payload = {"sub": user_id, "exp": expiration, "type": "refresh"}
    return jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")
