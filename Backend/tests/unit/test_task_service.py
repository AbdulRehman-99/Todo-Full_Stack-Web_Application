"""
Unit tests for the task service
"""
import pytest
from unittest.mock import Mock, MagicMock
from sqlmodel import Session
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.task_service import TaskService


class TestTaskService:
    """
    Unit tests for TaskService methods
    """

    def test_create_task_success(self):
        """Test successful task creation"""
        # Arrange
        mock_session = Mock(spec=Session)
        user_id = "test-user-123"
        task_data = TaskCreate(title="Test Task", description="Test Description")

        # Act
        result = TaskService.create_task(mock_session, user_id, task_data)

        # Assert
        assert result.user_id == user_id
        assert result.title == task_data.title
        assert result.description == task_data.description
        assert result.completed is False  # Default value

    def test_create_task_validation_error_empty_title(self):
        """Test task creation with empty title raises error"""
        # Arrange
        mock_session = Mock(spec=Session)
        user_id = "test-user-123"
        task_data = TaskCreate(title="", description="Test Description")

        # Act & Assert
        with pytest.raises(ValueError, match="Task title is required"):
            TaskService.create_task(mock_session, user_id, task_data)

    def test_create_task_validation_error_long_title(self):
        """Test task creation with long title raises error"""
        # Arrange
        mock_session = Mock(spec=Session)
        user_id = "test-user-123"
        long_title = "t" * 256  # Exceeds 255 character limit
        task_data = TaskCreate(title=long_title, description="Test Description")

        # Act & Assert
        with pytest.raises(ValueError, match="Task title must be less than 256 characters"):
            TaskService.create_task(mock_session, user_id, task_data)

    def test_get_tasks_by_user_id(self):
        """Test getting tasks by user ID"""
        # Arrange
        mock_session = Mock(spec=Session)
        user_id = "test-user-123"
        mock_tasks = [
            Task(id=1, user_id=user_id, title="Task 1", description="Desc 1", completed=False),
            Task(id=2, user_id=user_id, title="Task 2", description="Desc 2", completed=True)
        ]
        mock_session.exec.return_value.all.return_value = mock_tasks

        # Act
        result = TaskService.get_tasks_by_user_id(mock_session, user_id)

        # Assert
        assert len(result) == 2
        assert all(task.user_id == user_id for task in result)

    def test_get_task_by_id_found(self):
        """Test getting a specific task that exists"""
        # Arrange
        mock_session = Mock(spec=Session)
        user_id = "test-user-123"
        task_id = 1
        expected_task = Task(id=task_id, user_id=user_id, title="Task 1", description="Desc 1", completed=False)
        mock_exec_result = Mock()
        mock_session.exec.return_value = mock_exec_result
        mock_exec_result.first.return_value = expected_task

        # Act
        result = TaskService.get_task_by_id(mock_session, user_id, task_id)

        # Assert
        assert result == expected_task

    def test_get_task_by_id_not_found(self):
        """Test getting a specific task that doesn't exist"""
        # Arrange
        mock_session = Mock(spec=Session)
        user_id = "test-user-123"
        task_id = 999
        mock_exec_result = Mock()
        mock_session.exec.return_value = mock_exec_result
        mock_exec_result.first.return_value = None

        # Act
        result = TaskService.get_task_by_id(mock_session, user_id, task_id)

        # Assert
        assert result is None

    def test_update_task_success(self):
        """Test successful task update"""
        # Arrange
        mock_session = Mock(spec=Session)
        user_id = "test-user-123"
        task_id = 1
        existing_task = Task(id=task_id, user_id=user_id, title="Old Title", description="Old Desc", completed=False)

        # Mock the get_task_by_id method to return the existing task
        original_method = TaskService.get_task_by_id
        TaskService.get_task_by_id = Mock(return_value=existing_task)

        task_update_data = TaskUpdate(title="New Title", completed=True)

        # Act
        result = TaskService.update_task(mock_session, user_id, task_id, task_update_data)

        # Restore the original method
        TaskService.get_task_by_id = original_method

        # Assert
        assert result.title == "New Title"
        assert result.completed is True

    def test_update_task_not_found(self):
        """Test updating a task that doesn't exist"""
        # Arrange
        mock_session = Mock(spec=Session)
        user_id = "test-user-123"
        task_id = 999

        # Mock the get_task_by_id method to return None
        original_method = TaskService.get_task_by_id
        TaskService.get_task_by_id = Mock(return_value=None)

        task_update_data = TaskUpdate(title="New Title")

        # Act
        result = TaskService.update_task(mock_session, user_id, task_id, task_update_data)

        # Restore the original method
        TaskService.get_task_by_id = original_method

        # Assert
        assert result is None

    def test_delete_task_success(self):
        """Test successful task deletion"""
        # Arrange
        mock_session = Mock(spec=Session)
        user_id = "test-user-123"
        task_id = 1
        existing_task = Task(id=task_id, user_id=user_id, title="Title", description="Desc", completed=False)

        # Mock the get_task_by_id method to return the existing task
        original_method = TaskService.get_task_by_id
        TaskService.get_task_by_id = Mock(return_value=existing_task)

        # Act
        result = TaskService.delete_task(mock_session, user_id, task_id)

        # Restore the original method
        TaskService.get_task_by_id = original_method

        # Assert
        assert result is True
        mock_session.delete.assert_called_once_with(existing_task)

    def test_delete_task_not_found(self):
        """Test deleting a task that doesn't exist"""
        # Arrange
        mock_session = Mock(spec=Session)
        user_id = "test-user-123"
        task_id = 999

        # Mock the get_task_by_id method to return None
        original_method = TaskService.get_task_by_id
        TaskService.get_task_by_id = Mock(return_value=None)

        # Act
        result = TaskService.delete_task(mock_session, user_id, task_id)

        # Restore the original method
        TaskService.get_task_by_id = original_method

        # Assert
        assert result is False
        mock_session.delete.assert_not_called()