from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from typing import Dict, Any
from datetime import timedelta
import uuid
import sys
import os.path
import bcrypt
from pydantic import BaseModel

from auth_refresh_service import TokenRefreshService
from auth_middleware import get_current_user
from jwt_utils import create_access_token, create_refresh_token
from database import engine
from models import User
from sqlmodel import Session, select

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

    with Session(engine) as session:
        # Find user by email
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
        user = User(email=email, hashed_password=hashed_password, username=username)
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

        # Use the TokenRefreshService to refresh the token
        result = await TokenRefreshService.refresh_token(refresh_token)

        return {
            "access_token": result["accessToken"],
            "token_type": "bearer",
            "expires_in": 900  # 15 minutes in seconds
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
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
    return {
        "id": current_user_id,
        "message": "User info retrieved successfully"
    }