# Backend Specification: AI-Todo-Chatbot

## Overview
This specification defines ALL backend logic for the AI-Todo-Chatbot. The system provides an intelligent chat interface that allows users to manage their tasks through natural language conversations with an AI agent.

## Scope
- Backend logic only (no frontend/UI)
- State management for conversations and messages
- AI agent integration with MCP tools
- Task management via AI commands
- Authentication and authorization
- Database persistence

## Locked Technologies
- Backend: Python FastAPI
- AI Framework: OpenAI Agents SDK
- MCP Server: Official MCP SDK only
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL

## Functional Requirements

### 1. Chat Endpoint
- **Endpoint**: `POST /api/{user_id}/chat`
- **Method**: Stateless POST request
- **Authentication**: JWT token validation using Better Auth
- **Response**: JSON containing assistant response and conversation_id
- **Headers**: Authorization Bearer token required

### 2. Conversation Management
- **Persistence**: All conversations stored in database
- **History Loading**: Fetch entire conversation history before processing each request
- **State Tracking**: Maintain conversation context across messages
- **User Isolation**: Conversations scoped to authenticated user
- **Context Window Management**: Use sliding window of last N messages to maintain context when conversation history becomes too large for API limits
- **Concurrent Conversations**: Allow multiple concurrent conversations per user with unique conversation IDs

### 3. Message Handling
- **Storage**: All user and assistant messages persisted
- **Ordering**: Messages ordered chronologically within conversation
- **Roles**: Distinguish between user and assistant messages
- **Timestamps**: Created_at and updated_at tracking

### 4. AI Agent Integration
- **Framework**: OpenAI Agents SDK
- **Execution**: Agent runs on each chat request
- **Context**: Agent receives full conversation history
- **Output**: Agent generates natural language response
- **Operation Confirmations**: AI agent always provides clear confirmation messages to user for all task operations (add/update/complete/delete)

### 5. MCP Tool Integration
- **Exclusive Access**: AI agent performs all task operations via MCP tools
- **No Direct DB Access**: Agent forbidden from direct database interaction
- **Tool Interface**: Standardized MCP tool contracts
- **State Persistence**: All tool operations save state to database

### 6. MCP Tools Definition
#### add_task
- **Purpose**: Create new task
- **Input**: title (string), description (optional string)
- **Output**: task_id (string)
- **Validation**: Title required, length limits enforced
- **Persistence**: New task saved to database

#### list_tasks
- **Purpose**: Retrieve all user tasks
- **Input**: None
- **Output**: Array of task objects with id, title, description, completed status
- **Filtering**: Only current user's tasks returned
- **Sorting**: Tasks sorted by creation date (newest first)

#### update_task
- **Purpose**: Modify existing task
- **Input**: task_id (string), title (optional), description (optional), completed (optional)
- **Output**: Updated task object
- **Validation**: Task must exist and belong to user
- **Persistence**: Updated task saved to database

#### complete_task
- **Purpose**: Mark task as completed
- **Input**: task_id (string)
- **Output**: Updated task object
- **Validation**: Task must exist and belong to user
- **Persistence**: Task completion status updated in database

#### delete_task
- **Purpose**: Remove task from user's list
- **Input**: task_id (string)
- **Output**: Success boolean
- **Validation**: Task must exist and belong to user
- **Persistence**: Task marked as deleted or removed from database

### 7. MCP Tool Constraints
- **Stateless Operations**: Tools do not maintain state between calls
- **Database Persistence**: All changes immediately saved to database
- **User Scoping**: Tools operate only on user's own tasks
- **Input Validation**: All inputs validated before processing
- **Error Handling**: Proper error responses for invalid operations

### 8. Database Interaction Rules
- **Agent Prohibition**: AI agent cannot access database directly
- **Tool Mediation**: All database operations through MCP tools
- **Transaction Safety**: Database operations wrapped in transactions
- **Consistency**: ACID properties maintained for all operations

### 9. Authentication & Authorization
- **JWT Enforcement**: All chat requests require valid JWT token
- **Better Auth Integration**: Leverage existing Better Auth infrastructure
- **User Context**: Extract user_id from JWT for scoping operations
- **Access Control**: Users can only access their own data
- **Token Propagation**: Validate JWT at API entry point and pass user context to MCP tools (no need to validate JWT in each individual tool)

### 10. Error Handling
- **Task Not Found**: Return appropriate error when task doesn't exist
- **Invalid Input**: Validate all inputs and return descriptive errors
- **Auth Errors**: Proper HTTP status codes for authentication failures
- **Graceful Degradation**: System continues operating despite individual errors
- **AI Agent Error Strategy**: When receiving invalid requests (e.g., non-existent task IDs), AI agent responds with clear error message and suggests alternatives to the user

## Data Models

### Task Model
```python
class Task(SQLModel, table=True):
    user_id: str
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default=datetime.utcnow())
```

### Conversation Model
```python
class Conversation(SQLModel, table=True):
    user_id: str
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default=datetime.utcnow())
```

### Message Model
```python
class Message(SQLModel, table=True):
    user_id: str
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int
    role: str  # 'user' or 'assistant'
    content: str
    created_at: datetime = Field(default=datetime.utcnow())
```

## Conversation Flow

### Request Processing
1. **Authenticate**: Validate JWT token and extract user_id
2. **Fetch History**: Load complete conversation history from database
3. **Store Input**: Save user message to database
4. **Run Agent**: Execute AI agent with MCP tools and conversation context
5. **Process Response**: Agent uses MCP tools to manage tasks
6. **Store Output**: Save assistant response to database
7. **Return Result**: Send response and conversation_id to client

## API Contract

### POST /api/{user_id}/chat
**Request Headers:**
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "message": "Natural language instruction",
  "conversation_id": "Optional conversation ID"
}
```

**Success Response (200):**
```json
{
  "response": "AI-generated response",
  "conversation_id": "Assigned conversation ID",
  "timestamp": "ISO timestamp"
}
```

**Error Responses:**
- 401: Invalid or expired JWT token
- 403: Insufficient permissions
- 404: Conversation not found
- 422: Invalid input data
- 500: Internal server error

## MCP Tools Specification

### Tool Interface Standards
All MCP tools must conform to the following interface:

#### Input Format
```json
{
  "method": "tool_name",
  "params": {
    // Tool-specific parameters
  },
  "id": "unique_request_id"
}
```

#### Output Format
```json
{
  "result": {
    "success": true,
    "data": {},
    "message": "Optional success message"
  },
  "id": "matching_request_id"
}
```

#### Error Format
```json
{
  "error": {
    "code": "error_code",
    "message": "Descriptive error message",
    "details": {}
  },
  "id": "matching_request_id"
}
```

### Defined Tools

#### 1. add_task
**Description**: Creates a new task for the authenticated user.

**Input Parameters**:
```json
{
  "title": "Required task title (string, 1-200 characters)",
  "description": "Optional task description (string, 0-1000 characters)"
}
```

**Successful Output**:
```json
{
  "result": {
    "success": true,
    "data": {
      "task_id": 123,
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "created_at": "ISO timestamp"
    },
    "message": "Task created successfully"
  }
}
```

**Error Cases**:
- `INVALID_INPUT`: Title missing or exceeds character limits
- `AUTH_ERROR`: User authentication failed
- `DATABASE_ERROR`: Failed to save task to database

#### 2. list_tasks
**Description**: Retrieves all tasks for the authenticated user.

**Input Parameters**:
```json
{
  "filter_completed": false,  // Optional: true to show only incomplete tasks
  "limit": 50                 // Optional: max number of tasks to return (default: 100, max: 1000)
}
```

**Successful Output**:
```json
{
  "result": {
    "success": true,
    "data": {
      "tasks": [
        {
          "id": 123,
          "title": "Task title",
          "description": "Task description",
          "completed": false,
          "created_at": "ISO timestamp",
          "updated_at": "ISO timestamp"
        }
      ],
      "total_count": 5
    },
    "message": "Tasks retrieved successfully"
  }
}
```

**Error Cases**:
- `AUTH_ERROR`: User authentication failed
- `DATABASE_ERROR`: Failed to retrieve tasks from database

#### 3. update_task
**Description**: Updates an existing task for the authenticated user.

**Input Parameters**:
```json
{
  "task_id": 123,                    // Required: Task ID to update
  "title": "Optional new title",     // Optional: new title (string, 1-200 characters)
  "description": "Optional new description", // Optional: new description (string, 0-1000 characters)
  "completed": true                  // Optional: new completion status (boolean)
}
```

**Successful Output**:
```json
{
  "result": {
    "success": true,
    "data": {
      "id": 123,
      "title": "Updated title",
      "description": "Updated description",
      "completed": true,
      "updated_at": "ISO timestamp"
    },
    "message": "Task updated successfully"
  }
}
```

**Error Cases**:
- `TASK_NOT_FOUND`: Task with given ID doesn't exist or doesn't belong to user
- `INVALID_INPUT`: Provided parameters fail validation
- `AUTH_ERROR`: User authentication failed
- `DATABASE_ERROR`: Failed to update task in database

#### 4. complete_task
**Description**: Marks a task as completed for the authenticated user.

**Input Parameters**:
```json
{
  "task_id": 123  // Required: Task ID to mark as completed
}
```

**Successful Output**:
```json
{
  "result": {
    "success": true,
    "data": {
      "id": 123,
      "title": "Task title",
      "completed": true,
      "updated_at": "ISO timestamp"
    },
    "message": "Task marked as completed"
  }
}
```

**Error Cases**:
- `TASK_NOT_FOUND`: Task with given ID doesn't exist or doesn't belong to user
- `AUTH_ERROR`: User authentication failed
- `DATABASE_ERROR`: Failed to update task in database

#### 5. delete_task
**Description**: Permanently deletes a task for the authenticated user.

**Input Parameters**:
```json
{
  "task_id": 123  // Required: Task ID to delete
}
```

**Successful Output**:
```json
{
  "result": {
    "success": true,
    "data": {
      "deleted_task_id": 123
    },
    "message": "Task deleted successfully"
  }
}
```

**Error Cases**:
- `TASK_NOT_FOUND`: Task with given ID doesn't exist or doesn't belong to user
- `AUTH_ERROR`: User authentication failed
- `DATABASE_ERROR`: Failed to delete task from database

## Tool Implementation Requirements

### Security
- Each tool validates that the requested resource belongs to the authenticated user
- No cross-user data access is permitted
- Input sanitization applied to prevent injection attacks

### Persistence
- All operations immediately persist to the database
- Database transactions used where multiple operations are involved
- Consistent timestamps recorded for all changes

### Error Handling
- Descriptive error messages that help the AI agent understand what went wrong
- Standardized error codes for consistent error handling
- No sensitive information exposed in error messages

### Validation
- All inputs validated before any database operations
- Character limits enforced on text fields
- Type checking performed on all parameters

## Security Considerations
- **Token Validation**: Verify JWT signature and expiration
- **User Scoping**: Ensure all operations limited to authenticated user
- **Input Sanitization**: Clean all user inputs before processing
- **Rate Limiting**: Prevent abuse of chat endpoint
- **Audit Logging**: Log all significant operations

## Performance Requirements
- **Response Time**: Under 3 seconds for typical chat requests
- **Concurrent Users**: Support 100+ simultaneous conversations
- **Database Efficiency**: Optimized queries with proper indexing
- **Memory Management**: Efficient handling of conversation history

## Testing Requirements
- Unit tests for MCP tools
- Integration tests for chat endpoint
- Authentication flow verification
- Database transaction testing
- Error handling validation

## Clarifications
### Session 2026-02-02
- Q: How should AI agent handle invalid requests? → A: Respond with clear error message and suggest alternatives
- Q: How to manage large conversation histories? → A: Use sliding window of last N messages to maintain context
- Q: How should JWT tokens be validated across system? → A: Validate JWT at API entry point and pass user context to tools
- Q: Should AI agent provide confirmations for operations? → A: Always provide clear confirmation messages for all operations
- Q: How to handle concurrent conversations? → A: Allow multiple concurrent conversations with unique conversation IDs