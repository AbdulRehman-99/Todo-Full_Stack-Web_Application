"""
Integration tests for the task routes
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import engine
from sqlmodel import Session, delete
from app.models.task import Task


@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def clean_database():
    """Clean up the database before each test"""
    with Session(engine) as session:
        # Delete all tasks
        stmt = delete(Task)
        session.exec(stmt)
        session.commit()


def test_create_and_get_task(client):
    """Test creating a task and retrieving it"""
    # Create a task
    user_id = "test-user-123"
    create_response = client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Test Task", "description": "Test Description"}
    )

    assert create_response.status_code == 201
    created_task = create_response.json()
    assert created_task["title"] == "Test Task"
    assert created_task["description"] == "Test Description"
    assert created_task["completed"] is False

    task_id = created_task["id"]

    # Get the created task
    get_response = client.get(f"/api/{user_id}/tasks/{task_id}")
    assert get_response.status_code == 200
    retrieved_task = get_response.json()
    assert retrieved_task["id"] == task_id
    assert retrieved_task["title"] == "Test Task"


def test_get_all_tasks_for_user(client):
    """Test getting all tasks for a user"""
    user_id = "test-user-123"

    # Create multiple tasks
    client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Task 1", "description": "Description 1"}
    )
    client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Task 2", "description": "Description 2"}
    )

    # Get all tasks for the user
    response = client.get(f"/api/{user_id}/")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 2
    titles = [task["title"] for task in tasks]
    assert "Task 1" in titles
    assert "Task 2" in titles


def test_update_task(client):
    """Test updating a task"""
    user_id = "test-user-123"

    # Create a task
    create_response = client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Original Task", "description": "Original Description"}
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Update the task
    update_response = client.put(
        f"/api/{user_id}/tasks/{task_id}",
        json={"title": "Updated Task", "completed": True}
    )
    assert update_response.status_code == 200
    updated_task = update_response.json()
    assert updated_task["title"] == "Updated Task"
    assert updated_task["completed"] is True


def test_delete_task(client):
    """Test deleting a task"""
    user_id = "test-user-123"

    # Create a task
    create_response = client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Task to Delete", "description": "Will be deleted"}
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Verify task exists
    get_response = client.get(f"/api/{user_id}/tasks/{task_id}")
    assert get_response.status_code == 200

    # Delete the task
    delete_response = client.delete(f"/api/{user_id}/tasks/{task_id}")
    assert delete_response.status_code == 204

    # Verify task is gone
    get_deleted_response = client.get(f"/api/{user_id}/tasks/{task_id}")
    assert get_deleted_response.status_code == 404


def test_user_isolation(client):
    """Test that users can only access their own tasks"""
    user1_id = "user-1"
    user2_id = "user-2"

    # Create a task for user 1
    create_response = client.post(
        f"/api/{user1_id}/tasks",
        json={"title": "User 1 Task", "description": "Only for user 1"}
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Try to access user 1's task as user 2 (should fail)
    access_response = client.get(f"/api/{user2_id}/tasks/{task_id}")
    assert access_response.status_code == 403  # Forbidden