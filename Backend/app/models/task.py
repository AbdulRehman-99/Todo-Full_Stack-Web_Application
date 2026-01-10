"""
SQLModel models for the Todo application
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime


# Forward reference for the relationship
class Task(SQLModel, table=True):
    """
    Task model representing a user's todo item
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # Foreign key reference to user
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# User model (referenced in the data model)
class User(SQLModel):
    """
    User model representing an authenticated user
    This is a simplified representation for the purpose of this implementation
    """
    user_id: str

    def __init__(self, user_id: str):
        self.user_id = user_id