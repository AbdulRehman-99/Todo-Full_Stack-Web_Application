from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional
from datetime import datetime
import os
from enum import Enum


class RoleType(str, Enum):
    user = "user"
    assistant = "assistant"


class ConversationTask(SQLModel, table=True):
    """Task model for storing user tasks in conversations."""
    __tablename__ = "conversation_tasks"  # Different table name to avoid conflicts

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Conversation(SQLModel, table=True):
    """Conversation model for storing conversation sessions."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    """Message model for storing conversation messages."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str  # 'user' or 'assistant'
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


