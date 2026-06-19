from fastapi import APIRouter, Request, HTTPException, status, Depends, Body
from typing import Dict, Any
import bcrypt
from pydantic import BaseModel
from app.core.limiter import limiter
from ..db.session import engine  # Use database session
import sys
import os
# Add Backend root to path to import the main models file
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from models import User  # Use the original models file with singular table names
from sqlmodel import Session, select
import jwt
from jose import JWTError
from ..core.current_user import get_current_user  # Import the current user dependency
from app.core.auth_utils import create_access_token, create_refresh_token
from app.core.config import settings

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class SignUpRequest(BaseModel):
    email: str
    password: str
    username: str


@router.post("/sign-in/email")
@limiter.limit("5/minute")
async def login(request: Request, req_body: LoginRequest = Body(...)) -> Dict[str, Any]:
    email = req_body.email
    password = req_body.password

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
@limiter.limit("3/minute")
async def signup(request: Request, req_body: SignUpRequest = Body(...)) -> Dict[str, Any]:
    email = req_body.email
    password = req_body.password
    username = req_body.username

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
        payload = jwt.decode(refresh_token, settings.better_auth_secret, algorithms=["HS256"])

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

        new_access_token = create_access_token(user.id, user.email)

        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": 900  # 30 minutes in seconds
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