from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import jwt
import os
from zoneinfo import ZoneInfo

# JWT Configuration
JWT_SECRET = os.getenv("BETTER_AUTH_SECRET", "default_secret_for_dev_must_be_32_chars_long_enough")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_EXPIRY = 15 * 60  # 15 minutes in seconds
JWT_REFRESH_EXPIRY = 7 * 24 * 60 * 60  # 7 days in seconds


def create_access_token(user_id: str, email: str) -> str:
    """
    Creates an access token with 15-minute expiry
    """
    expiration = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=JWT_ACCESS_EXPIRY)

    payload = {
        "user_id": user_id,
        "email": email,
        "exp": expiration,
        "iat": datetime.now(ZoneInfo("UTC")),
        "sub": user_id,
        "type": "access"
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def create_refresh_token(user_id: str) -> str:
    """
    Creates a refresh token with 7-day expiry
    """
    expiration = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=JWT_REFRESH_EXPIRY)

    payload = {
        "user_id": user_id,
        "exp": expiration,
        "iat": datetime.now(ZoneInfo("UTC")),
        "sub": user_id,
        "type": "refresh"
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_access_token(token: str) -> Dict[str, Any]:
    """
    Verifies an access token and returns its payload
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Verify it's an access token
        token_type = payload.get("type")
        if token_type != "access":
            raise jwt.InvalidTokenError("Invalid token type")

        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("Access token has expired")
    except jwt.InvalidTokenError as e:
        raise Exception(f"Invalid access token: {str(e)}")


def verify_refresh_token(token: str) -> Dict[str, Any]:
    """
    Verifies a refresh token and returns its payload
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Verify it's a refresh token
        token_type = payload.get("type")
        if token_type != "refresh":
            raise jwt.InvalidTokenError("Invalid token type")

        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("Refresh token has expired")
    except jwt.InvalidTokenError as e:
        raise Exception(f"Invalid refresh token: {str(e)}")


def extract_user_id_from_token_payload(payload: Dict[str, Any]) -> str:
    """
    Extracts user_id from JWT payload
    """
    if not payload or "sub" not in payload:
        raise Exception("Invalid token: no subject (user_id) found")

    return payload["sub"]


def is_token_expired(payload: Dict[str, Any]) -> bool:
    """
    Checks if a token is expired based on exp claim
    """
    if "exp" not in payload:
        return True  # If no expiration, consider it expired

    current_time = datetime.now(ZoneInfo("UTC")).timestamp()
    return payload["exp"] < current_time