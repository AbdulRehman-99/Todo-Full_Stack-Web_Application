# API Contract: Todo Application

## Overview
This contract defines the API endpoints that the frontend will interact with in future phases when a backend is implemented. For the current phase, these serve as placeholders in the frontend API client.

## Base URL
`http://localhost:8000/api/v1` (to be configured)

## Authentication
Bearer token authentication (to be implemented in future phases)

## Endpoints

### GET /tasks
Retrieve all tasks
- **Response**: `200 OK`
  ```json
  {
    "tasks": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "completed": "boolean",
        "createdAt": "datetime",
        "updatedAt": "datetime"
      }
    ]
  }
  ```

### POST /tasks
Create a new task
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "completed": false,
    "createdAt": "datetime"
  }
  ```

### GET /tasks/{id}
Retrieve a specific task
- **Parameters**: `id` (path parameter)
- **Response**: `200 OK`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "completed": "boolean",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```

### PUT /tasks/{id}
Update a task
- **Parameters**: `id` (path parameter)
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "completed": "boolean"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "completed": "boolean",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```

### PATCH /tasks/{id}/toggle
Toggle task completion status
- **Parameters**: `id` (path parameter)
- **Response**: `200 OK`
  ```json
  {
    "id": "string",
    "completed": "boolean"
  }
  ```

### DELETE /tasks/{id}
Delete a task
- **Parameters**: `id` (path parameter)
- **Response**: `204 No Content`