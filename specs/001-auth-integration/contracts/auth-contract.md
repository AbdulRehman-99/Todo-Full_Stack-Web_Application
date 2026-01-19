# API Contract: Authentication Endpoints

## Overview
This document defines the API contracts for authentication endpoints that will integrate with Better Auth and JWT-based authentication. These endpoints are for backend API integration only and do not include UI implementation (UI is handled separately in the frontend). This component focuses on the authentication infrastructure between frontend and backend.

## Authentication Endpoints

### POST /api/auth/login
**Purpose**: Authenticate user and return JWT token

**Request**:
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "user_password"
}
```

**Response**:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": "user-uuid-string",
    "email": "user@example.com",
    "username": "username"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `422 Unprocessable Entity`: Invalid request format

### POST /api/auth/logout
**Purpose**: Log out user and invalidate tokens

**Request**:
```
POST /api/auth/logout
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Response**:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Successfully logged out"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token

### POST /api/auth/refresh
**Purpose**: Refresh access token using refresh token

**Request**:
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response**:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired refresh token

## Protected Endpoints

### GET /api/tasks
**Purpose**: Retrieve user's tasks (requires authentication)

**Request**:
```
GET /api/tasks
Authorization: Bearer {access_token}
```

**Response**:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "tasks": [
    {
      "id": "task-uuid",
      "title": "Sample task",
      "description": "Sample description",
      "user_id": "user-uuid-string",
      "completed": false,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token

### POST /api/tasks
**Purpose**: Create a new task (requires authentication)

**Request**:
```
POST /api/tasks
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "New task",
  "description": "Task description"
}
```

**Response**:
```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "new-task-uuid",
  "title": "New task",
  "description": "Task description",
  "user_id": "authenticated-user-uuid",
  "completed": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token

### GET /api/users/me
**Purpose**: Retrieve current user's information (requires authentication)

**Request**:
```
GET /api/users/me
Authorization: Bearer {access_token}
```

**Response**:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "user-uuid-string",
  "email": "user@example.com",
  "username": "username",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token

## Authentication Headers

All protected endpoints require the `Authorization` header with Bearer token:

```
Authorization: Bearer {jwt_token_here}
```

## JWT Claims Structure

Valid JWT tokens must contain these claims:

```json
{
  "sub": "user-uuid-string",        // Subject (user ID)
  "exp": 1678886400,               // Expiration time (Unix timestamp)
  "iat": 1678884600,               // Issued at time (Unix timestamp)
  "jti": "token-uuid",             // JWT ID (for identification)
  "type": "access"                 // Token type
}
```

## Error Response Format

All error responses follow this format:

```json
{
  "detail": "Human-readable error message",
  "error_code": "ERROR_CODE_STRING",
  "timestamp": "2023-01-01T00:00:00Z"
}
```