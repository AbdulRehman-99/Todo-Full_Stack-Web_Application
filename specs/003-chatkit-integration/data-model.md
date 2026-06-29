# Data Model: ChatKit Integration

**Feature**: 003-chatkit-integration
**Date**: 2026-02-05

## Entity Definitions

### Conversation
Represents a user's chat session with the AI assistant
- **id**: Unique identifier for the conversation (UUID string)
- **user_id**: Foreign key linking to authenticated user (UUID string)
- **created_at**: Timestamp when conversation started (DateTime)
- **updated_at**: Timestamp of last activity (DateTime)
- **title**: Optional conversation title (derived from first message) (string, optional)

### Message
Represents an individual message in a conversation
- **id**: Unique identifier for the message (UUID string)
- **conversation_id**: Foreign key linking to conversation (UUID string)
- **user_id**: Foreign key linking to sender (UUID string)
- **role**: Sender type ('user' or 'assistant') (string)
- **content**: Message text content (string)
- **timestamp**: When the message was sent (DateTime)
- **tool_calls**: Optional array of tools called during this message (array of objects, optional)
- **tool_responses**: Responses from tools (array of objects, optional)

### Task (Extended)
Represents a user task with AI interaction history
- **id**: Unique identifier for the task (UUID string)
- **user_id**: Foreign key linking to owner (UUID string)
- **title**: Task title (string)
- **description**: Optional task details (string, optional)
- **completed**: Completion status (boolean)
- **created_at**: Timestamp when task was created (DateTime)
- **updated_at**: Timestamp of last update (DateTime)
- **ai_created**: Whether task was created via AI chat (boolean)
- **associated_conversation_id**: Link to conversation that created this task (UUID string, optional)

## Relationship Mapping

### Conversation ↔ Message
- One conversation can have many messages (1:N relationship)
- Messages are linked to conversation via conversation_id foreign key
- Messages are isolated by user_id for privacy

### User ↔ Conversation
- One user can have many conversations (1:N relationship)
- Conversations are linked to user via user_id foreign key
- User data isolation enforced at database level

### Message ↔ Task
- One message can create/modify multiple tasks (1:N relationship)
- Tasks created via AI link back to the message that created them
- Tasks can be associated with multiple conversation messages through history

## API Contract Changes

### New Endpoints
```
POST /api/{user_id}                    # Send chat message to AI agent
GET  /api/{user_id}/conversations     # List user's conversations
GET  /api/{user_id}/conversation/{id}  # Get specific conversation history
DELETE /api/{user_id}/conversation/{id} # Delete conversation
```

### Modified Endpoints
```
All existing /api/{user_id}/tasks/* endpoints remain unchanged
Authentication continues to work via JWT tokens
```

## Data Validation Rules

### Conversation Validation
- user_id must match authenticated user
- created_at and updated_at are auto-generated
- Title is optional, defaults to first message content

### Message Validation
- content length: 1-2000 characters
- role must be either 'user' or 'assistant'
- conversation_id must exist and belong to user
- user_id must match authenticated user

### Task Validation (AI-created)
- Same validation as manual tasks
- Additional flag ai_created=True for AI-generated tasks
- Optional association with conversation_id for context tracking

## State Transitions

### Message States
```
CREATED → PROCESSED → RESPONSE_GENERATED → STORED_IN_DB
```

### Task States (via AI)
```
USER_REQUEST → AI_INTERPRETATION → TOOL_EXECUTION → TASK_CREATED/UPDATED/COMPLETED/DELETED
```

### Conversation States
```
INITIALIZED → ACTIVE → INACTIVE → ARCHIVED
```

## Performance Considerations

### Indexing Strategy
- Index on user_id for fast user isolation
- Index on conversation_id for message retrieval
- Index on created_at for chronological ordering
- Composite indexes on (user_id, created_at) for efficient querying

### Data Retention
- Conversations: Retained indefinitely or until user deletion
- Messages: Retained with conversation
- Task associations: Retained as long as task exists