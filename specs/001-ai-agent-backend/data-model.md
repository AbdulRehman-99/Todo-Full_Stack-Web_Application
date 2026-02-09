# Data Model: AI-Todo-Agent Backend

## Entity Definitions

### Task Entity
**Location**: `Backend/models/conversation_models.py`
**Purpose**: Represents user tasks managed through the AI agent

**Fields**:
- `id` (int, primary_key, autoincrement) - Unique identifier for the task
- `user_id` (str) - Identifier of the user who owns the task
- `title` (str, max_length=200) - Task title (required, 1-200 characters)
- `description` (str, max_length=1000, nullable) - Task description (optional)
- `completed` (bool, default=False) - Completion status
- `created_at` (datetime, default=utcnow) - Creation timestamp
- `updated_at` (datetime, default=utcnow) - Last update timestamp

**Relationships**:
- One-to-many with User (via user_id foreign key)

**Validation Rules**:
- title must be 1-200 characters
- user_id must exist and be valid
- completed defaults to False
- created_at and updated_at auto-populate

### Conversation Entity
**Location**: `Backend/models/conversation_models.py`
**Purpose**: Represents a conversation session between user and AI agent

**Fields**:
- `id` (int, primary_key, autoincrement) - Unique identifier for the conversation
- `user_id` (str) - Identifier of the user who owns the conversation
- `created_at` (datetime, default=utcnow) - Creation timestamp
- `updated_at` (datetime, default=utcnow) - Last activity timestamp

**Relationships**:
- One-to-many with User (via user_id foreign key)
- One-to-many with Message (via conversation_id foreign key)

**Validation Rules**:
- user_id must exist and be valid
- created_at and updated_at auto-populate

### Message Entity
**Location**: `Backend/models/conversation_models.py`
**Purpose**: Represents individual messages in a conversation

**Fields**:
- `id` (int, primary_key, autoincrement) - Unique identifier for the message
- `user_id` (str) - Identifier of the user who sent the message
- `conversation_id` (int) - Foreign key to associated conversation
- `role` (str, enum: 'user'|'assistant') - Role of the message sender
- `content` (str, max_length=5000) - Message content
- `created_at` (datetime, default=utcnow) - Creation timestamp

**Relationships**:
- One-to-many with User (via user_id foreign key)
- Many-to-one with Conversation (via conversation_id foreign key)

**Validation Rules**:
- user_id must exist and be valid
- conversation_id must reference valid conversation
- role must be either 'user' or 'assistant'
- content must be 1-5000 characters
- created_at auto-populates

## Database Schema

### Tables
```sql
-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

## State Transitions

### Task States
- **Incomplete** (default): completed=False
- **Completed**: completed=True (transitions via complete_task MCP tool)

### Message States
- **Active**: Normal message state
- **Deleted**: Soft-delete state (handled via conversation history management)

## Validation Logic

### Task Validation
1. Title length: 1-200 characters
2. User ownership verification
3. Duplicate prevention (optional)

### Message Validation
1. Content length: 1-5000 characters
2. Role validation: 'user' or 'assistant'
3. Conversation existence verification
4. User ownership verification

### Conversation Validation
1. User ownership verification
2. Active conversation limit (optional, for concurrent conversation control)