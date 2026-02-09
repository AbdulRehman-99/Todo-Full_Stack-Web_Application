---
id: spec-ai-todo-chatbot-2026-02-02-001
title: Create AI Todo Chatbot Backend Spec
stage: spec
date: 2026-02-02
tags: [backend, ai, chatbot, mcp, fastapi, sqlmodel]
---

# Create AI Todo Chatbot Backend Spec

## PROMPT_TEXT
Create a new folder inside the specs.

Scope:
This spec defines ALL backend logic for AI-Todo-Chatbot. No frontend or UI logic is allowed.

Locked Technologies:
- Backend: Python FastAPI
- AI Framework: OpenAI Agents SDK
- MCP Server: Official MCP SDK only
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL

Functional Requirements:
1. Provide a stateless POST /api/{user_id}/chat endpoint.
2. Persist conversations and messages in the database.
3. Load conversation history on every request and pass it to the AI agent.
4. Implement an AI agent using OpenAI Agents SDK.
5. The AI agent MUST perform all task operations exclusively via MCP tools.
6. Implement MCP tools for task management:
   - add_task
   - list_tasks
   - update_task
   - complete_task
   - delete_task
7. MCP tools MUST be stateless and persist all state changes in the database.
8. The AI agent MUST NOT access the database directly.
9. Enforce JWT authentication using Better Auth on all chat requests.
10. Handle errors gracefully (task not found, invalid input, auth errors).

Data Models:
- Task: user_id, id, title, description, completed, created_at, updated_at
- Conversation: user_id, id, created_at, updated_at
- Message: user_id, id, conversation_id, role, content, created_at

Conversation Flow:
- Authenticate request using existing JWT
- Receive user message
- Fetch conversation history
- Store user message
- Run agent with MCP tools
- Store assistant response
- Return response and conversation_id

Constraints:
- No frontend logic
- No manual coding
- No technology substitutions
- Spec-driven development only

Deliverables:
- Complete backend specification for spec-4
- Unified authentication behavior
- Chat API contract
- MCP tool definitions
- Agent behavior rules
---

## RESPONSE_TEXT
Created a comprehensive backend specification for the AI-Todo-Chatbot in specs/backend-ai-chatbot/spec.md that includes:

1. Overview and scope defining backend-only focus
2. Locked technology stack requirements
3. All 10 functional requirements detailed
4. Data models for Task, Conversation, and Message
5. Conversation flow with step-by-step processing
6. API contract for the POST /api/{user_id}/chat endpoint
7. Complete MCP tools specification with interfaces and error handling
8. Security considerations and performance requirements
9. Testing requirements

The specification covers all requirements including stateless chat endpoint, AI agent integration, MCP tools implementation, database persistence, authentication, and error handling.