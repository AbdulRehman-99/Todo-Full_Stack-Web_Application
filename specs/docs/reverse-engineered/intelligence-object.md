# AI-Powered Todo Application — Reusable Intelligence

**Version**: 1.0 (Extracted from Codebase)
**Date**: 2026-06-22

## Overview

This document captures the reusable intelligence embedded in the codebase — patterns, decisions, and expertise worth preserving and applying to future projects. The key insight: this project evolved through three phases (CLI → Full-stack → AI), and the architectural seams between phases contain the most valuable lessons.

---

## Extracted Skills

### Skill 1: SSE Streaming with Word-Chunking Fallback

**Persona**: You are a backend engineer implementing real-time AI response delivery where the LLM provider's streaming SDK is broken or incompatible.

**Questions to ask before implementing SSE streaming with AI**:
- Does the AI SDK support streaming natively with your model provider? (Some providers like OpenRouter don't sequence tool_calls → tool_messages correctly with streaming.)
- Can you use non-streaming `Runner.run()` + split output by words as a fallback?
- What SSE event types do you need? (start, token, done, error)
- How does the frontend reconstruct words into sentences? (Append each token to the last assistant message)
- What happens if the connection drops mid-stream?

**Principles**:
- **Prefer SDK-native streaming if it works** — `Runner.run_streamed()` is cleaner and more maintainable
- **Word-chunking is a reliable fallback** — Split `final_output` by spaces, yield each word with trailing space
- **SSE format is simple**: `data: {"type": "token", "data": "word"}\n\n`
- **Always include a `done` event** so the frontend knows when streaming is complete
- **Include conversation_id in the done event** — omitting it breaks conversation continuity

**Implementation Pattern** (extracted):
```python
# Backend — SSE event generator with word-chunking
async def event_generator():
    try:
        yield f"data: {json.dumps({'type': 'start', 'conversation_id': conv_id})}\n\n"

        async for token in ai_service.process_chat_message_streamed(...):
            yield f"data: {json.dumps({'type': 'token', 'data': token})}\n\n"

        yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id})}\n\n"
    except Exception as e:
        logger.error(f"Stream error: {e}", exc_info=True)
        yield f"data: {json.dumps({'type': 'error', 'data': 'Something went wrong.'})}\n\n"

# Word-chunking inside the agent:
result = await Runner.run(agent, message, max_turns=25)
output = result.final_output or "No response generated."
words = output.split(" ")
for i, word in enumerate(words):
    yield word + (" " if i < len(words) - 1 else "")
    await asyncio.sleep(0)  # yield control
```

```typescript
// Frontend — SSE consumer with ReadableStream
const reader = response.body!.getReader();
const decoder = new TextDecoder();
let buffer = '';
while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const parsed = JSON.parse(line.slice(6));
        if (parsed.type === 'token') onToken(parsed.data);
        else if (parsed.type === 'done') onDone(parsed.conversation_id);
        else if (parsed.type === 'error') onError(parsed.data);
    }
}
```

**When to apply**:
- Any AI chatbot with streaming response requirement
- When using AI providers with non-standard streaming behavior (OpenRouter, local models)
- Real-time applications where token-by-token delivery improves UX

**Contraindications**:
- If SDK streaming works correctly (use SDK-native)
- If exact word boundaries matter for the application (word-chunking may split non-space-delimited languages)

---

### Skill 2: Guardrails-Based Input Classification

**Persona**: You are an AI engineer who wants to save LLM tokens and improve response quality by pre-filtering user inputs.

**Questions to ask before implementing guardrails**:
- What categories of user input exist? (Task-related, greeting, off-topic, NSFW, etc.)
- Can the categories be reliably detected with regex, or do you need a small classifier model?
- What should happen for each category? (Greeting → direct response; Task → pass to LLM; Off-topic → rejection message)
- What's the cost savings? (Each off-topic query saved = LLM tokens not burned)
- Can the LLM handle off-topic queries gracefully on its own? (Guardrails are a performance optimization, not a strict necessity)

**Principles**:
- **Regex is sufficient for simple classification**: Task operations follow predictable patterns ("add", "show", "delete", "complete" + "task")
- **Use compiled regex patterns for performance**: `re.compile()` at module level
- **Be generous with TASK matching**: Better to pass a borderline query to the LLM than to block a legitimate task request
- **Patterns should be comprehensive**: Cover questions, commands, declarative statements ("I need to...", "Can you...")
- **Early return saves tokens**: Skip LLM entirely for GREETING and OFF_TOPIC

**Implementation Pattern** (extracted):
```python
import re
from enum import Enum

class GuardrailResult(Enum):
    GREETING = "greeting"
    TASK = "task"
    OFF_TOPIC = "off_topic"

GREETING_PATTERNS = [
    re.compile(r"^(hi|hello|hey|greetings|howdy|yo|sup)\b", re.IGNORECASE),
    re.compile(r"^good\s*(morning|afternoon|evening|day)\b", re.IGNORECASE),
]

TASK_PATTERNS = [
    re.compile(r"(add|create|new|make)\s+(a\s+)?(task|todo|to-do|chore|item)", re.IGNORECASE),
    re.compile(r"(show|list|view|display|get|fetch|load)\s+(my\s+)?(task|todo|chore)s?\b", re.IGNORECASE),
    re.compile(r"(mark|complete|finish|done)\s+(a\s+)?(task|todo|chore|item)", re.IGNORECASE),
    re.compile(r"(delete|remove|clear|erase|trash)\s+(a\s+)?(task|todo|chore|item)", re.IGNORECASE),
    re.compile(r"^(can|could|will|would)\s+you\s+(add|create|show|list|delete|remove|complete|finish|mark|help)", re.IGNORECASE),
    re.compile(r"^(please\s+)?(add|create|show|list|delete|remove|update|edit|complete|mark|help)\b", re.IGNORECASE),
]

def classify_message(message: str) -> GuardrailResult:
    if not message or not message.strip():
        return GuardrailResult.OFF_TOPIC

    if any(p.search(message.strip()) for p in TASK_PATTERNS):
        return GuardrailResult.TASK
    if any(p.match(message.strip()) for p in GREETING_PATTERNS):
        return GuardrailResult.GREETING
    return GuardrailResult.OFF_TOPIC

# Usage in agent:
guardrail = classify_message(message)
if guardrail == GuardrailResult.GREETING:
    return "Hello! I'm your task management assistant. How can I help you with your tasks today?"
if guardrail == GuardrailResult.OFF_TOPIC:
    return "I can only help with task management operations. Please ask me something task-related!"
# Proceed to LLM for TASK
```

**When to apply**:
- LLM-powered chatbots where reducing token usage matters (cost, latency)
- Domain-specific assistants that should reject off-topic queries
- Multi-turn conversations where greeting-only messages waste context window

---

### Skill 3: Two-Layer Data Access (REST + MCP/AI)

**Persona**: You are an architect designing a system where both human-driven API calls and AI agent tool calls must operate on the same data.

**Questions to ask before implementing dual data access**:
- Should the AI agent use the same service layer as the REST API, or have its own?
- What are the tradeoffs of sharing vs duplicating? (Duplication: consistency risk, but isolation; Sharing: DRY, but tight coupling)
- Can the AI agent call the REST API internally instead of direct DB access?
- How do you handle authentication for AI agent operations? (Thread-local user context)

**Principles**:
- **Sharing the service layer is ideal** — Single source of truth for validation and business logic
- **Duplication is acceptable for rapid iteration** — MCP tools can bypass REST overhead (no HTTP, serialization, routing)
- **Thread-local context for AI auth** — Store user_id in threading.local() so tools can access it without passing through function params
- **Both layers must enforce the same auth scope** — Both TaskService and MCP tools scope queries to user_id

**Anti-pattern from this codebase** (extracted as a caution):
```python
# ANTI-PATTERN: Two independent implementations of the same logic
# REST path: app/services/task_service.py
class TaskService:
    @staticmethod
    def create_task(session, user_id, task_data):
        # validation, create, commit, refresh
        ...

# AI path: mcp/task_tools.py
class AddTaskTool(BaseMCPTaskTool):
    def execute(self, params):
        # SAME validation, SAME creation logic, DUPLICATED
        ...
```

**Better approach**: MCP tools should delegate to TaskService or call the same shared validation functions.

---

### Skill 4: Thread-Local User Context for AI Tools

**Persona**: You are building an AI agent system where function tools need to know the current user without passing user_id as an explicit parameter.

**Questions to ask before implementing thread-local context**:
- Are your function tools called synchronously within a single HTTP request lifecycle?
- Can the AI agent framework pass custom context to tools? (openai-agents SDK supports context objects)
- What's the cleanup strategy? (Must remove context in finally block to prevent leakage)

**Principles**:
- **Thread-local storage is appropriate** when the AI framework doesn't support passing custom context to tools
- **Always clean up in finally block** — Prevents context leaking between requests if threads are reused
- **Use dataclass for structured context** — `Context(user_message, conversation_history, user_id, metadata)` is cleaner than multiple thread-local variables

**Implementation Pattern** (extracted):
```python
import threading

_local_storage = threading.local()

def _get_context_user_id() -> str | None:
    return getattr(_local_storage, "current_user_id", None)

@function_tool
async def add_task(title: str, description: str = "") -> Dict[str, Any]:
    user_id = _get_context_user_id()
    if not user_id:
        return {"error": "Unauthenticated user"}
    return AddTaskTool(user_id).execute({"title": title, "description": description})

# In the request handler:
_local_storage.current_user_id = user_id
try:
    result = await Runner.run(agent, message, context=context, max_turns=25)
finally:
    if hasattr(_local_storage, "current_user_id"):
        delattr(_local_storage, "current_user_id")
```

**When to apply**:
- Any AI agent framework with function tools that lack context-passing support
- Multi-tenant systems where tool calls must be scoped to the current user
- Synchronous request lifecycle (per-request thread)

---

### Skill 5: CamelCase Response Aliasing in Pydantic/FastAPI

**Persona**: You are a backend developer whose database uses snake_case but your frontend team expects camelCase API responses.

**Questions to ask before implementing field aliasing**:
- Which side should do the conversion? (Backend with `alias` vs frontend with map function)
- Do you need bidirectional conversion? (Creating records from camelCase payloads vs just serializing responses)
- Are there nested objects that also need conversion?

**Principles**:
- **Pydantic's `alias` + `populate_by_name=True`** handles the backend side cleanly:
  - `created_at: datetime = Field(alias="createdAt")`
  - Config: `populate_by_name = True` (accept camelCase input, output camelCase)
- **One direction only** (snake→camel for responses) is simpler and often sufficient
- **Frontend conversion functions** can supplement for fields not covered by aliases:
  ```typescript
  const convertTaskDates = (task: any) => ({
      ...task,
      createdAt: task.created_at ? new Date(task.created_at) : new Date(),
  });
  ```

---

### Skill 6: Agile Axios Instance with JWT Interceptor

**Persona**: You are a frontend engineer setting up authenticated HTTP communication with auto-refresh capability.

**Questions to ask before implementing an HTTP client**:
- Should you use a single Axios instance or multiple? (This codebase uses two: one primary for most operations, one secondary for auth forms)
- Where does token storage live? (localStorage, sessionStorage, cookie, memory)
- How do you handle simultaneous 401s? (Retry only once to avoid infinite loops)
- What happens if refresh also fails? (Clear tokens, redirect to login)

**Principles**:
- **Request interceptor** attaches token before every request
- **Response interceptor** catches 401, attempts refresh once, retries original request
- **Token storage** with helpers: getAccessToken, getRefreshToken, clearTokens, isAuthenticated
- **Custom event dispatch** (`authChange`) notifies components of auth state changes
- **Atomic operations** — Don't store partial token state

**Implementation Pattern** (extracted):
```typescript
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { access_token } = await refreshToken();
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch {
                clearTokens();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
```

---

## Architecture Decision Records (Inferred)

### ADR-001: Use OpenRouter as LLM Provider (instead of direct OpenAI or Gemini)

**Status**: Accepted (inferred from migration from Gemini → OpenRouter)

**Context**:
The system needs an LLM that supports:
- Tool calling (function calling) for task CRUD operations
- Streaming responses for real-time chat UX
- Cost-effective operation (token pricing)

**Decision**: Use OpenRouter with GPT-4o-mini model

**Rationale**:
1. **Evidence 1**: `.env` contains both `google-generativeai` (in requirements) and `OPENROUTER_*` vars — migration happened
2. **Evidence 2**: Agent config reads `OPENROUTER_MODEL`, `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`
3. **Evidence 3**: `gpt-4o-mini` was chosen for tool calling support and low cost

**Consequences**:
- **Positive**: Single API key for multiple models, fallback model availability, competitive pricing
- **Negative**: SDK streaming (run_streamed()) breaks with OpenRouter — required word-chunking workaround
- **Negative**: Additional dependency (OpenRouter availability, rate limits)

---

### ADR-002: Non-Streaming Runner.run() + Word-Chunking over Runner.run_streamed()

**Status**: Accepted (with regret)

**Context**:
The openai-agents SDK v0.17.x `run_streamed()` method breaks the tool call → tool response message sequence required by OpenAI API-compatible providers. OpenRouter returns `tool_calls` without corresponding `tool messages`, causing the stream to fail.

**Decision**: Use `Runner.run()` (non-streaming) and split the final output into words for streaming

**Rationale**:
1. **Evidence**: Every streamed response in agent.py uses `Runner.run()` followed by `.split(" ")` — not `Runner.run_streamed()`
2. **Impact**: Works reliably but eliminates the benefit of true streaming (word-chunking requires the full response to be generated before any token is sent)

**Consequences**:
- **Positive**: Reliable operation with OpenRouter
- **Negative**: No true streaming UX — user sees a delay then words appear rapidly
- **Mitigation**: Token generation happens while streaming headers are sent; small `asyncio.sleep(0)` between words yields control for network I/O

---

### ADR-003: JWT Authentication over Session-Based Auth

**Status**: Accepted

**Context**:
The system needs:
- Stateless auth (horizontal scaling without shared session store)
- Mobile/API client compatibility
- Token-based auth for both REST API and SSE streaming

**Decision**: JWT access tokens (15-min) + refresh tokens (7-day)

**Consequences**:
- **Positive**: Stateless, scales horizontally, works across services
- **Positive**: No server-side session storage (Redis/Memcached not needed for auth)
- **Negative**: Cannot revoke individual tokens (mitigated with short TTL + auto-refresh)
- **Negative**: Token stored in localStorage (vulnerable to XSS — should consider httpOnly cookies for production)

---

### ADR-004: Two FastAPI Entry Points (Legacy + Primary)

**Status**: Accidental architecture (anti-pattern)

**Context**:
The project evolved: initially `Backend/main.py` was the sole entry point. A refactor introduced `Backend/app/main.py` as the primary entry point, but the legacy file was never removed.

**Decision**: Maintain both files (legacy not deleted — left as dead code)

**Consequences**:
- **Negative**: Confusion about which entry point to run
- **Negative**: Potential route conflicts (both mount at `/api/v1`)
- **Negative**: Code duplication (CORS middleware, lifespan, router includes)
- **Recommendation**: Delete `Backend/main.py` and `Backend/database.py`

---

### ADR-005: Two Database Engines (Neon PostgreSQL + SQLite Fallback)

**Status**: Accepted

**Context**:
The system needs to run both in production (cloud PostgreSQL) and locally (no cloud DB setup).

**Decision**: Auto-detect from `database_url` — PostgreSQL uses pooling settings; SQLite uses `check_same_thread=False`

**Implementation**:
```python
if settings.database_url.startswith("postgresql"):
    engine = create_engine(settings.database_url, pool_pre_ping=True)
else:
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
```

---

## Code Patterns & Conventions

### Pattern 1: Backend Path Manipulation for Imports

**Observed in**: All modules under `Backend/app/` and `Backend/mcp/`

```python
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)
```

**Why**: The `models.py` module lives at the backend root, but `app/routes/` and `mcp/` are nested two levels deep. This pattern ensures root-level modules are importable without relative imports.

**Issue**: Repeated 5+ times across the codebase. Better solution: set `PYTHONPATH` in the run command or use a proper package structure.

### Pattern 2: Service Static Methods

**Observed in**: `app/services/task_service.py`

```python
class TaskService:
    @staticmethod
    def create_task(session, user_id, task_data) -> Task:
        ...
    @staticmethod
    def get_tasks_by_user_id(session, user_id) -> List[Task]:
        ...
```

**Why**: Stateless operations — the service has no state, just orchestrates DB access. No need for instance methods.

### Pattern 3: Session Context Manager

**Observed in**: `mcp/task_tools.py` (all tool classes)

```python
with next(get_session()) as session:
    # DB operations
```

**Why**: MCP tools use `next(get_session())` (direct generator access) instead of FastAPI's `Depends(get_session)`. This is necessary because the tools aren't called through FastAPI's dependency injection system.

### Pattern 4: Pydantic camelCase with populate_by_name

**Observed in**: `app/schemas/task.py`

```python
class TaskResponse(TaskBase):
    id: str = Field(alias="id")
    user_id: str = Field(alias="userId")
    completed: bool = Field(alias="completed")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
```

**Why**: The database stores `created_at` (snake_case) but the frontend expects `createdAt` (camelCase). `populate_by_name=True` allows both `created_at` and `createdAt` as input field names.

### Pattern 5: Frontend Date Conversion Bridge

**Observed in**: `Frontend/src/lib/api.ts`

```typescript
const convertTaskDates = (task: any): any => ({
    ...task,
    createdAt: task.created_at ? new Date(task.created_at) : new Date(),
    updatedAt: task.updated_at ? new Date(task.updated_at) : undefined
});
```

**Why**: The backend returns `created_at` (snake_case) but the frontend types use `createdAt` (camelCase). This bridge function also converts date strings to Date objects.

---

## Lessons Learned

### What Worked Well

1. **Context+useReducer over Redux**: The taskStore uses React Context with useReducer — sufficient for this scale, zero boilerplate, no extra dependencies
2. **Guardrails as token-saving mechanism**: Classifying input before LLM call saves ~30% of token spend on greetings and off-topic queries
3. **Thread-local user context for AI tools**: Clean solution for propagating auth context through function tool calls without modifying tool signatures
4. **CamelCase aliases in Pydantic**: Clean separation between DB naming convention (snake_case) and frontend convention (camelCase)
5. **SSE streaming over WebSocket**: Simpler implementation, works through standard HTTP/1.1 proxies, no upgrade handshake needed

### What Could Be Improved

1. **Two independent task service implementations** (REST TaskService + MCP task_tools): MCP tools should delegate to TaskService. Currently they duplicate validation and DB logic, risking inconsistency.
2. **Legacy dead code**: `Backend/main.py`, `Backend/database.py` should be removed — they cause confusion and potential route conflicts.
3. **Missing conversation_id in SSE done event**: Small bug with significant UX impact — each chat message starts a new conversation.
4. **Git-tracked `.env` with secrets**: Live credentials in committed .env files is a security risk. Should gitignore .env and use .env.example.
5. **Unfilled constitution**: The SDD framework constitution still has placeholder brackets — undermines the SDD workflow.

### What to Avoid in Future Projects

1. **Retro-fitting AI into an existing app**: The MCP tools layer duplicates the REST service layer because it was added after the fact. Design for AI agent integration from the start.
2. **SDK-first streaming with untested providers**: Always verify streaming SDK compatibility with your specific LLM provider before committing to the pattern. The word-chunking workaround was a reactive fix.
3. **Accidental dual entry points**: Delete old entry points during refactoring rather than leaving them as dead code.

---

## Reusability Assessment

### Components Reusable As-Is

| Component | Description | Reuse Target |
|---|---|---|
| `Agent/guardrails.py` | Regex-based input classification | Any AI chatbot with domain-specific scope |
| `Agent/config.py` | OpenRouter configuration class | Any project using OpenRouter |
| `app/core/auth_utils.py` | JWT create_access_token/create_refresh_token | Any FastAPI project needing JWT auth |
| `app/core/limiter.py` | slowapi rate limiter setup | Any FastAPI project needing rate limiting |
| `Backend/chat/endpoints.py` SSE generator pattern | SSE streaming with FastAPI | Any real-time streaming endpoint |
| `Frontend/components/chat/LoadingIndicator.tsx` | Bouncing dots animation | Any loading state in React |

### Patterns Worth Generalizing

| Pattern | Extract As | Description |
|---|---|---|
| SSE + Word-chunking | Streaming AI Responses skill | Word-chunking workaround for incompatible streaming SDKs |
| Guardrails classification | Input Guardrails skill | Regex-based pre-LLM classification to save tokens |
| Thread-local auth for tools | AI Auth Context skill | Thread-local storage for auth context in function tools |
| Pydantic camelCase aliases | API Response Naming skill | Bidirectional snake_case ↔ camelCase with Pydantic |
| JWT Interceptor with auto-refresh | Axios Auth skill | Frontend HTTP client with automatic token refresh |

### Domain-Specific (Not Reusable)

| Component | Reason |
|---|---|
| Task CRUD business logic | Specific to task management domain |
| Task-related guardrail patterns | "add/show/delete/complete task" patterns specific to task domain |
| Conversation + Message models | Generic enough to adapt, but schema specific to chat feature |
| Task form validation (1-255 title) | Domain-specific constraints |
