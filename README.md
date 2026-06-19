# Progressive Todo Application with AI Assistant

A feature-rich, full-stack todo application built with Next.js 14+, FastAPI, and Neon PostgreSQL. This application integrates an **AI-powered assistant** using the OpenAI Agents and ChatKit SDKs, allowing users to manage tasks through natural language.adding CRUD operation

## 🚀 Features

- **AI-Powered Chat Assistant**: Floating chatbot widget to create, update, and manage tasks using natural language.
- **Full CRUD Operations**: Traditional UI for managing tasks (Create, Read, Update, and Delete).
- **User Authentication**: Persistent JWT-based authentication system with automatic token refresh.
- **Real-time Synchronization**: AI interactions immediately update the task list UI.
- **Welcome Landing Page**: Engaging landing page with a "Get Started" flow.
- **Responsive Design**: Mobile-first approach built with Tailwind CSS.
- **Neon PostgreSQL**: Cloud-hosted PostgreSQL with SQLModel ORM for robust data persistence.

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+**: React framework with App Router.
- **OpenAI ChatKit SDK**: UI components for the conversational assistant.
- **Tailwind CSS**: Utility-first CSS for modern styling.
- **TypeScript**: Type-safe development.
- **Axios**: HTTP client with interceptors for JWT management.

### Backend
- **FastAPI**: High-performance Python web framework.
- **OpenAI Agents SDK**: Framework for the AI agent's reasoning and tool use.
- **Model Context Protocol (MCP)**: Stateless tool integration for task management.
- **SQLModel**: ORM for database interactions.
- **Python 3.11+**: Modern async Python.

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL.
- **SQLModel**: ORM for schema definition and migration.

## 📁 Project Structure

```text
├── Backend/
│   ├── Agent/             # AI Agent logic and runner
│   ├── app/               # FastAPI application core and routes
│   ├── chat/              # Chat API endpoints and routers
│   ├── mcp/               # MCP tools (AddTask, UpdateTask, etc.)
│   ├── Model/             # SQLModel database models
│   ├── services/          # Business logic (AI Chat Service, Task Service)
│   └── main.py            # Backend entry point
├── Frontend/
│   ├── app/               # Next.js App Router (Dashboard, Tasks)
│   ├── components/
│   │   ├── chat/          # Chat UI (Widget, Bubble, Input)
│   │   └── TaskForms/     # Task management components
│   ├── lib/
│   │   ├── api.ts         # Centralized API client with Chat methods
│   │   └── taskStore.tsx  # Global state management for tasks
│   ├── src/
│   │   ├── hooks/         # Custom hooks (useChat)
│   │   └── types/         # TypeScript interfaces
│   └── package.json       # Frontend dependencies
├── specs/                 # Spec-Driven Development documentation
└── history/               # Prompt History Records (PHR)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- OpenRouter API Key (for the AI Agent)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd To-Do-App
   ```

2. **Backend Setup**:
   ```bash
   cd Backend
   pip install -r requirements.txt
   # Create a .env file with:
    # OPENROUTER_API_KEY=your_openrouter_api_key
   # DATABASE_URL=your_neon_url
   python -m uvicorn app.main:app --reload
   ```

3. **Frontend Setup**:
   ```bash
   cd Frontend
   npm install
   npm run dev -p 3005
   ```

## 🤖 AI Assistant Usage

The AI Assistant is available via a floating widget in the bottom-right corner. It can perform actions like:
- *"Add a task to prepare the presentation for tomorrow."*
- *"Show me my incomplete tasks."*
- *"Mark the grocery shopping task as done."*
- *"Delete the task about car washing."*

## 📝 API Endpoints (Selection)

- `GET /api/{user_id}/tasks/` - List user tasks.
- `POST /api/{user_id}/tasks/` - Create a task.
- `POST /api/{user_id}` - Send a message to the AI Chatbot.
- `GET /api/{user_id}/conversations` - Get chat history.

## 📄 License

This project is licensed under the MIT License.
