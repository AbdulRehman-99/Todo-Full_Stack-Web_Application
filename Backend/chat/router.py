from fastapi import APIRouter
from .endpoints import router as chat_endpoints_router


def get_chat_router():
    """
    Create and return the chat API router with all endpoints.

    Returns:
        APIRouter: Configured router with all chat endpoints
    """
    chat_router = APIRouter(prefix="/api", tags=["chat"])

    # Include the chat endpoints
    chat_router.include_router(chat_endpoints_router)

    return chat_router