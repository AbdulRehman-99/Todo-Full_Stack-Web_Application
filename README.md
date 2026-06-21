# AI-Powered Todo Application

A full-stack task management application with an AI-powered conversational assistant. Manage tasks through both a polished web dashboard and natural language chat — tasks created via AI are immediately reflected in the UI, and vice versa.

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│              Frontend (Next.js 14)                │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │Dashboard │  │Auth Pages│  │ Chat Widget    │  │
│  │(REST CRUD)│  │(login/   │  │(SSE Streaming) │  │
│  └────┬─────┘  │ signup)  │  └───────┬────────┘  │
│       │        └────┬─────┘          │           │
│       └─────────────┴────────────────┘           │
│                      │                           │
│              ┌───────┴───────┐                   │
│              │  Axios Client │                   │
│              │  + JWT Auth   │                   │
│              └───────┬───────┘                   │
└──────────────────────┼───────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────┼───────────────────────────┐
│            Backend (FastAPI)                      │
│  ┌───────────────────┴───────────────────┐       │
│  │         app/main.py (entry point)      │       │
│  │  /api/{user_id}/tasks  → Task CRUD    │       │
│  │  /api/v1/*            → Auth          │       │
│  │  /api/{user_id}/*     → Chat (SSE)    │       │
│  └───────┬───────────────────────┬───────┘       │
│          │                       │                │
│  ┌───────▼───────┐     ┌────────▼────────┐      │
│  │ TaskService   │     │ AIChatService   │      │
│  │ (REST CRUD)   │     │ → AgentRunner   │      │
│  └───────┬───────┘     │ → MCP Tools     │      │
│          │             │ → GPT-4o-mini   │      │
│          │             └────────┬────────┘      │
│          └──────────────────────┘                │
│                         │                        │
│          ┌──────────────▼──────────────┐        │
│          │    SQLModel + Neon PG       │        │
│          │  Users | Tasks | Chats     │        │
│          └─────────────────────────────┘        │
└──────────────────────────────────────────────────┘
```

## Features

- **Task Management**: Create, read, update, delete, and complete tasks via web UI or REST API
- **AI Chat Assistant**: Natural language task management via streaming chat (powered by GPT-4o-mini via OpenRouter)
- **Real-Time Streaming**: AI responses delivered word-by-word via Server-Sent Events (SSE)
- **Smart Guardrails**: Input classification saves tokens by detecting greetings, task requests, and off-topic queries before LLM call
- **Secure Auth**: JWT-based authentication with access tokens (15min) + refresh tokens (7 days), bcrypt password hashing, rate limiting
- **Conversation History**: Chat messages and AI responses persisted per user, queryable via API
- **Responsive UI**: Glassmorphism design with Tailwind CSS, custom indigo/violet palette, dot-grid background
- **Bulk Operations**: AI agent handles "delete all tasks" / "complete all" via multi-step tool calls (max_turns=25)

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend | Python / FastAPI / Uvicorn | 3.13 / 0.115+ |
| Frontend | Next.js / React / TypeScript | 14.2 / 18.3 / 5.9 |
| Database | Neon PostgreSQL (prod) / SQLite (dev) | — |
| ORM | SQLModel | — |
| AI Model | GPT-4o-mini via OpenRouter | — |
| AI SDK | OpenAI Agents SDK | 0.17.6 |
| Auth | JWT (HS256) + bcrypt | — |
| Styling | Tailwind CSS | 3.4.19 |
| Streaming | Server-Sent Events (SSE) | — |

## Project Structure

```
├── Backend/               FastAPI backend
│   ├── app/               Main application (routes, services, schemas, core)
│   ├── Agent/             AI agent (tools, guardrails, config)
│   ├── chat/              Chat endpoints (SSE streaming)
│   ├── mcp/               MCP tool implementations (task CRUD for AI)
│   ├── services/          AI chat orchestration
│   ├── Model/             DB models (conversations, messages)
│   ├── models.py          Core SQLModel definitions (User, Task)
│   ├── main.py            Legacy entry point (not used)
│   └── requirements.txt   22 dependencies
├── Frontend/              Next.js 14 frontend
│   ├── app/               Pages (home, login, signup, dashboard, tasks, chat)
│   ├── components/        Reusable UI components (TaskList, ChatWidget, AuthForms)
│   ├── lib/               State management (taskStore, types)
│   ├── src/               API client, hooks, services, middleware
│   ├── styles/            Design system (globals.css)
│   └── types/             Custom icon declarations (lucide-react)
├── todo-app/              CLI prototype (Python in-memory)
├── .specify/              SDD framework (templates, scripts)
├── history/               PHRs (prompt history records)
├── docs/                  Documentation
└── AGENTS.md              AI agent context file
```

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 20.18.0 (pinned via Volta: `nvm use 20.18.0`)
- Neon PostgreSQL account (or use SQLite locally — no setup needed)

### 1. Clone & Install

```bash
git clone <repo-url>
cd todo-full-stack-web-application
```

### 2. Backend Setup

```bash
cd Backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate    # Windows
source .venv/bin/activate # macOS/Linux

# Install dependencies
uv pip install --python .venv\Scripts\python.exe -r requirements.txt

# Configure environment (create .env from .env.example)
# Required vars:
#   DATABASE_URL          — Neon PostgreSQL URL or sqlite:///./todo_app.db
#   BETTER_AUTH_SECRET    — JWT signing secret (any secure hex string)
#   OPENROUTER_API_KEY    — OpenRouter API key
#   OPENROUTER_BASE_URL   — https://openrouter.ai/api/v1
#   OPENROUTER_MODEL      — openai/gpt-4o-mini

# Start backend
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

Backend runs at **http://localhost:8000**. API docs at **http://localhost:8000/docs**.

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Configure environment (create .env):
#   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
#   NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000

# Start dev server (Turbopack enabled)
npm run dev
# Alternative (with explicit flags):
npx next dev --turbo -p 3005
```

Frontend runs at **http://localhost:3005**.

### 4. CLI Prototype (Optional)

```bash
cd todo-app
python main.py
```

## API Endpoints

### Authentication (`/api/v1`)
| Method | Path | Description | Rate Limit |
|---|---|---|---|
| POST | `/sign-in/email` | Login | 5/min |
| POST | `/sign-up/email` | Signup | 3/min |
| POST | `/refresh` | Refresh access token | — |
| POST | `/logout` | Logout | — |
| GET | `/me` | Current user info | — |

### Task CRUD (`/api/{user_id}/tasks`)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List all tasks |
| POST | `/` | Create task |
| GET | `/{task_id}` | Get single task |
| PUT | `/{task_id}` | Update task |
| DELETE | `/{task_id}` | Delete task |

### Chat (`/api/{user_id}`)
| Method | Path | Description |
|---|---|---|
| POST | `/` | Send chat message (non-streaming) |
| POST | `/chat/stream` | Send chat message (SSE streaming) |
| GET | `/conversations` | List conversations |
| GET | `/conversation/{id}` | Get conversation history |

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://...neon.tech/neondb
BACKEND_CORS_ORIGINS=["http://localhost:3005","http://localhost:3000"]
BETTER_AUTH_SECRET=<your-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENROUTER_API_KEY=sk-or-v1-***
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini
AGENT_MAX_OUTPUT_TOKENS=256
```

### Frontend (`.env`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
```

## Dev Commands

| Command | Description |
|---|---|
| `npm run dev` | Start frontend (Turbopack, port 3005) |
| `npm run build` | Build frontend for production |
| `npm run lint` | Lint frontend code |
| `.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000` | Start backend (reload enabled) |
| `.venv\Scripts\python -m pytest` | Run backend tests |
| `uv pip install --python .venv\Scripts\python.exe -r requirements.txt` | Install/update backend deps |

## Key Design Decisions

- **Word-chunking streaming**: SDK's `run_streamed()` breaks tool call sequencing with OpenRouter. Fallback uses `Runner.run()` + splits output by words — reliable but not true streaming.
- **Two data access layers**: REST operations use `TaskService`; AI tools use standalone MCP tool classes. Both operate on the same models but duplicate validation logic.
- **JWT over sessions**: Stateless auth enables horizontal scaling; 15-minute access + 7-day refresh tokens.
- **Input guardrails**: Regex classification (greeting/task/off-topic) saves LLM tokens by skipping the model for non-task queries.

## Known Issues

- SSE `done` event missing `conversation_id` — each chat message starts a new conversation
- Legacy `Backend/main.py` and `Backend/database.py` are dead code (use `app.main:app`)
- `.env` files with live secrets should be gitignored (use `.env.example` for templates)
- Two parallel task service implementations (REST + MCP) — duplicate business logic

## License

MIT
