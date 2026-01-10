---
name: backend-fastapi-skill
description: Generate backend routes, handle requests/responses, connect to the database, and manage Neon Serverless PostgreSQL operations using Python and FastAPI. Use for API and server-side tasks.
---

# Backend Development Skill – FastAPI & Neon

## Instructions

1. **Route & API Structure**
   - Define clear FastAPI endpoints (`@app.get`, `@app.post`, etc.)
   - Separate route handlers by resource
   - Keep business logic modular and isolated

2. **Request & Response Handling**
   - Use Pydantic models for request validation
   - Return structured JSON responses with appropriate HTTP status codes
   - Handle exceptions and errors consistently

3. **Database Operations**
   - Connect securely to Neon Serverless PostgreSQL
   - Use async queries where possible for performance
   - Perform CRUD operations, transactions, and migrations reliably
   - Prevent SQL injection using parameterized queries

4. **Server Logic**
   - Separate routes, database access, and utility functions
   - Log meaningful events without exposing sensitive data
   - Ensure idempotency for critical operations

## Best Practices
- Validate all inputs rigorously using Pydantic
- Keep endpoints small and focused
- Reuse database functions instead of duplicating queries
- Use Python type hints for clarity
- Test endpoints for success and failure scenarios
- Handle errors gracefully with meaningful messages
