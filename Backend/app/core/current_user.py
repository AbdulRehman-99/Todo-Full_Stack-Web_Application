"""
Authentication abstraction for the Backend API
This module provides a get_current_user function that is JWT-ready
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.db.session import get_session
from app.models.task import User


def get_current_user(session: Session = Depends(get_session)) -> User:
    """
    Get the current authenticated user.

    This function is designed to be JWT-ready. Currently it returns a placeholder
    user, but can be easily extended to JWT validation without changing
    endpoint signatures.

    Args:
        session: Database session dependency

    Returns:
        User: The authenticated user object

    Raises:
        HTTPException: If user is not authenticated
    """
    # Placeholder implementation - in the future this will validate JWT token
    # and return the actual user based on token information
    # For now, we'll return a placeholder user for development
    placeholder_user_id = "demo-user-123"

    # In a real implementation, we would extract user info from JWT token
    # For now, we'll create a dummy user object
    # Since we don't have a User model defined yet, we'll return a dict
    # that matches the expected User structure
    return User(
        user_id=placeholder_user_id,
        # Other user fields would be populated from JWT claims in the future
    )


def get_current_user_optional(session: Session = Depends(get_session)) -> Optional[User]:
    """
    Get the current user if authenticated, otherwise return None.

    This is useful for endpoints that work differently based on authentication.

    Args:
        session: Database session dependency

    Returns:
        User or None: The authenticated user object or None if not authenticated
    """
    try:
        return get_current_user(session)
    except HTTPException:
        return None