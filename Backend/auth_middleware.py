from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import sys
import os.path

# Add the parent directory to the path to import from Authentication folder
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from jwt_utils import verify_access_token, extract_user_id_from_token_payload

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to get the current authenticated user from JWT token
    """
    token = credentials.credentials

    try:
        # Verify the JWT token
        payload = verify_access_token(token)

        # Extract user ID from the token payload
        user_id = extract_user_id_from_token_payload(payload)

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )