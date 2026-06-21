# AI-Powered Todo Application Implementation Plan

**Version**: 1.0 (Reverse Engineered)
**Date**: 2026-06-22

## Architecture Overview

**Architectural Style**: Three-tier monolithic with AI agent extension

**Reasoning**:
The system evolved through three phases: CLI prototype → Full-stack web → AI agent integration. Each phase added a new interface layer without restructuring the existing ones. This produced a pragmatic but layered architecture where:
- **Presentation**: Next.js 14 (SSR + Client Components) with Tailwind CSS
- **API**: FastAPI with synchronous REST endpoints + SSE streaming
- **Business Logic**: Python services layer + OpenAI Agents SDK for AI
- **Data**: SQLModel ORM over Neon PostgreSQL

The AI agent layer was retrofitted as a parallel service path — it uses its own MCP tool classes (not the REST services) to perform task operations, creating two API layers for the same data.

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js 14)              │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │ Dashboard │  │ Pages    │  │ ChatWidget (fixed) │  │
│  │ (REST)    │  │ (/login) │  │ (SSE streaming)    │  │
│  └─────┬─────┘  └────┬─────┘  └─────────┬──────────┘  │
│        │              │                  │             │
│        └──────────────┴──────────────────┘             │
│                        │                               │
│              ┌─────────┴──────────┐                    │
│              │  Axios API Client  │                    │
│              │  + JWT Interceptor │                    │
│              └─────────┬──────────┘                    │
└────────────────────────┼──────────────────────────────┘
                         │ HTTP / SSE
┌────────────────────────┼──────────────────────────────┐
│              Backend (FastAPI)                         │
│  ┌─────────────────────┴──────────────────────┐        │
│  │           app/main.py (primary)             │        │
│  │    /api/{user_id}/tasks  → tasks.py         │        │
│  │    /api/v1/*            → auth.py           │        │
│  │    /api/{user_id}/*     → chat/endpoints.py │        │
│  └──────────┬──────────────────────┬───────────┘        │
│             │                      │                    │
│  ┌──────────▼──────────┐ ┌─────────▼──────────┐        │
│  │  REST Task CRUD     │ │  AI Chat Service    │        │
│  │  task_service.py    │ │  ai_chat_service.py │        │
│  └──────────┬──────────┘ └─────────┬──────────┘        │
│             │                      │                    │
│             │              ┌───────▼────────┐           │
│             │              │  AgentRunner    │           │
│             │              │  (agent.py)     │           │
│             │              └───────┬────────┘           │
│             │                      │                    │
│             │              ┌───────▼────────┐           │
│             │              │  MCP Tools     │           │
│             │              │  task_tools.py │           │
│             │              └───────┬────────┘           │
│             │                      │                    │
│  ┌──────────▼──────────────────────▼──────────┐        │
│  │         SQLModel ORM + Neon PostgreSQL      │        │
│  │  Users | Tasks | Conversations | Messages  │        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Layer Structure

### Layer 1: Presentation (Frontend/Next.js)
- **Responsibility**: Client-side rendering, UI state, SSE streaming consumer
- **Components**:
  - `app/page.tsx`: Landing page with auth gate (embedded login/signup or task list)
  - `app/layout.tsx`: Root layout with Inter font, Providers (TaskProvider, Header, ChatWidget)
  - `app/dashboard/page.tsx`: Protected dashboard with task CRUD
  - `app/login/page.tsx`, `app/signup/page.tsx`: Standalone auth pages
  - `app/chat/page.tsx`: Full-page chat interface
  - `app/tasks/new/page.tsx`, `app/tasks/[id]/page.tsx`: Create/edit task pages
  - `components/TaskList.tsx`, `TaskItem.tsx`, `TaskForm.tsx`: Reusable task UI
  - `components/chat/ChatWidget.tsx`: Floating chat widget (h-96, w-[400px], z-50)
  - `components/AuthForms.tsx`: Embeddable login/signup forms
- **Technology**: React 18.3, Next.js 14.2, TypeScript 5.9, Tailwind CSS 3.4
- **State Management**: React Context + useReducer (taskStore.tsx)
- **Dependencies**: → API Layer (Axios + fetch for SSE)

### Layer 2: API (Backend/FastAPI)
- **Responsibility**: HTTP request routing, input validation, auth enforcement, response formatting
- **Components**:
  - `app/main.py`: App factory — mounts routers at `/api/{user_id}/tasks`, `/api/v1`, `/api/{user_id}`
  - `app/routes/tasks.py`: 5 REST endpoints (GET list, POST create, GET by id, PUT update, DELETE)
  - `app/routes/auth.py`: 5 auth endpoints (login, signup, refresh, logout, me) with rate limiting
  - `chat/endpoints.py`: 3 chat endpoints (POST message, POST stream SSE, GET conversations, GET history)
  - `app/core/current_user.py`: JWT extraction + validation dependency
  - `app/core/limiter.py`: slowapi rate limiter
- **Technology**: FastAPI, Uvicorn, Pydantic v2, slowapi
- **Dependencies**: → Business Logic Layer

### Layer 3: Business Logic
- **Responsibility**: Domain rules, data validation, AI orchestration
- **Components**:
  - `app/services/task_service.py`: TaskService static class — CRUD with validation (title required, <256 chars)
  - `Agent/agent.py`: TodoAgent definition with 5 function_tool wrappers (add_task, list_tasks, update_task, complete_task, delete_task), guardrails, error handling
  - `Agent/guardrails.py`: Regex-based message classification (GREETING/TASK/OFF_TOPIC)
  - `Agent/config.py`: OpenRouter configuration (model, temperature, max_tokens)
  - `services/ai_chat_service.py`: AIChatService — conversation management, message persistence, agent invocation
- **Technology**: Python 3.13, openai-agents 0.17.6, bcrypt, PyJWT
- **Dependencies**: → Data Layer, → External (OpenRouter API)

### Layer 4: Data (Persistence)
- **Responsibility**: Data access, ORM mapping, connection pooling
- **Components**:
  - `app/db/session.py`: Engine factory + get_session generator (PostgreSQL or SQLite fallback)
  - `models.py`: User + Task SQLModel definitions; Conversation + Message + ConversationTask
  - `mcp/task_tools.py`: 5 MCP tool classes — parallel data access layer for AI agent
- **Technology**: SQLModel, psycopg2-binary, aiosqlite
- **Dependencies**: → Neon PostgreSQL (cloud) or SQLite (local)

## Design Patterns Applied

### Pattern 1: Repository Pattern (Data Access Abstraction)
- **Location**: `app/services/task_service.py` (TaskService static methods), `mcp/task_tools.py` (tool classes)
- **Purpose**: Isolate database operations from HTTP route handlers and AI agent
- **Implementation**: Service methods accept `Session` + params and return ORM objects; tool classes accept params dict and return MCPToolResult dicts
- **Note**: Two parallel implementations exist (TaskService for REST, MCP tools for AI) — they operate on the same Task model but are independent

### Pattern 2: Dependency Injection (FastAPI Depends)
- **Location**: All route handlers use `Depends(get_current_user)` and `Depends(get_session)`
- **Purpose**: Decouple auth validation and DB session creation from route logic
- **Implementation**: FastAPI's dependency injection system provides user_id string and SQLModel Session to each endpoint

### Pattern 3: Singleton (AgentRunner, MCP Server, AI Chat Service)
- **Location**: `agent_runner = AgentRunner()` in runner.py, `mcp_server = MCPServer()` in server.py, `ai_chat_service = AIChatService()` in ai_chat_service.py
- **Purpose**: Single instance of long-lived services shared across requests
- **Implementation**: Module-level instantiation with lazy initialization

### Pattern 4: Guardrails (Input Classification)
- **Location**: `Agent/guardrails.py`
- **Purpose**: Pre-filter user messages before they hit the LLM to avoid wasting tokens on off-topic or greeting-only queries
- **Implementation**: Regex pattern matching → GuardrailResult enum → early return in agent.py

### Pattern 5: SSE Streaming (Server-Sent Events)
- **Location**: `chat/endpoints.py` (chat_stream_endpoint), `hooks/useChat.ts` (frontend consumer)
- **Purpose**: Real-time delivery of AI response tokens without WebSocket complexity
- **Implementation**: FastAPI StreamingResponse + async generator + ReadableStream reader on frontend

### Pattern 6: Word-Chunking (Fallback from SDK Streaming)
- **Location**: `Agent/agent.py` (process_user_message_streamed)
- **Purpose**: SDK's run_streamed() breaks tool call sequencing with OpenRouter; workaround uses non-streaming run() + word-split streaming
- **Implementation**: `Runner.run()` → `result.final_output.split(" ")` → yield each word

## Data Flow

### Request Flow (REST — Create Task)
1. User fills TaskForm, submits → `taskStore.tsx` calls `apiClient.tasks.create(data)`
2. Axios interceptor attaches JWT `Bearer <token>` from localStorage
3. FastAPI receives POST `/api/{user_id}/tasks/`, auth middleware decodes JWT → extracts `sub` user_id
4. `tasks.py` handler validates `current_user == user_id` (403 if mismatch)
5. `TaskService.create_task()` validates title (required, <256 chars), creates Task ORM object
6. SQLModel commits to Neon PostgreSQL
7. Response serialized to `TaskResponse` (camelCase aliases: `createdAt`, `updatedAt`)
8. Frontend converts date strings → Date objects via `convertTaskDates()`
9. taskStore dispatches `ADD_TASK` action → re-render

### Request Flow (Chat — SSE Streaming)
1. User types message → `useChat.ts` calls `apiClient.chat.sendChatMessageStream()`
2. Frontend opens `fetch()` POST to `/api/{user_id}/chat/stream` with Bearer token
3. FastAPI auth middleware validates JWT, checks user_id match
4. `chat_stream_endpoint` returns `StreamingResponse(event_generator())`
5. `ai_chat_service.process_chat_message_streamed()`:
   - Creates/gets Conversation record
   - Stores user Message
   - Calls `agent_runner.run_agent_streamed()`
6. `agent_runner` → `process_user_message_streamed()`:
   - Guardrails classify (GREETING/TASK/OFF_TOPIC)
   - `Runner.run()` with max_turns=25, word-chunks output
   - Each word yielded as token
7. Frontend event generator: SSE `data: {"type": "token", "data": "word"}\n\n`
8. `useChat.ts` appends each token to last assistant message
9. On `type: "done"`, conversation history retrievable via GET endpoint
10. `ChatWidget.tsx` calls `loadTasks()` to refresh task list after AI response

## Technology Stack

### Language & Runtime
| Component | Technology | Rationale |
|---|---|---|
| Backend | Python 3.13 | Async support, rich ecosystem, FastAPI compatibility |
| Frontend | TypeScript 5.9 | Type safety, React/Next.js ecosystem |
| CLI Prototype | Python 3.13 | Zero dependencies, simple in-memory |

### Web Framework
| Component | Choice | Rationale |
|---|---|---|
| Backend API | FastAPI | Async, auto-docs (OpenAPI), Pydantic validation |
| Frontend Framework | Next.js 14.2 | SSR, App Router, Turbopack dev mode |

### Database
| Component | Choice | Rationale |
|---|---|---|
| Primary | Neon PostgreSQL | Serverless, SSL, connection pooling |
| Fallback | SQLite (aiosqlite) | Local dev without cloud DB |
| ORM | SQLModel | Pydantic + SQLAlchemy integration |

### AI / LLM
| Component | Choice | Rationale |
|---|---|---|
| Model | openai/gpt-4o-mini (OpenRouter) | Fast, cheap, supports tool calling |
| SDK | openai-agents 0.17.6 | Function tool support, max_turns |
| Streaming | Runner.run() + word-chunking | Workaround for SDK streaming breakage with OpenRouter |

### Auth
| Component | Choice |
|---|---|
| Token Format | JWT (HS256) |
| Password Hashing | bcrypt |
| Token Lifetime | Access: 15 min, Refresh: 7 days |

## Module Breakdown

### Module: auth (Backend/app/routes/auth.py + app/core/auth_utils.py)
- **Purpose**: User registration, authentication, token lifecycle management
- **Key Classes**: LoginRequest, SignUpRequest (Pydantic models)
- **Key Functions**: `create_access_token()`, `create_refresh_token()`, `get_current_user()`
- **Dependencies**: User model, bcrypt, PyJWT, slowapi
- **Complexity**: Medium

### Module: tasks-rest (Backend/app/routes/tasks.py + app/services/task_service.py)
- **Purpose**: Task CRUD via REST API
- **Key Classes**: TaskService (static methods)
- **Endpoints**: GET/POST `/api/{user_id}/tasks/`, GET/PUT/DELETE `/api/{user_id}/tasks/{task_id}`
- **Dependencies**: Task model, get_session, get_current_user
- **Complexity**: Low

### Module: tasks-mcp (Backend/mcp/task_tools.py)
- **Purpose**: Task CRUD via MCP tools for AI agent
- **Key Classes**: AddTaskTool, ListTasksTool, UpdateTaskTool, CompleteTaskTool, DeleteTaskTool
- **Helper**: `_infer_task_by_title()` — fuzzy title matching for agent lookups
- **Dependencies**: Task model, get_session, BaseMCPTaskTool
- **Complexity**: Medium

### Module: agent (Backend/Agent/)
- **Purpose**: AI agent definition, tool wrappers, guardrails, OpenRouter configuration
- **Key Files**: agent.py (317 lines — core logic), guardrails.py (pattern matching), config.py, runner.py (singleton)
- **Key Functions**: `process_user_message()`, `process_user_message_streamed()`, `classify_message()`
- **Dependencies**: OpenRouter API, openai-agents SDK, MCP tools
- **Complexity**: High

### Module: chat (Backend/chat/ + Backend/services/ai_chat_service.py)
- **Purpose**: Chat endpoint, SSE streaming, conversation persistence
- **Key Classes**: AIChatService (conversation orchestration)
- **Endpoints**: POST `/api/{user_id}`, POST `/api/{user_id}/chat/stream`, GET `/{user_id}/conversations`, GET `/{user_id}/conversation/{id}`
- **Dependencies**: AgentRunner, Conversation/Message models
- **Complexity**: High

### Module: frontend-core (Frontend/app/, components/, lib/)
- **Purpose**: Next.js pages, task UI components, state management
- **Key Files**: taskStore.tsx (Context + useReducer), api.ts (Axios client), globals.css (design system)
- **Key Components**: TaskList, TaskItem, TaskForm, ChatWidget, AuthForms
- **Dependencies**: Axios, Next.js, React, Tailwind
- **Complexity**: Medium

## Regeneration Strategy

### Option 1: Specification-First Rebuild (Recommended)
1. Start with spec.md (intent + requirements)
2. Define clean API contract (single source of truth for task CRUD)
3. Implement REST services once — both REST API and AI agent should share the same service layer
4. Remove legacy entry point (main.py), consolidate to single FastAPI app
5. Add structured logging, metrics, and health endpoints from day one
6. Fill constitution with actual principles before starting development

**Timeline**: 8-10 weeks for full rebuild (2-person team)

### Option 2: Incremental Refactoring
1. **Consolidate entry points**: Remove legacy `main.py`/`database.py`, route everything through `app.main:app`
2. **Unify task data layer**: Make MCP tools call TaskService instead of duplicating DB logic
3. **Fix SSE done event**: Add conversation_id to payload
4. **Add observability**: Structured logging, health check, Prometheus metrics
5. **Fill constitution**: Replace template placeholders with project-specific principles
6. **Create specs/ directory**: Backfill spec/plan/tasks from existing PHRs

**Timeline**: 4-6 weeks (1-person team)

## Improvement Opportunities

### Technical Improvements
- [ ] **Unify task data access layer**: MCP tools should delegate to TaskService to eliminate duplicate DB logic
  - **Rationale**: Single source of truth; consistency between REST and AI operations
  - **Effort**: Medium

- [ ] **Fix SSE done event**: Add `conversation_id` to the done SSE event
  - **Rationale**: Frontend needs conversation_id for history continuity; current behavior starts new conversation each message
  - **Effort**: Low (change 1 line)

- [ ] **Add structured logging**: Replace plain `logging` with JSON-formatted logging
  - **Rationale**: Better observability, queryable logs, correlation IDs
  - **Effort**: Low

- [ ] **Remove legacy entry points**: Delete `Backend/main.py`, `Backend/database.py`
  - **Rationale**: Eliminate duplicate code and route conflicts
  - **Effort**: Low

### Architectural Improvements
- [ ] **Unify REST + MCP task operations into single service**
  - **Enables**: AI agent and REST API use same validation, same business logic
  - **Effort**: Medium

- [ ] **Implement rate limiting for all endpoints** (not just login/signup)
  - **Enables**: Protection against API abuse across all operations
  - **Effort**: Low

### Operational Improvements
- [ ] **CI/CD pipeline**: Add GitHub Actions for linting, testing, building, deploying
- [ ] **Secrets management**: Add `.env` to `.gitignore`; create `.env.example`; rotate exposed secrets
- [ ] **Monitoring**: Prometheus metrics endpoint + Grafana dashboard for request rate, latency, error rate
- [ ] **Health checks**: Standardize `/health` and `/ready` endpoints with DB connectivity check
