# AGENTS.md

## Project Overview
Full-stack Todo app with AI chat assistant. Three evolutionary phases:
1. **CLI** (`todo-app/`) — Python in-memory CLI (prototype)
2. **Full Stack** (`Backend/` + `Frontend/`) — FastAPI + Next.js 14 + Neon PostgreSQL
3. **AI Agent** — OpenRouter (GPT-4o-mini) via OpenAI Agents SDK, MCP tools, SSE streaming chat
Uses **Spec-Driven Development (SDD)** — specs live in `specs/`, workflow in `.specify/`, PHRs in `history/`.

## Repository Layout
```
todo-app/              CLI prototype (Python, in-memory)
Frontend/              Next.js 14 App Router + Tailwind CSS + TypeScript
  app/                 Pages: /, /login, /signup, /dashboard, /tasks/new, /tasks/[id], /chat
  components/          UI: Header, TaskList/TaskItem/TaskForm, AuthForms, DeleteConfirmationModal
  components/chat/     Chat: ChatWidget, MessageBubble, ChatInput, LoadingIndicator
  lib/                 types.ts (Task/TaskList), taskStore.tsx (Context+useReducer state)
  src/lib/api.ts       API client (Axios + fetch streaming) — PRIMARY HTTP layer
  src/utils/           token-storage.ts, api.interceptor.ts (SECONDARY Axios instance)
  src/services/        auth.service.ts, task.service.ts
  src/hooks/           useChat.ts, use-token-refresh.ts
  src/middleware.ts     Next.js Edge middleware — protects /dashboard
  styles/globals.css   Design system: glass-panel, btn-primary, card, input-field, filter-pill, scrollbar-custom, dot-grid bg
  types/               lucide-react.d.ts (custom icon declarations)
Backend/               FastAPI + SQLModel + Neon PostgreSQL
  app/main.py          PRIMARY entry point — mounts routers at /api/{user_id}/tasks, /api/v1 (auth), /api (chat)
  main.py              LEGACY entry point — mounted at /api/v1 (not used by app/main.py)
  app/core/            config.py, auth_utils.py (JWT create), current_user.py (get_current_user dependency), limiter.py (slowapi)
  app/db/session.py    Engine (Neon PostgreSQL or SQLite fallback), get_session()
  app/models/task.py   Re-exports Task from models.py
  app/schemas/task.py  TaskResponse (camelCase aliases), TaskCreate, TaskUpdate
  app/services/        task_service.py (CRUD business logic)
  app/routes/          tasks.py (REST endpoints), auth.py (login/signup/refresh/logout/me)
  Agent/               agent.py (Runner.run + word-chunking, @function_tool wrappers, max_turns=25)
                       config.py (OPENROUTER_MODEL, temperature, tokens)
                       guardrails.py (regex classify: GREETING/TASK/OFF_TOPIC)
                       runner.py (AgentRunner singleton)
  mcp/                 task_tools.py (5 CRUD tools: AddTask, ListTasks, UpdateTask, CompleteTask, DeleteTask)
                       base_tool.py (MCPToolResult, MCPToolError, BaseMCPTaskTool)
                       server.py (MCPServer singleton)
  chat/                endpoints.py (POST /{user_id}, POST /{user_id}/chat/stream SSE, GET conversations/history)
                       router.py (factory get_chat_router() with prefix /api)
  Model/               conversation_models.py (Conversation, Message, ConversationTask, RoleType enum)
  services/            ai_chat_service.py (AIChatService — orchestrates agent + DB persistence)
  requirements.txt     22 deps: fastapi, sqlmodel, openai-agents, slowapi, passlib[bcrypt], etc.
specs/                 Feature specs: 001-frontend-todo-app/, 001-backend-api/, 001-auth-integration/, 001-ai-agent-backend/, 003-chatkit-integration/
.specify/              SDD framework: constitution, scripts (bash+powershell), templates (spec, plan, tasks, adr, phr)
.agents/               Agent definitions (6) + skills (9 SKILL.md): Auth, Backend, Frontend, Chatkit, MCP, OpenAI-Agents, UI-UX, etc.
history/prompts/       33+ PHRs organized by feature stage
```

## Dev Commands
- **Frontend**: `npm run dev` (Next.js 14, port 3005, Node 20.18 pinned via Volta)
- **Backend**: `.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000`
- **Install backend deps**: `uv pip install --python .venv\Scripts\python.exe -r requirements.txt`
- **Frontend build**: `npm run build`
- **Lint**: `npm run lint` (Next.js lint)
- **Tests**: `pytest` (Backend only; no frontend test framework)

## Architecture & Data Flow
### Request Lifecycle (REST)
`Frontend/lib/taskStore.tsx` → `src/lib/api.ts` (Axios + JWT interceptor) → `Backend/app/main.py` → route → `TaskService` → SQLModel ORM → Neon PostgreSQL

### Request Lifecycle (Chat)
`Frontend/hooks/useChat.ts` → `src/lib/api.ts` (fetch + ReadableStream SSE reader) → `Backend/chat/endpoints.py` → `AIChatService` → `AgentRunner` → `Runner.run()` → LLM tool calls → `MCP task_tools.py` → `TaskService` → DB

### Auth Flow
Login: POST `/api/v1/sign-in/email` → JWT (15min access + 7day refresh) → stored in localStorage → Axios interceptor attaches Bearer → 401 triggers auto-refresh → redirect to /login on failure

### Router Structure (Backend `app/main.py`)
```
/api/{user_id}/tasks       — Task CRUD (app/routes/tasks.py)
/api/v1/sign-in/email      — Auth login (app/routes/auth.py)
/api/v1/sign-up/email      — Auth signup
/api/v1/refresh            — Token refresh
/api/v1/logout             — Logout
/api/v1/me                 — Current user
/api/{user_id}             — Chat (non-streaming)
/api/{user_id}/chat/stream — Chat (SSE streaming)
/api/{user_id}/conversations     — List conversations
/api/{user_id}/conversation/{id} — Conversation history
```
NOTE: Legacy `Backend/main.py` mounts at `/api/v1` independently — not used by the primary app entry.

## Key Gotchas & Quirks
### Backend
- **Two FastAPI entry points**: `Backend/app/main.py` (primary, used by uvicorn) and `Backend/main.py` (legacy, different router setup). Run uvicorn on `app.main:app`, NOT `main:app`.
- **SSE `done` event missing `conversation_id`**: `chat/endpoints.py:106` yields `{'type': 'done'}` without conversation_id — frontend receives `undefined` and leaves conversationId unset after each stream.
- **Agent uses `Runner.run()` + word-chunking**, NOT `Runner.run_streamed()`. The SDK's `run_streamed()` breaks tool call ↔ tool response sequencing with OpenRouter. Word-chunking splits `result.final_output` by spaces and yields each word.
- **Tool params both optional**: All 3 mutation tools (`delete_task`, `complete_task`, `update_task`) accept `title: str = ""` AND `task_id: str = ""`. Either can identify the task. The LLM is instructed to use `task_id` for exact lookups (never displayed to user).
- **`max_turns=25`** set on both `Runner.run()` calls to handle bulk operations (list → delete each).
- **Rate limiting**: Login 5/min, signup 3/min via slowapi (`Limiter(key_func=get_remote_address)`).
- **JWT secret**: `BETTER_AUTH_SECRET` from env (used for both access and refresh tokens). No hardcoded fallback.
- **Task IDs are UUID strings** (not integers). `Task.id = Field(default_factory=lambda: str(uuid.uuid4()))`.
- **Two DB engines**: `app/db/session.py` (used by routes) reads `settings.database_url`; `database.py` (legacy) reads `DATABASE_URL` directly.
- **Two API layers exist**: `app/services/task_service.py` (used by REST routes via `TaskService` static methods) and `mcp/task_tools.py` (used by AI agent via MCP tool classes).

### Frontend
- **Port 3005** (not 3000). CORS in backend `.env` includes both.
- **Two Axios instances**: `src/lib/api.ts` (PRIMARY — full API client with tasks/auth/chat) and `src/utils/api.interceptor.ts` (SECONDARY — used by AuthForms only).
- **`moduleResolution: "bundler"`** in tsconfig — required for Turbopack compatibility. NOT `node`.
- **`@/` path alias** maps to `Frontend/` root (e.g., `@/lib/api` → `Frontend/lib/api`). But `src/lib/api.ts` uses relative imports.
- **Chat widget** fixed at `h-96` (384px), `w-[400px]`, z-50. Messages area scrolls internally.
- **Custom `types/lucide-react.d.ts`** — declares ~40 icons manually. Adding a new icon requires adding its declaration here.
- **`next-env.d.ts`** auto-generated — do not edit.
- **`next.config.js`** is minimal — no custom config. Turbopack flag passed via CLI (`--turbo`).
- **No `.env.example`** — env vars are in `.env` (gitignored via root `.gitignore`).

## Environment
### Frontend (`.env`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
```
### Backend (`.env` — gitignored)
```
DATABASE_URL=postgresql://...neon.tech/neondb
BACKEND_CORS_ORIGINS=["http://localhost:3005","http://localhost:3000","...vercel.app"]
BETTER_AUTH_SECRET=***
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENROUTER_API_KEY=sk-or-v1-***
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini
AGENT_MAX_OUTPUT_TOKENS=256
```

## Deployment
- **Backend**: Dockerfile deploys to Hugging Face Spaces (port 7860, uvicorn on `app.main:app`). CI/CD in `.github/workflows/`.
- **Frontend**: Vercel URL `https://todo-full-stack-web-application-xi.vercel.app` configured in CORS origins (currently not actively deployed).
- **Database**: Neon PostgreSQL (cloud, serverless). Connection string uses SSL (`sslmode=require`).

## Testing
- Backend uses `pytest` + `pytest-asyncio` + `httpx` (configured in `requirements.txt`)
- No frontend test framework installed
- Test files live alongside source in `tests/` directory structure

---

# Agent & SDD Workflow Rules

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architext to build products.

## Task Context
- **Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.
- **Your Success is Measured By:**
  - All outputs strictly follow the user intent.
  - Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
  - Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
  - All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)
- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge Capture (PHR) for Every User Input
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
   - `constitution` → `history/prompts/constitution/`
   - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
   - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from `.specify/templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage.
   - Fill ALL placeholders in YAML and body.
   - Write the completed file with agent file tools.
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.

5) Shell fallback (only if step 3 is unavailable or fails)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file.

6) Post‑creation validations (must pass)
   - No unresolved placeholders.
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

7) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR Suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment.

**Invocation Triggers:**
1. **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2. **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3. **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4. **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps.

## Default Policies (must follow)
- Clarify and plan first — keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

## Execution Contract for Every Request
1. Confirm surface and success criteria (one sentence).
2. List constraints, invariants, non‑goals.
3. Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4. Add follow‑ups and risks (max 3 bullets).
5. Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6. If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

## Minimum Acceptance Criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Generate a detailed architectural plan for the project. Address each of the following thoroughly:

1. **Scope and Dependencies**: In Scope/Out of Scope/External Dependencies and ownership.
2. **Key Decisions and Rationale**: Options Considered, Trade-offs, Rationale. Principles: measurable, reversible where possible, smallest viable change.
3. **Interfaces and API Contracts**: Inputs, Outputs, Errors. Versioning Strategy. Idempotency, Timeouts, Retries. Error Taxonomy with status codes.
4. **Non-Functional Requirements (NFRs) and Budgets**: Performance (p95 latency, throughput), Reliability (SLOs, error budgets), Security (AuthN/AuthZ, data handling, secrets), Cost (unit economics).
5. **Data Management and Migration**: Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.
6. **Operational Readiness**: Observability (logs, metrics, traces), Alerting thresholds, Runbooks, Deployment and Rollback strategies, Feature Flags.
7. **Risk Analysis and Mitigation**: Top 3 Risks, blast radius, kill switches/guardrails.
8. **Evaluation and Validation**: Definition of Done (tests, scans), Output Validation.
9. **Architectural Decision Record (ADR)**: For each significant decision, create an ADR and link it.

### ADR Significance Test
After design/architecture work, test for ADR significance:
- **Impact**: long-term consequences? (e.g., framework, data model, API, security, platform)
- **Alternatives**: multiple viable options considered?
- **Scope**: cross‑cutting and influences system design?

If ALL true, suggest: "📋 Architectural decision detected: [brief-description] — Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`"

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure (SDD)
- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.
