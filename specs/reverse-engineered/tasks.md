# AI-Powered Todo Application Implementation Tasks

**Version**: 1.0 (Reverse Engineered)
**Date**: 2026-06-22

## Overview

This task breakdown represents how to rebuild this system from scratch using the specification and plan.

**Estimated Timeline**: 10 weeks (2-person team)
**Team Composition**: 1 Backend Engineer (FastAPI/Python), 1 Frontend Engineer (Next.js/TypeScript)

---

## Phase 1: Project Infrastructure (Week 1)

**Dependencies**: None

### Task 1.1: Repository & Tooling Setup
- [ ] Initialize monorepo structure: `Backend/`, `Frontend/`, `todo-app/`, `docs/`, `.specify/`
- [ ] Backend: `requirements.txt` with FastAPI, SQLModel, uvicorn, python-jose, bcrypt, passlib, slowapi, psycopg2-binary, openai-agents, pytest, httpx
- [ ] Frontend: `npm create next@14` with TypeScript, Tailwind CSS
- [ ] Configure linting: flake8 + mypy (backend), ESLint + next lint (frontend)
- [ ] Setup Volta pinning: Node 20.18.0
- [ ] Configure `.gitignore` to exclude `.env`, `node_modules/`, `.venv/`, `.next/`, `__pycache__/`
- [ ] Create `.env.example` files (frontend + backend) with placeholder values
- [ ] Create `AGENTS.md` with project context, commands, and architecture

### Task 1.2: SDD Framework Setup
- [ ] Fill `.specify/memory/constitution.md` with actual project principles
- [ ] Verify PHR template at `.specify/templates/phr-template.prompt.md` exists
- [ ] Create `specs/` directory structure
- [ ] Initialize `history/prompts/` with phase structure

### Task 1.3: Configuration System
- [ ] Backend: pydantic-settings `Settings` class reading from `.env`
- [ ] Configuration keys: DATABASE_URL, BACKEND_CORS_ORIGINS, BETTER_AUTH_SECRET, ALGORITHM (HS256), ACCESS_TOKEN_EXPIRE_MINUTES, OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_MODEL, AGENT_MAX_OUTPUT_TOKENS
- [ ] Frontend: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_BACKEND_API_URL
- [ ] Backend CORS configuration supporting localhost:3005, :3000, 127.0.0.1:3005, :3000, Vercel domain

---

## Phase 2: Data Layer (Week 2)

**Dependencies**: Phase 1

### Task 2.1: Database Schema Design
```
Tables:
  user          — id (UUID PK), email (unique), hashed_password, username, created_at, updated_at, is_active
  task          — id (UUID PK), user_id (FK → user.id), title, description, completed, created_at, updated_at
  conversation  — id (int PK), user_id, created_at, updated_at
  message       — id (int PK), user_id, conversation_id (FK → conversation.id), role (user|assistant), content, created_at
  conversation_task — id (int PK), user_id, title, description, completed, created_at, updated_at
```
- [ ] Define all models in `models.py` using SQLModel
- [ ] Add proper foreign key constraints (task.user_id → user.id, message.conversation_id → conversation.id)
- [ ] UUID defaults for Task.id and User.id: `Field(default_factory=lambda: str(uuid.uuid4()))`
- [ ] Document schema relationships and constraints

### Task 2.2: Database Session Management
- [ ] Two-engine support: Neon PostgreSQL (production) / SQLite (local development)
- [ ] `app/db/session.py`: Engine factory with pool_pre_ping=True for Postgres
- [ ] Connection pool settings: pool_size=10, max_overflow=20, pool_recycle=3600
- [ ] `get_session()` generator for FastAPI Depends
- [ ] Auto table creation on startup (SQLModel.metadata.create_all)

### Task 2.3: Migration Strategy
- [ ] SQLModel creates tables via metadata.create_all on startup (no Alembic migrations needed for initial schema)
- [ ] Document manual migration process for schema changes

---

## Phase 3: Authentication (Week 3)

**Dependencies**: Phase 2

### Task 3.1: User Model & Password Hashing
- [ ] bcrypt password hashing with gensalt()
- [ ] User creation: validate unique email (409 Conflict if duplicate)
- [ ] Password strength validation: minimum 8 chars, mixed case, digits

### Task 3.2: JWT Token Lifecycle
- [ ] Access token: 15-minute expiry, payload = {sub: user_id, email, exp, type: "access"}
- [ ] Refresh token: 7-day expiry, payload = {sub: user_id, exp, type: "refresh"}
- [ ] Signing: HS256 algorithm with BETTER_AUTH_SECRET from settings
- [ ] Token validation: decode, verify signature, check type claim, extract sub

### Task 3.3: Auth API Endpoints
- [ ] `POST /api/v1/sign-in/email` — authenticate, return access + refresh tokens + user profile
- [ ] `POST /api/v1/sign-up/email` — create user, return tokens + user profile
- [ ] `POST /api/v1/refresh` — validate refresh token, return new access token
- [ ] `POST /api/v1/logout` — return success (stateless, no server-side invalidation)
- [ ] `GET /api/v1/me` — return current user info (protected by get_current_user)

### Task 3.4: Rate Limiting
- [ ] slowapi integration: Limiter(key_func=get_remote_address)
- [ ] Login: 5 requests/minute per IP
- [ ] Signup: 3 requests/minute per IP
- [ ] 429 handler with appropriate error response

### Task 3.5: Auth Middleware (FastAPI Depends)
- [ ] `get_current_user(request)`: extract Bearer token, decode JWT, validate type="access", return user_id string
- [ ] `get_current_user_optional(request)`: return None if no valid token (for unauthenticated access)
- [ ] Error responses: 401 with specific messages (missing header, expired, invalid, wrong type)

---

## Phase 4: REST Task API (Week 4)

**Dependencies**: Phase 2, Phase 3

### Task 4.1: Task Service (Business Logic)
- [ ] `TaskService` with static methods:
  - **create_task**: validate title (required, 1-255 chars), set completed=False, commit
  - **get_tasks_by_user_id**: select where user_id matches, return list
  - **get_task_by_id**: select where user_id + task_id match, return one or None
  - **update_task**: partial update (title, description, completed individually), update timestamps
  - **delete_task**: delete by user_id + task_id, return boolean
- [ ] Title validation: non-empty, stripped, max 255 characters
- [ ] Timestamp updates: updated_at = datetime.utcnow() on modifications

### Task 4.2: Task Schemas (Pydantic)
- [ ] `TaskCreate`: title (required), description (optional), from_attributes=True
- [ ] `TaskUpdate`: title (optional), description (optional), completed (optional), from_attributes=True
- [ ] `TaskResponse`: camelCase aliases (id, userId, title, completed, createdAt, updatedAt), populate_by_name=True
- [ ] `TaskListResponse`: list of TaskResponse + total count

### Task 4.3: Task REST Endpoints
- [ ] `GET /api/{user_id}/tasks/` — list all tasks for user
- [ ] `POST /api/{user_id}/tasks/` — create task (201 Created)
- [ ] `GET /api/{user_id}/tasks/{task_id}` — get single task
- [ ] `PUT /api/{user_id}/tasks/{task_id}` — update task fields
- [ ] `DELETE /api/{user_id}/tasks/{task_id}` — delete task (204 No Content)
- [ ] All endpoints protected by `Depends(get_current_user)` and user_id match check (403 Forbidden)
- [ ] 404 when task not found, 422 on validation error, 204 on successful delete

---

## Phase 5: AI Agent (Weeks 5-6)

**Dependencies**: Phase 2, Phase 3

### Task 5.1: OpenRouter Configuration
- [ ] `Agent/config.py`: read OPENROUTER_API_KEY, BASE_URL, MODEL, TEMPERATURE, MAX_OUTPUT_TOKENS from env
- [ ] Config validation: raise ValueError if API key missing
- [ ] Default model: openai/gpt-4o-mini, temperature: 0.3, max_tokens: 256

### Task 5.2: OpenAI Agents SDK Integration
- [ ] Set up `AsyncOpenAI` client with OpenRouter base URL, API key, custom headers (HTTP-Referer, X-Title)
- [ ] Disable tracing: `set_tracing_disabled(True)`
- [ ] Create `OpenAIChatCompletionsModel` wrapping the OpenRouter client
- [ ] Configure `ModelSettings` with max_tokens and temperature

### Task 5.3: MCP Task Tools (Data Access for AI)
- [ ] `BaseMCPTaskTool` base class with user_id, execute(params) abstract method
- [ ] `MCPToolResult`: success + data + message dict
- [ ] `MCPToolError`: error code + message dict
- [ ] `AddTaskTool.execute()`: validate title length, create task in DB
- [ ] `ListTasksTool.execute()`: optional completed filter, limit (max 1000), return tasks with id/title/description/completed
- [ ] `UpdateTaskTool.execute()`: lookup by task_id or _infer_task_by_title, partial update
- [ ] `CompleteTaskTool.execute()`: lookup by task_id or title, set completed=True
- [ ] `DeleteTaskTool.execute()`: lookup by task_id or title, delete from DB
- [ ] `_infer_task_by_title()` helper: ILIKE fuzzy match, return single task only if exactly one match

### Task 5.4: Agent Definition & Tool Wrappers
- [ ] 5 `@function_tool` async wrappers (add_task, list_tasks, update_task, complete_task, delete_task)
- [ ] Thread-local user_id via `_get_context_user_id()` for authenticated context
- [ ] `TodoAgent` with instructions covering: tool usage rules, task identification logic, bulk operations, natural-language-only responses
- [ ] `max_turns=25` for bulk operation support
- [ ] Agent instructions must: never show IDs to user, prefer task_id internally, use natural language only

### Task 5.5: Guardrails
- [ ] Regex-based classification: GREETING (hi, hello), TASK (add/show/delete/complete task), OFF_TOPIC (everything else)
- [ ] 12+ GREETING patterns, 14+ TASK patterns covering all task operations
- [ ] Early return in agent.py (skip LLM call for GREETING/OFF_TOPIC, saving tokens)
- [ ] GREETING → friendly greeting response
- [ ] OFF_TOPIC → "I can only help with task management" message
- [ ] TASK → proceed to LLM

### Task 5.6: Agent Error Handling
- [ ] RateLimitError (429) → "AI service is rate-limited" message
- [ ] APIStatusError (503) → "AI model temporarily unavailable" message
- [ ] Generic Exception → catch-all with logging
- [ ] finally block: clean up thread-local storage

### Task 5.7: Word-Chunking Streaming (Workaround)
- [ ] Use `Runner.run()` (non-streaming) instead of `Runner.run_streamed()`
- [ ] Split `result.final_output` by spaces
- [ ] Yield each word with trailing space
- [ ] Small async sleep between words to yield control

### Task 5.8: AgentRunner Singleton
- [ ] `AgentRunner` class with lazy initialization (initialize_agent → Config.validate())
- [ ] `run_agent()`: register default tools, call process_user_message, return response dict
- [ ] `run_agent_streamed()`: async generator yielding tokens via process_user_message_streamed
- [ ] Module-level singleton: `agent_runner = AgentRunner()`

---

## Phase 6: Chat & Conversation Layer (Week 7)

**Dependencies**: Phase 4, Phase 5

### Task 6.1: Chat Service Orchestration
- [ ] `AIChatService` with conversation management:
  - `process_chat_message()`: non-streamed — create/get conversation → store user message → get history → run agent → store AI response → update conv timestamp
  - `process_chat_message_streamed()`: streamed — similar flow but yields tokens and stores full response at end
  - `_create_new_conversation()`: insert Conversation record, refresh, return
  - `_validate_conversation_access()`: select by id + user_id, raise ValueError if not found
  - `_store_message()`: insert Message record (role, content), return
  - `_get_conversation_history()`: select all messages by conversation_id, ordered by created_at

### Task 6.2: Chat REST Endpoints
- [ ] `POST /api/{user_id}` — non-streaming chat, returns ChatResponse (response, conversation_id, timestamp)
- [ ] `POST /api/{user_id}/chat/stream` — SSE streaming chat, returns tokens via event_generator
- [ ] `GET /api/{user_id}/conversations` — list all conversations for user
- [ ] `GET /api/{user_id}/conversation/{conversation_id}` — get message history for conversation
- [ ] All endpoints protected by user_id match check (403 Forbidden)

### Task 6.3: SSE Event Generator
- [ ] SSE format: `data: {"type": "start"|"token"|"done"|"error", "data": ...}\n\n`
- [ ] Headers: Cache-Control: no-cache, Connection: keep-alive, X-Accel-Buffering: no
- [ ] Error stream: catch exceptions → yield error event → close session
- [ ] KNOWN BUG: `done` event missing conversation_id — add it

---

## Phase 7: Frontend (Weeks 8-9)

**Dependencies**: Phase 4, Phase 6

### Task 7.1: Project Setup & Design System
- [ ] Next.js 14 with App Router + TypeScript
- [ ] Tailwind CSS configuration: custom color palette (indigo/violet primary 50-950, surface grays, semantic colors), Inter font, custom shadows (soft, glow), animations (fade, scale, slide, bounce), background utilities (dot-grid)
- [ ] `globals.css`: Tailwind layers — base (custom properties, font smoothing, selection), components (btn-primary/btn-secondary/btn-ghost/btn-danger, card, card-hover, glass-panel, input-field, form-label, filter-pill, gradient-text), utilities (scrollbar-custom, scrollbar-hide, bg-dot-grid, animation delays)
- [ ] Typescript config: moduleResolution: "bundler", `@/` path alias → root, strict mode

### Task 7.2: State Management
- [ ] `lib/types.ts`: Task interface (id, title, description?, completed, createdAt, updatedAt?), TaskList, TaskStatus
- [ ] `lib/taskStore.tsx`: React Context + useReducer with actions: LOAD_TASKS, ADD_TASK, UPDATE_TASK, DELETE_TASK, SET_FILTER, SET_LOADING, SET_ERROR
- [ ] TaskProvider wrapping root layout with Header + ChatWidget
- [ ] All mutations go through apiClient (Axios), then dispatch to reducer

### Task 7.3: API Client (Axios)
- [ ] `src/lib/api.ts`: Axios instance with base URL, 30s timeout
- [ ] Request interceptor: attach Bearer token from localStorage
- [ ] Response interceptor: 401 → attempt refresh → retry original request → redirect to /login on failure
- [ ] `apiClient` namespace with `tasks` (getAll, getById, create, update, delete, toggleComplete), `auth` (refresh, logout, getMe), `chat` (sendChatMessage, sendChatMessageStream, getConversations, getConversationHistory)
- [ ] Date conversion: snake_case DB fields → camelCase frontend fields, string → Date
- [ ] SSE streaming via `fetch` + ReadableStream reader (not Axios)

### Task 7.4: Auth Frontend
- [ ] `src/utils/token-storage.ts`: storeTokens, getAccessToken, getRefreshToken, clearTokens, isAuthenticated, isAccessTokenExpired
- [ ] `src/services/auth.service.ts`: refreshToken (fetch-based), logout, getCurrentUser
- [ ] `components/AuthForms.tsx`: EmbeddableLoginPage + EmbeddableSignupPage with email/password/username forms
- [ ] `app/login/page.tsx`: Standalone login page
- [ ] `app/signup/page.tsx`: Standalone signup page
- [ ] `src/middleware.ts`: Edge middleware protecting /dashboard route
- [ ] `src/hooks/use-token-refresh.ts`: Periodic token refresh every 5 minutes

### Task 7.5: Task UI Components
- [ ] `components/TaskList.tsx`: Filter pills (All/Active/Completed), task list rendering, empty states
- [ ] `components/TaskItem.tsx`: Circular checkbox, title, description, dates, edit/delete buttons, inline confirmation
- [ ] `components/TaskForm.tsx`: Title + description fields, validation (1-255 title, 1000 desc), submit/cancel
- [ ] `components/DeleteConfirmationModal.tsx`: Generic modal for delete confirmation
- [ ] `components/Header.tsx`: Sticky header with brand, nav, logout, mobile hamburger menu

### Task 7.6: Pages
- [ ] `app/page.tsx`: Landing page — 3 states (unauthenticated hero, auth forms, task list)
- [ ] `app/dashboard/page.tsx`: Protected dashboard with task CRUD
- [ ] `app/tasks/new/page.tsx`: Create task page
- [ ] `app/tasks/[id]/page.tsx`: Edit task page (finds in context or fetches by ID)
- [ ] `app/chat/page.tsx`: Full-page chat interface

### Task 7.7: Chat Widget
- [ ] `hooks/useChat.ts`: ChatState (messages, loading, conversationId, error), SSE streaming consumer, history loading
- [ ] `components/chat/ChatWidget.tsx`: Fixed floating widget (h-96, w-[400px], bottom-right, z-50), glassmorphism, gradient header, scrollable messages, loads tasks after AI response
- [ ] `components/chat/MessageBubble.tsx`: User (user icon) / Assistant (bot icon) with ReactMarkdown
- [ ] `components/chat/ChatInput.tsx`: Text input with send button, disabled state during loading
- [ ] `components/chat/LoadingIndicator.tsx`: Three bouncing dots + "Thinking..."

### Task 7.8: Icon Declarations
- [ ] `types/lucide-react.d.ts`: Manually declare all used lucide-react icon components (~38 icons)
- [ ] Icons: CheckSquare, ArrowRight, Sparkles, ListChecks, Plus, Trash2, Edit3, Check, X, Menu, LogOut, User, Bot, Send, Loader2, MessageSquare, Moon, Sun, Search, Filter, AlertCircle, CheckCircle, Clock, Calendar, Tag, ArrowLeft, MoreHorizontal, ChevronDown, ChevronUp, Maximize2, Minimize2, RefreshCw, Settings, Info, HelpCircle, ExternalLink, Copy, Download

---

## Phase 8: CLI Prototype (Week 1 — Parallel)

**Dependencies**: None

### Task 8.1: In-Memory Todo Store
- [ ] `models/todo.py`: `TodoItem` (id, description, completed, created_at) with validation, `InMemoryTodoStore` (list-based CRUD, auto-increment IDs)
- [ ] Validation: description non-empty, max 500 chars

### Task 8.2: Todo Service
- [ ] `services/todo_service.py`: `TodoService` wrapping InMemoryTodoStore with mirror methods + get_store_statistics()

### Task 8.3: CLI Interface
- [ ] `cli/interface.py`: Menu-driven loop (Add, View, Update, Delete, Mark Complete, Exit)
- [ ] Handle EOFError/KeyboardInterrupt for clean exit
- [ ] `main.py`: Entry point with welcome message

---

## Phase 9: Testing (Week 10)

**Dependencies**: All phases complete

### Task 9.1: Backend Unit Tests
- [ ] Framework: pytest + pytest-asyncio
- [ ] Test AuthService: signup (success, duplicate email), login (success, wrong password), refresh (valid, expired token), token validation (missing, expired, wrong type)
- [ ] Test TaskService: create (success, empty title, long title), get (by user, by id), update (partial, all fields), delete (exists, not found)
- [ ] Test Guardrails: GREETING, TASK, OFF_TOPIC classification accuracy
- [ ] Test Agent: error handling (RateLimitError, APIStatusError), guardrail early returns

### Task 9.2: Backend Integration Tests
- [ ] Test complete auth flow: signup → login → access resource → refresh → access resource → logout
- [ ] Test task CRUD via HTTP: create → list → get by id → update → toggle complete → delete
- [ ] Test chat flow: send message → get response → list conversations → get history
- [ ] Test 403 forbiddance: user A cannot access user B's tasks
- [ ] Test 401: unauthenticated requests rejected
- [ ] Test rate limiting: exceed login/signup limits → 429

### Task 9.3: Frontend Build & Lint
- [ ] `npm run build` must pass with no errors
- [ ] `npm run lint` must pass with no errors
- [ ] TypeScript strict mode: no implicit any errors

### Task 9.4: Manual Smoke Tests
- [ ] User can register, login, see empty state
- [ ] User can create task, see it in list, edit, delete, toggle complete
- [ ] Filter pills correctly filter All/Active/Completed
- [ ] AI chat: "hello" → greeting; "add buy milk" → creates task; "show my tasks" → lists; "complete the milk task" → completes; "what's the weather" → off-topic
- [ ] Chat widget: opens, streams tokens, persists across messages, refreshes task list
- [ ] Token refresh: wait 15+ minutes, existing session still works
- [ ] Logout: clears tokens, redirects to login

---

## Phase 10: Deployment (Post-Launch)

### Task 10.1: Backend Docker
- [ ] Python 3.13-slim base image
- [ ] Install build-essential + libpq-dev for psycopg2
- [ ] Multi-stage build for smaller image
- [ ] CMD: uvicorn app.main:app --host 0.0.0.0 --port $PORT
- [ ] Health check support in Dockerfile

### Task 10.2: Hugging Face Spaces
- [ ] Configure app_port=7860
- [ ] Environment variables set in Space secrets
- [ ] Auto-deploy from GitHub main branch

### Task 10.3: Frontend Build
- [ ] Verify production build: `npm run build`
- [ ] CORS origins include Vercel production URL
- [ ] Deploy to Vercel via GitHub integration

### Task 10.4: Post-Deployment Verification
- [ ] Health endpoint returns 200
- [ ] All CORS origins functional
- [ ] Database connection via SSL verified
- [ ] OpenRouter API key valid
- [ ] Auth tokens work in production
- [ ] AI agent responds correctly
