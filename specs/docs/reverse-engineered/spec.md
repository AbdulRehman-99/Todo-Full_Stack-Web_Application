# AI-Powered Todo Application Specification

**Version**: 1.0 (Reverse Engineered)
**Date**: 2026-06-22
**Source**: Full-stack Todo app codebase

## Problem Statement

Users need a task management system that combines traditional CRUD task operations with an AI-powered conversational assistant. Existing todo apps lack natural language task management — users want to say "add milk to my shopping list" or "mark all completed tasks as done" instead of clicking through forms. The system must work across CLI (prototype), web (full-stack), and AI (conversational) interfaces.

## System Intent

**Target Users**: Individuals managing personal tasks and to-do lists who want both a traditional UI and an AI chat interface

**Core Value Proposition**: Manage tasks through both a polished web dashboard and a conversational AI assistant — tasks created/changed via chat are immediately reflected in the dashboard, and vice versa

**Key Capabilities**:
- Full CRUD task management (create, read, update, delete, complete)
- AI-powered natural language task interaction via streaming chat
- Secure JWT-based authentication with auto-refresh
- Responsive web UI with glassmorphism design
- Conversation history and persistence
- Multi-tenant user isolation (each user sees only their tasks)

## Functional Requirements

### Requirement 1: User Authentication
- **What**: Register, login, logout, token refresh, current user info
- **Why**: Secure multi-tenant access with session management
- **Inputs**: Email + password for login/signup; refresh token for token refresh; Bearer token for authenticated requests
- **Outputs**: JWT access token (15-min expiry), refresh token (7-day expiry), user profile (id, email, username)
- **Side Effects**: User record created in DB on signup; HTTP-only session not used (JWT stored client-side)
- **Success Criteria**: Valid credentials produce tokens; invalid credentials return 401; expired tokens return 401 with 1 retry via refresh; rate-limited at 5/min login, 3/min signup

### Requirement 2: Task CRUD
- **What**: Create, read, update, delete, list, toggle-complete tasks
- **Why**: Core task management functionality
- **Inputs**: Task title (required, 1-255 chars), description (optional, max 1000 chars), completed status; user_id in URL path
- **Outputs**: Task objects with id (UUID), title, description, completed, createdAt, updatedAt, userId
- **Side Effects**: Task persisted to Neon PostgreSQL; tasks scoped to authenticated user (403 if user_id mismatch)
- **Success Criteria**: All CRUD operations succeed with correct auth; 404 if task not found; 422 on validation failure; 204 on delete

### Requirement 3: AI Chat Assistant
- **What**: Natural language task management via conversational AI agent
- **Why**: Enable users to manage tasks through chat without using the UI
- **Inputs**: Free text message (any task-related query), optional conversation_id for history
- **Outputs**: Natural language response, streamed word-by-word via SSE for real-time UX
- **Side Effects**: Messages persisted to Conversation + Message tables; tasks created/modified via AI tool calls; conversation_id created and returned
- **Success Criteria**: AI correctly interprets "add buy groceries" → creates task; "show my tasks" → lists tasks; "complete the grocery one" → completes task; "delete all" → bulk deletion; "hello" → greeting response; "what's the weather" → off-topic rejection

### Requirement 4: Task Filtering (UI)
- **What**: Filter task list by All / Active / Completed status
- **Why**: Quick navigation between pending and completed tasks
- **Inputs**: Filter pill selection (all | active | completed)
- **Outputs**: Filtered task list rendered in TaskList component
- **Success Criteria**: Active filter shows only incomplete tasks; Completed filter shows only done tasks; All filter shows everything

### Requirement 5: Conversation Persistence
- **What**: Store chat history per user, per conversation
- **Why**: Provide context for AI responses across multiple messages
- **Inputs**: User message, conversation_id
- **Outputs**: AI response; conversation history retrievable via GET endpoints
- **Side Effects**: Each user message and AI response stored as Message records
- **Success Criteria**: Subsequent messages in same conversation have full context; history endpoint returns chronological messages

## Non-Functional Requirements

### Performance
- SSE streaming delivers tokens word-by-word with no buffering delay
- Task list operations complete within 500ms for typical user (sub-100 tasks)
- Connection pooling configured with pool_size=10, max_overflow=20
- Chat history limited implicitly by conversation model (no explicit limit)

### Security
- **Auth**: JWT-based with HS256, access token type enforced, refresh token rotation
- **Rate Limiting**: Login 5 requests/min, Signup 3 requests/min via slowapi
- **Input Validation**: Title/description length limits at API boundary; title required validation
- **No hardcoded secrets**: All secrets (BETTER_AUTH_SECRET, OPENROUTER_API_KEY, DB URL) from .env
- **Token validation**: Type check enforced (rejects non-access tokens at resource endpoints)

### Reliability
- Agent error handling: RateLimitError → friendly message; APIStatusError (503) → service unavailable message; generic Exception → catch-all message
- DB session lifecycle managed via context managers (`with next(get_session())`)
- Circuit breaker pattern not implemented (future improvement)

### Scalability
- Stateless auth via JWT (no server-side sessions) enables horizontal scaling
- Neon PostgreSQL handles connection pooling at cloud level
- Each user operates in isolated scope (user_id in URL + JWT subject check)

### Observability
- Python `logging` module for agent errors and chat stream errors
- No structured logging, no metrics collection, no distributed tracing, no health check metrics endpoint

## System Constraints

### External Dependencies
- **Database**: Neon PostgreSQL (cloud, serverless, SSL required)
- **AI Model**: OpenRouter (GPT-4o-mini) — OpenAI API-compatible, requires API key
- **Runtime**: Python 3.13 (backend), Node.js 20.18 (frontend)
- **SDK**: openai-agents 0.17.6 for AI agent framework

### Data Formats
- REST API: JSON request/response bodies
- SSE: `data: {"type": "token"|"done"|"error", "data": ...}\n\n`
- JWT: standard JSON Web Token with `sub`, `email`, `exp`, `type` claims
- Task IDs: UUID v4 strings (not auto-increment integers)
- Timestamps: ISO 8601 / Python datetime.utcnow()

### Deployment Context
- Backend: Hugging Face Spaces (Docker, port 7860)
- Frontend: Vercel (not actively deployed)
- `.env` files for local development (secrets committed — security concern)

### Compliance Requirements
- Basic rate limiting (login/signup) to prevent brute force
- No GDPR-specific patterns observed
- No data retention/cleanup policies implemented

## Non-Goals & Out of Scope

**Explicitly excluded** (inferred from missing implementation):
- **Social features**: No sharing, collaboration, or multi-user task lists
- **Notifications**: No push, email, or in-app notifications for task reminders
- **File attachments**: No file upload or attachment support for tasks
- **Tags/Categories**: No labeling, priority levels, due dates, or categories
- **Offline support**: No service workers, no PWA capability
- **Mobile native**: No React Native / Flutter app
- **Team/Workspace**: Single-user only, no organization or workspace concept
- **Integration**: No calendar sync, Slack/Discord integration, or webhook support
- **Administration**: No admin panel, user management dashboard, or analytics
- **API versioning**: No formal API versioning strategy (v1 prefix exists but only one version)

## Known Gaps & Technical Debt

### Gap 1: SSE `done` event missing `conversation_id`
- **Issue**: `chat/endpoints.py:106` yields `{'type': 'done'}` without conversation_id — frontend receives `undefined` and cannot persist conversation ID
- **Evidence**: `Backend/chat/endpoints.py:106` — `yield f"data: {json.dumps({'type': 'done'})}\n\n"`
- **Impact**: After each streaming chat, the frontend conversationId remains unset; each message starts a new conversation
- **Recommendation**: Include `conversation_id` in the done event payload

### Gap 2: Two FastAPI entry points
- **Issue**: `Backend/app/main.py` (primary) and `Backend/main.py` (legacy) mount overlapping routes at different prefixes
- **Evidence**: `Backend/app/main.py` mounts auth at `/api/v1`; `Backend/main.py` also mounts auth at `/api/v1`
- **Impact**: Confusion about which entry point to run; potential route conflicts
- **Recommendation**: Remove `Backend/main.py`, `Backend/database.py`, consolidate into single entry point

### Gap 3: `.env` files with secrets committed to git
- **Issue**: `Backend/.env` contains live Neon PostgreSQL URL, JWT secret, and OpenRouter API key
- **Evidence**: Git-tracked `.env` files in both `Backend/` and `Frontend/`
- **Impact**: Secret leakage if repository is made public or shared
- **Recommendation**: Add `.env` to `.gitignore`; use `.env.example` for template; rotate exposed secrets

### Gap 4: Constitution is blank template
- **Issue**: `.specify/memory/constitution.md` still has all `[PLACEHOLDER]` brackets unfilled
- **Evidence**: All 6 principles are `[PRINCIPLE_1_NAME]` etc.
- **Impact**: SDD framework incomplete; no documented project standards
- **Recommendation**: Fill constitution with project-specific principles

### Gap 5: No specs/ directory (SDD expectation)
- **Issue**: `specs/` directory referenced in SDD framework and AGENTS.md does not exist
- **Evidence**: Only 8 root-level directories; `specs/` is absent; 37 PHRs exist but no spec/plan/task files in specs/
- **Impact**: Cannot trace SDD workflow from spec → plan → tasks for verification
- **Recommendation**: Create `specs/` directory or reconcile with PHR-based documentation strategy

### Gap 6: No observability instrumentation
- **Issue**: No metrics, tracing, or structured logging
- **Evidence**: `grep -r "prometheus\|statsd\|metric\|trace\|span\|opentelemetry"` returns no results
- **Impact**: Blind to production performance issues and error patterns
- **Recommendation**: Add structured JSON logging, OpenTelemetry traces, Prometheus metrics

## Success Criteria

### Functional Success
- [ ] User can sign up, log in, and manage tokens (access + refresh)
- [ ] User can create, read, update, delete, and complete tasks via REST API
- [ ] User can manage tasks via AI chat (add, list, complete, delete, update)
- [ ] AI correctly handles greetings, task requests, and off-topic queries via guardrails
- [ ] Streaming SSE delivers tokens word-by-word in real-time
- [ ] Conversation history is persisted and retrievable
- [ ] Tasks created via chat are visible in REST API and vice versa
- [ ] Filter pills (All/Active/Completed) work correctly in UI

### Non-Functional Success
- [ ] Auth rate limits enforced: 5/min login, 3/min signup
- [ ] JWT access tokens expire after 15 minutes; refresh works
- [ ] Unauthenticated requests return 401; forbidden cross-user access returns 403
- [ ] AI agent handles errors gracefully (rate limit, timeout, API errors)
- [ ] Frontend build passes with `npm run build`
- [ ] Backend starts cleanly with `uvicorn app.main:app`

## Acceptance Tests

### Test 1: Complete User Registration and Task Flow
**Given**: New user with email "test@example.com" and password "SecurePass123!"
**When**: User signs up, logs in, creates a task "Buy groceries", marks it complete
**Then**: All operations succeed; tasks visible in list; task shows completed=true

### Test 2: AI Creates and Completes Task
**Given**: Authenticated user with empty task list
**When**: User sends "add a task to read a book" via chat
**Then**: Task "read a book" appears in task list; AI responds with confirmation

### Test 3: AI Rejects Off-Topic Query
**Given**: Authenticated user in chat
**When**: User asks "what's the weather today?"
**Then**: AI responds with off-topic rejection message (guardrail classification)

### Test 4: Token Expiry Triggers Auto-Refresh
**Given**: Expired access token stored in localStorage
**When**: Authenticated API request is made
**Then**: 401 triggers refresh endpoint; new access token retrieved; original request retried successfully
