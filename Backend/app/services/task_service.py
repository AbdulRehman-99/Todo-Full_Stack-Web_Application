"""
Business logic for task operations
"""
from sqlmodel import Session, select
from typing import List, Optional
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    """
    Service class for task-related business logic
    """

    @staticmethod
    def create_task(session: Session, user_id: str, task_data: TaskCreate) -> Task:
        """
        Create a new task for a user

        Args:
            session: Database session
            user_id: ID of the user creating the task
            task_data: Task creation data

        Returns:
            Task: The created task object
        """
        # Validate input data
        if not task_data.title or len(task_data.title.strip()) == 0:
            raise ValueError("Task title is required")

        if len(task_data.title) > 255:
            raise ValueError("Task title must be less than 256 characters")

        # Create task object
        task = Task(
            user_id=user_id,
            title=task_data.title.strip(),
            description=task_data.description,
            completed=False  # Default to not completed
        )

        # Add to session and commit
        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def get_tasks_by_user_id(session: Session, user_id: str) -> List[Task]:
        """
        Get all tasks for a specific user

        Args:
            session: Database session
            user_id: ID of the user whose tasks to retrieve

        Returns:
            List[Task]: List of tasks for the user
        """
        # Query for tasks belonging to the user
        statement = select(Task).where(Task.user_id == user_id)
        tasks = session.exec(statement).all()

        return tasks

    @staticmethod
    def get_task_by_id(session: Session, user_id: str, task_id: int) -> Optional[Task]:
        """
        Get a specific task by ID for a user

        Args:
            session: Database session
            user_id: ID of the user
            task_id: ID of the task to retrieve

        Returns:
            Task or None: The task if found and belongs to the user
        """
        # Query for the specific task belonging to the user
        statement = select(Task).where(Task.user_id == user_id).where(Task.id == task_id)
        task = session.exec(statement).first()

        return task

    @staticmethod
    def update_task(session: Session, user_id: str, task_id: int, task_data: TaskUpdate) -> Optional[Task]:
        """
        Update a specific task for a user

        Args:
            session: Database session
            user_id: ID of the user
            task_id: ID of the task to update
            task_data: Task update data

        Returns:
            Task or None: Updated task if successful, None if not found
        """
        # Get the existing task
        task = TaskService.get_task_by_id(session, user_id, task_id)
        if not task:
            return None

        # Validate input data if provided
        if task_data.title is not None:
            if len(task_data.title) > 255:
                raise ValueError("Task title must be less than 256 characters")
            task.title = task_data.title.strip() if task_data.title.strip() else task.title

        if task_data.description is not None:
            task.description = task_data.description

        if task_data.completed is not None:
            task.completed = task_data.completed

        # Update timestamp
        from datetime import datetime
        task.updated_at = datetime.utcnow()

        # Commit changes
        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def delete_task(session: Session, user_id: str, task_id: int) -> bool:
        """
        Delete a specific task for a user

        Args:
            session: Database session
            user_id: ID of the user
            task_id: ID of the task to delete

        Returns:
            bool: True if task was deleted, False if not found
        """
        # Get the task to delete
        task = TaskService.get_task_by_id(session, user_id, task_id)
        if not task:
            return False

        # Delete the task
        session.delete(task)
        session.commit()

        return True