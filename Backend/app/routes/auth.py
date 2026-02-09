from fastapi import APIRouter, Request, HTTPException, status, Depends
from typing import Dict, Any
from datetime import timedelta
import bcrypt
from pydantic import BaseModel
from ..db.session import engine  # Use database session
import sys
import os
# Add Backend root to path to import the main models file
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from models import User  # Use the original models file with singular table names
from sqlmodel import Session, select
from datetime import datetime, timezone
import jwt
from jose import JWTError
from ..core.current_user import get_current_user  # Import the current user dependency

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class SignUpRequest(BaseModel):
    email: str
    password: str
    username: str


@router.post("/sign-in/email")
async def login(request: LoginRequest) -> Dict[str, Any]:
    """
    Login endpoint - creates JWT tokens for valid credentials
    """
    email = request.email
    password = request.password

    # Import required modules properly
    from ..core.config import settings
    from datetime import timedelta

    def create_access_token(user_id: str, user_email: str):
        expiration = datetime.now(timezone.utc) + timedelta(minutes=30)
        token_data = {
            "sub": user_id,
            "email": user_email,
            "exp": expiration,
            "type": "access"
        }
        return jwt.encode(token_data, settings.better_auth_secret or settings.secret_key or "fallback-secret", algorithm="HS256")

    def create_refresh_token(user_id: str):
        expiration = datetime.now(timezone.utc) + timedelta(days=7)
        token_data = {
            "sub": user_id,
            "exp": expiration,
            "type": "refresh"
        }
        return jwt.encode(token_data, settings.better_auth_secret or settings.secret_key or "fallback-secret", algorithm="HS256")

    with Session(engine) as session:
        # Find user by email - using the User model from the main models file
        user = session.exec(select(User).where(User.email == email)).first()

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Create access and refresh tokens
        access_token = create_access_token(user.id, user.email)
        refresh_token = create_refresh_token(user.id)

        return {
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                }
            }
        }


@router.post("/sign-up/email")
async def signup(request: SignUpRequest) -> Dict[str, Any]:
    """
    Signup endpoint - creates a new user and returns JWT tokens
    """
    email = request.email
    password = request.password
    username = request.username

    # Import required modules
    from ..core.config import settings
    from datetime import timedelta

    def create_access_token(user_id: str, user_email: str):
        expiration = datetime.now(timezone.utc) + timedelta(minutes=30)
        token_data = {
            "sub": user_id,
            "email": user_email,
            "exp": expiration,
            "type": "access"
        }
        return jwt.encode(token_data, settings.better_auth_secret or settings.secret_key or "fallback-secret", algorithm="HS256")

    def create_refresh_token(user_id: str):
        expiration = datetime.now(timezone.utc) + timedelta(days=7)
        token_data = {
            "sub": user_id,
            "exp": expiration,
            "type": "refresh"
        }
        return jwt.encode(token_data, settings.better_auth_secret or settings.secret_key or "fallback-secret", algorithm="HS256")

    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.exec(select(User).where(User.email == email)).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Create new user
        user = User(
            email=email,
            hashed_password=hashed_password,
            username=username
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        # Create access and refresh tokens
        access_token = create_access_token(user.id, user.email)
        refresh_token = create_refresh_token(user.id)

        return {
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                }
            }
        }


@router.post("/refresh")
async def refresh_access_token(request: Request) -> Dict[str, Any]:
    """
    Refresh the access token using a valid refresh token
    """
    try:
        # Get refresh token from request body
        body = await request.json()
        refresh_token = body.get("refresh_token")

        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required"
            )

        # Verify the refresh token
        from ..core.config import settings
        payload = jwt.decode(refresh_token, settings.secret_key or "fallback-secret", algorithms=["HS256"])

        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Create a new access token
        with Session(engine) as session:
            user = session.exec(select(User).where(User.id == user_id)).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )

        from datetime import timedelta
        def create_access_token(user_id: str, user_email: str):
            expiration = datetime.now(timezone.utc) + timedelta(minutes=30)
            token_data = {
                "sub": user_id,
                "email": user_email,
                "exp": expiration,
                "type": "access"
            }
            return jwt.encode(token_data, settings.better_auth_secret or settings.secret_key or "fallback-secret", algorithm="HS256")

        new_access_token = create_access_token(user.id, user.email)

        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": 1800  # 30 minutes in seconds
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.post("/logout")
async def logout():
    """
    Logout endpoint - in a stateless system, this is mostly a frontend concern
    """
    return {
        "success": True,
        "message": "Successfully logged out"
    }


@router.get("/me")
async def get_current_user_info(current_user_id: str = Depends(get_current_user)):
    """
    Get current user information
    """
    # In a real implementation, you would fetch user details from the database
    # For now, returning minimal user info

    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == current_user_id)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "message": "User info retrieved successfully"
    }