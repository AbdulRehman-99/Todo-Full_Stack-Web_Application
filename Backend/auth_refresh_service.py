from typing import Dict, Any, Tuple
from datetime import datetime, timedelta
import os
import sys
import os.path

# Add the parent directory to the path to import from Authentication folder
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from jwt_utils import verify_refresh_token, create_access_token

class TokenRefreshService:
    """
    Token Refresh Service for Python backend
    Handles refreshing access tokens using valid refresh tokens
    """

    @staticmethod
    async def refresh_token(refresh_token: str) -> Dict[str, str]:
        """
        Refreshes an access token using a valid refresh token
        """
        try:
            # Verify the refresh token
            payload = verify_refresh_token(refresh_token)

            # Extract user information from the refresh token
            user_id = payload.get('sub') or payload.get('user_id')
            email = payload.get('email', '')

            if not user_id:
                raise ValueError("Invalid refresh token: no user ID found")

            # Create a new access token
            new_access_token = create_access_token(user_id, email)

            return {
                "accessToken": new_access_token,
            }
        except Exception as e:
            raise Exception(f"Token refresh failed: {str(e)}")

    @staticmethod
    async def is_valid_refresh_token(refresh_token: str) -> bool:
        """
        Validates if a refresh token is still valid
        """
        try:
            await verify_refresh_token(refresh_token)
            return True
        except Exception:
            return False

    @staticmethod
    async def get_user_id_from_refresh_token(refresh_token: str) -> str:
        """
        Gets the user ID from a refresh token
        """
        try:
            payload = await verify_refresh_token(refresh_token)
            user_id = payload.get('sub') or payload.get('user_id')

            if not user_id:
                raise ValueError("Could not extract user ID from refresh token")

            return user_id
        except Exception as e:
            raise Exception(f"Could not extract user ID from refresh token: {str(e)}")