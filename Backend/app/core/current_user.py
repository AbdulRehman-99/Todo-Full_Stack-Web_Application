"""
Authentication abstraction for the Backend API
This module provides a get_current_user function that validates JWT tokens from Better Auth
"""
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security.http import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session
import jwt
from app.db.session import get_session
from app.core.config import settings
import bcrypt


# Set up security scheme for JWT tokens
security_scheme = HTTPBearer()


def get_current_user(request: Request, session: Session = Depends(get_session)) -> str:
    """
    Get the current authenticated user by validating JWT token from Authorization header.

    This function validates the JWT token sent from the frontend (via Better Auth)
    and extracts the user ID from the token payload.

    Args:
        request: HTTP request object to extract authorization header
        session: Database session dependency

    Returns:
        str: The authenticated user ID

    Raises:
        HTTPException: If user is not authenticated or token is invalid
    """
    # Extract the authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header"
        )

    # Check if it's a Bearer token
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected: Bearer <token>"
        )

    # Extract the token
    token = auth_header[7:]  # Remove 'Bearer ' prefix

    try:
        # Decode the JWT token using the Better Auth secret
        payload = jwt.decode(
            token,
            settings.secret_key or settings.better_auth_secret or "fallback-secret",
            algorithms=["HS256"]  # Using HS256 as specified in the .env
        )

        # Extract user ID from token payload
        user_id = payload.get("sub")  # Subject field typically contains user ID

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user ID found"
            )

        # Return the user ID as a string
        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}"
        )


def get_current_user_optional(request: Request, session: Session = Depends(get_session)) -> Optional[str]:
    """
    Get the current user ID if authenticated, otherwise return None.

    This is useful for endpoints that work differently based on authentication.

    Args:
        request: HTTP request object to extract authorization header
        session: Database session dependency

    Returns:
        str or None: The authenticated user ID or None if not authenticated
    """
    try:
        return get_current_user(request, session)
    except HTTPException:
        return None