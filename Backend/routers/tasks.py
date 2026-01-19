from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from database import engine
from models import Task, TaskCreate, TaskUpdate, TaskPublic
from auth_middleware import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TaskPublic])
async def get_tasks(current_user_id: str = Depends(get_current_user)):
    """Get all tasks for the authenticated user"""
    with Session(engine) as session:
        # Filter tasks by the authenticated user's ID
        statement = select(Task).where(Task.user_id == current_user_id)
        tasks = session.exec(statement).all()
        return tasks

@router.post("/", response_model=TaskPublic)
async def create_task(task: TaskCreate, current_user_id: str = Depends(get_current_user)):
    """Create a new task for the authenticated user"""
    with Session(engine) as session:
        # Create task with the authenticated user's ID
        db_task = Task(
            title=task.title,
            description=task.description,
            completed=task.completed,
            user_id=current_user_id
        )

        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task

@router.get("/{task_id}", response_model=TaskPublic)
async def get_task(task_id: str, current_user_id: str = Depends(get_current_user)):
    """Get a specific task by ID for the authenticated user"""
    with Session(engine) as session:
        # Get task and ensure it belongs to the authenticated user
        statement = select(Task).where(Task.id == task_id).where(Task.user_id == current_user_id)
        task = session.exec(statement).first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or does not belong to the authenticated user"
            )

        return task

@router.put("/{task_id}", response_model=TaskPublic)
async def update_task(task_id: str, task_update: TaskUpdate, current_user_id: str = Depends(get_current_user)):
    """Update a specific task by ID for the authenticated user"""
    with Session(engine) as session:
        # Get task and ensure it belongs to the authenticated user
        statement = select(Task).where(Task.id == task_id).where(Task.user_id == current_user_id)
        db_task = session.exec(statement).first()

        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or does not belong to the authenticated user"
            )

        # Update task with provided values
        for field, value in task_update.dict(exclude_unset=True).items():
            setattr(db_task, field, value)

        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task

@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user_id: str = Depends(get_current_user)):
    """Delete a specific task by ID for the authenticated user"""
    with Session(engine) as session:
        # Get task and ensure it belongs to the authenticated user
        statement = select(Task).where(Task.id == task_id).where(Task.user_id == current_user_id)
        db_task = session.exec(statement).first()

        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or does not belong to the authenticated user"
            )

        session.delete(db_task)
        session.commit()
        return {"message": "Task deleted successfully"}

@router.patch("/{task_id}/complete", response_model=TaskPublic)
async def complete_task(task_id: str, completed: bool, current_user_id: str = Depends(get_current_user)):
    """Mark a task as completed/incompleted for the authenticated user"""
    with Session(engine) as session:
        # Get task and ensure it belongs to the authenticated user
        statement = select(Task).where(Task.id == task_id).where(Task.user_id == current_user_id)
        db_task = session.exec(statement).first()

        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or does not belong to the authenticated user"
            )

        db_task.completed = completed
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task