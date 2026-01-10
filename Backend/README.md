# Todo Backend API

This is the backend service for the Todo application, built with FastAPI and SQLModel.

## Features

- RESTful API endpoints for task management
- User isolation - each user can only access their own tasks
- JWT-ready authentication system (future implementation)
- Data persistence with Neon PostgreSQL
- CORS configured for frontend integration

## Tech Stack

- **Framework**: FastAPI
- **ORM**: SQLModel (combines SQLAlchemy and Pydantic)
- **Database**: Neon PostgreSQL
- **Authentication**: JWT-ready (currently using placeholder)
- **Testing**: pytest

## Folder Structure

```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI entry point
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py          # Settings and configuration
│   │   └── current_user.py    # Auth abstraction for get_current_user
│   ├── db/
│   │   ├── __init__.py
│   │   └── session.py         # Database connection and session management
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py            # SQLModel for Task entity
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py            # Pydantic models for request/response
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_service.py    # Business logic for task operations
│   └── routes/
│       ├── __init__.py
│       └── tasks.py           # API routes for /api/{user_id}/tasks
├── tests/
│   ├── __init__.py
│   ├── conftest.py            # Test fixtures and configurations
│   ├── unit/
│   │   ├── __init__.py
│   │   └── test_task_service.py   # Unit tests for task service
│   └── integration/
│       ├── __init__.py
│       └── test_task_routes.py    # Integration tests for task routes
├── requirements.txt
└── alembic/
    └── versions/              # Migration files
```

## Installation

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
   BACKEND_CORS_ORIGINS=http://localhost:3005
   ```

## Running the Application

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## API Endpoints

- `GET /api/{user_id}/tasks` - Get all tasks for a user
- `POST /api/{user_id}/tasks` - Create a new task for a user
- `GET /api/{user_id}/tasks/{task_id}` - Get a specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update a specific task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete a specific task

## Running Tests

```bash
# Run all tests
pytest

# Run unit tests
pytest tests/unit/

# Run integration tests
pytest tests/integration/
```

## Authentication

The backend is designed to be JWT-ready. Currently, a placeholder authentication system is in place that will be replaced with actual JWT validation in the future. All routes require a valid user context through the `get_current_user()` function.

## Environment Variables

- `DATABASE_URL`: PostgreSQL database URL
- `BACKEND_CORS_ORIGINS`: Origins allowed for CORS (default: http://localhost:3005)
- `SECRET_KEY`: Secret key for JWT (future use)
- `ALGORITHM`: Algorithm for JWT (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 30)