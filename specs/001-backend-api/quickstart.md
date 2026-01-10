# Quickstart Guide: Backend Todo API

## Prerequisites
- Python 3.11+
- pip package manager
- Access to Neon PostgreSQL database

## Setup Instructions

### 1. Clone and Navigate
```bash
cd Backend/
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the Backend/ directory:
```bash
NEON_DATABASE_URL="postgresql://username:password@ep-xxxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
BACKEND_CORS_ORIGINS="http://localhost:3005"
```

### 5. Initialize Database
```bash
# Run migrations
alembic upgrade head
```

### 6. Start the Server
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Task Management
- `GET /api/{user_id}/tasks` - Retrieve all tasks for a user
- `POST /api/{user_id}/tasks` - Create a new task for a user
- `GET /api/{user_id}/tasks/{task_id}` - Retrieve a specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update a specific task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete a specific task

### Example Requests

#### Create a Task
```bash
curl -X POST "http://localhost:8000/api/user123/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "Sample Task", "description": "Task description"}'
```

#### Get User's Tasks
```bash
curl -X GET "http://localhost:8000/api/user123/tasks"
```

## Running Tests
```bash
pytest tests/
```

## Development Commands
```bash
# Run with auto-reload
uvicorn app.main:app --reload

# Run tests with coverage
pytest --cov=app

# Format code
black app/
```