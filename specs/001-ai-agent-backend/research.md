# Research: AI-Todo-Agent Backend

## OpenAI Agents SDK Research

### Best Practices for Task Management Applications
- Use system prompts that clearly define the agent's role as a task manager
- Implement structured output parsing for consistent task operations
- Use conversation history to maintain context across multiple requests
- Implement proper error handling for invalid user inputs

### Recommended Configuration
- Model: gpt-4-turbo or gpt-4o for optimal balance of capability and cost
- Temperature: 0.3 for consistent, reliable responses
- Max tokens: 2048 for adequate response length
- Tools: Limited to MCP tools only to ensure database security

## Official MCP SDK Integration Patterns

### FastAPI Integration
- MCP tools should be registered as callable functions
- Use standard JSON-RPC 2.0 format for tool communication
- Implement proper error handling with standardized error codes
- Validate all inputs before processing

### Security Considerations
- All MCP tools must validate user authentication
- Tools should only operate on user's own data
- Implement rate limiting for MCP tool calls
- Log all tool usage for audit purposes

## SQLModel Best Practices for Conversation/Message Persistence

### Model Design
- Use UUIDs for conversation and message IDs for better distribution
- Implement proper indexing on user_id and foreign key relationships
- Use UTC timezone for all datetime fields
- Implement soft deletes for messages if needed for conversation history

### Performance Optimization
- Use async SQLAlchemy engine for better concurrency
- Implement connection pooling for database operations
- Use bulk operations for message history retrieval
- Cache frequently accessed data when appropriate

## Neon PostgreSQL Connection Management

### Connection Pooling
- Use SQLAlchemy's async connection pool
- Configure appropriate pool size based on expected load (default 5-10)
- Implement connection timeout and retry logic
- Monitor connection usage for optimization

### Best Practices
- Use prepared statements to prevent SQL injection
- Implement proper transaction management
- Use read replicas for heavy read operations if available
- Monitor query performance and optimize slow queries

## Dependency Resolution

### Required Packages
- openai>=1.0.0
- python-mcp (Official MCP SDK)
- sqlmodel>=0.0.22
- fastapi>=0.115.0
- psycopg2-binary (for PostgreSQL connectivity)
- python-jose[cryptography] (for JWT handling)
- passlib[bcrypt] (for password hashing)

### Compatibility Matrix
- Python 3.11 (as per existing project)
- FastAPI 0.115.0 (matches existing version)
- SQLModel 0.0.22 (matches existing version)
- Neon PostgreSQL driver compatible with SQLAlchemy 2.x