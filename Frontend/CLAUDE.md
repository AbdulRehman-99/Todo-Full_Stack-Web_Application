# CLAUDE.md (Frontend)

## Stack
- Next.js 16+, TypeScript, Tailwind CSS
- Server components by default; client components only for interactivity
- API calls through `@/lib/api.ts`

## Component Structure
- `/components` → reusable UI components
- `/app` → pages and layouts

## UI Guidelines
- Follow design and specifications in `@specs/ui/`
- Implement task CRUD interface:
  - Add, View, Update, Delete, Mark Complete
- Map API responses to UI components
- Styling: Use Tailwind CSS; no inline styles

## Agent / Skill Usage
- Use **Frontend sub-agent** for any UI/component logic
- Use **Frontend skill** for repeated UI operations or API integration
- Claude Code should **default to these sub-agent & skill** when working in frontend

## Rules
- Reference Task IDs in all code
- Do not implement backend logic
- Implement only what spec defines

## Current Implementation
- Complete frontend todo application with all 5 core features
- Next.js 16+ with App Router
- TypeScript for type safety
- Tailwind CSS for responsive styling
- React Context and useReducer for centralized state management
- Form validation with inline error messages
- Responsive design for mobile, tablet, and desktop
- Task filtering capabilities (active, completed, all)
- Proper error handling and loading states


## ChatKit SDK Integration (Phase-III)

### Purpose
- Integrate **OpenAI ChatKit SDK** to provide a conversational chat UI
- ChatKit is used **only for UI and interaction**
- All AI logic, agent reasoning, and tool execution live in the **backend**

### Architecture Rule
- ChatKit **MUST NOT** use its default or hosted backend
- ChatKit **MUST connect to the existing FastAPI backend**
- Backend endpoint used:
  - `POST /api/{user_id}/chat`

### Responsibilities
- Render chat UI (messages, input, loading state)
- Send user messages to backend chat API
- Receive assistant responses from backend
- Maintain `conversation_id` on the client
- Display tool action confirmations (read-only)

### Hard Constraints
- No LLM calls from frontend
- No prompt engineering in frontend
- No tool selection or MCP logic
- No database access
- Frontend treats backend as a black box

### Folder Ownership
- ChatKit-related code lives under:
  - `/app/chat`
  - `/components/chat`
  - `/lib/chatkit.ts`
- Existing pages and components MUST NOT be modified unless explicitly required by spec

### Authentication
- Frontend assumes user is already authenticated
- JWT/session token must be sent with chat API requests
- User ID is provided by existing auth context

### State Management
- `conversation_id` is stored in client state (or localStorage)
- Messages are rendered from backend responses
- Backend database remains the single source of truth

### Claude Code Instructions
- Use **Frontend sub-agent** for ChatKit UI work
- Do NOT touch backend code
- Do NOT create or modify API endpoints
- Implement only what is defined in Spec-5
