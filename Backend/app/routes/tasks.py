"""
API routes for task management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlmodel import Session
from app.db.session import get_session
from app.core.current_user import get_current_user
from app.models.task import User, Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.services.task_service import TaskService


# Create the router
router = APIRouter()


@router.get("/", response_model=List[TaskResponse])
def get_user_tasks(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all tasks for the specified user.

    Args:
        user_id: The ID of the user whose tasks to retrieve
        current_user: The authenticated user making the request
        session: Database session

    Returns:
        List[TaskResponse]: List of tasks for the user

    Raises:
        HTTPException: If the user tries to access tasks for a different user
    """
    # Verify that the user is accessing their own tasks
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own tasks"
        )

    # Get tasks for the user
    tasks = TaskService.get_tasks_by_user_id(session, user_id)

    # Return tasks in the required format
    return [
        TaskResponse(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
        for task in tasks
    ]


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the specified user.

    Args:
        user_id: The ID of the user creating the task
        task_data: Task creation data
        current_user: The authenticated user making the request
        session: Database session

    Returns:
        TaskResponse: The created task

    Raises:
        HTTPException: If the user tries to create a task for a different user
    """
    # Verify that the user is creating a task for themselves
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create tasks for yourself"
        )

    try:
        # Create the task
        task = TaskService.create_task(session, user_id, task_data)

        # Return the created task
        return TaskResponse(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific task by ID for the specified user.

    Args:
        user_id: The ID of the user whose task to retrieve
        task_id: The ID of the task to retrieve
        current_user: The authenticated user making the request
        session: Database session

    Returns:
        TaskResponse: The requested task

    Raises:
        HTTPException: If the task is not found or user tries to access another user's task
    """
    # Verify that the user is accessing their own task
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own tasks"
        )

    # Get the task
    task = TaskService.get_task_by_id(session, user_id, task_id)

    # Check if task exists
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Return the task
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at
    )


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a specific task by ID for the specified user.

    Args:
        user_id: The ID of the user whose task to update
        task_id: The ID of the task to update
        task_data: Task update data
        current_user: The authenticated user making the request
        session: Database session

    Returns:
        TaskResponse: The updated task

    Raises:
        HTTPException: If the task is not found or user tries to update another user's task
    """
    # Verify that the user is updating their own task
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own tasks"
        )

    try:
        # Update the task
        updated_task = TaskService.update_task(session, user_id, task_id, task_data)

        # Check if task exists
        if not updated_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Return the updated task
        return TaskResponse(
            id=updated_task.id,
            user_id=updated_task.user_id,
            title=updated_task.title,
            description=updated_task.description,
            completed=updated_task.completed,
            created_at=updated_task.created_at,
            updated_at=updated_task.updated_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a specific task by ID for the specified user.

    Args:
        user_id: The ID of the user whose task to delete
        task_id: The ID of the task to delete
        current_user: The authenticated user making the request
        session: Database session

    Raises:
        HTTPException: If the task is not found or user tries to delete another user's task
    """
    # Verify that the user is deleting their own task
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own tasks"
        )

    # Delete the task
    deleted = TaskService.delete_task(session, user_id, task_id)

    # Check if task existed
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Return 204 No Content
    return