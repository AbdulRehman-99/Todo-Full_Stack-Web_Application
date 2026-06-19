import json
import logging
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import asyncio
import uuid

logger = logging.getLogger(__name__)

from app.core.current_user import get_current_user
from mcp.server import mcp_server
from Model.conversation_models import Conversation, Message, RoleType
from app.db.session import get_session
from sqlmodel import Session, select
from services.ai_chat_service import ai_chat_service

# Define the router for this module
router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: int
    timestamp: str


@router.post("/{user_id}", response_model=ChatResponse)
async def chat_endpoint(
    user_id: str,
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Chat endpoint that handles user messages and returns AI responses.

    Args:
        user_id: The ID of the user (should match the authenticated user)
        request: The chat request containing the message and optional conversation ID
        current_user: The authenticated user information

    Returns:
        ChatResponse containing the AI response, conversation ID, and timestamp
    """
    # Verify that the user_id in the path matches the authenticated user
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: User ID mismatch")

    # Get database session
    session_gen = get_session()
    session: Session = next(session_gen)

    try:
        # Process the chat message through the AI chat service
        result = await ai_chat_service.process_chat_message(
            user_id=user_id,
            message_content=request.message,
            conversation_id=request.conversation_id,
            session=session
        )

        return ChatResponse(
            response=result["response"],
            conversation_id=result["conversation_id"],
            timestamp=result["timestamp"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")
    finally:
        # Close the session
        session.close()


@router.post("/{user_id}/chat/stream")
async def chat_stream_endpoint(
    user_id: str,
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: User ID mismatch")

    session_gen = get_session()
    session: Session = next(session_gen)

    async def event_generator():
        try:
            yield f"data: {json.dumps({'type': 'start', 'conversation_id': request.conversation_id})}\n\n"

            async for token in ai_chat_service.process_chat_message_streamed(
                user_id=user_id,
                message_content=request.message,
                conversation_id=request.conversation_id,
                session=session
            ):
                yield f"data: {json.dumps({'type': 'token', 'data': token})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'data': 'Something went wrong. Please try again.'})}\n\n"
        finally:
            session.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


# Additional helper functions for conversation management
@router.get("/{user_id}/conversations")
async def get_user_conversations(
    user_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get all conversations for a user.
    """
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: User ID mismatch")

    session_gen = get_session()
    session: Session = next(session_gen)

    try:
        conversations = session.exec(
            select(Conversation).where(Conversation.user_id == user_id)
        ).all()

        return [{"id": conv.id, "created_at": conv.created_at, "updated_at": conv.updated_at} for conv in conversations]
    finally:
        session.close()


@router.get("/{user_id}/conversation/{conversation_id}")
async def get_conversation_history(
    user_id: str,
    conversation_id: int,
    current_user: str = Depends(get_current_user)
):
    """
    Get the history of a specific conversation.
    """
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: User ID mismatch")

    session_gen = get_session()
    session: Session = next(session_gen)

    try:
        # Verify conversation belongs to user
        conversation = session.exec(
            select(Conversation).where(Conversation.id == conversation_id).where(Conversation.user_id == user_id)
        ).first()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Get messages for the conversation
        messages = session.exec(
            select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at)
        ).all()

        return [{
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at
        } for msg in messages]
    finally:
        session.close()