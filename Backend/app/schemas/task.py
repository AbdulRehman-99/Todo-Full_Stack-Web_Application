"""
Pydantic schemas for task API requests and responses
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TaskBase(BaseModel):
    """Base schema for task with common fields"""
    title: str
    description: Optional[str] = None


class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    title: str
    description: Optional[str] = None

    class Config:
        # Allow ORM mode for SQLModel integration
        from_attributes = True


class TaskUpdate(BaseModel):
    """Schema for updating an existing task"""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

    class Config:
        # Allow ORM mode for SQLModel integration
        from_attributes = True


class TaskResponse(TaskBase):
    """Schema for task response with additional fields"""
    id: int = Field(alias="id")
    user_id: str = Field(alias="userId")
    completed: bool = Field(alias="completed")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        # Allow ORM mode for SQLModel integration
        from_attributes = True
        # Enable alias generation to convert snake_case to camelCase
        populate_by_name = True


class TaskListResponse(BaseModel):
    """Schema for list of tasks response"""
    tasks: list[TaskResponse]
    total: int