---
id: "0004"
title: "ChatKit Integration Plan"
stage: "plan"
feature: "003-chatkit-integration"
date: "2026-02-05"
author: "Claude"
---

## Prompt

```
before start planing review the Frontend and Backend folder

Create a clear implementation plan for Phase-III Frontend ChatKit integration with backend agent and persistent authentication.

---

### 1. Architecture & Folder Structure
All these folders are inside in the Frontend folder that is already created
- `/app/chat/` → ChatKit page, container, messages, input
- `/components/chat/` → MessageBubble, LoadingIndicator, ToolCallBadge
- `/lib/chatkit.ts` → ChatKit SDK setup
- `src/libs/api.ts` → existing CRUD + additive `sendChatMessage()` function
- `/types/chat.ts` → message/conversation types
- Data flow: ChatKit UI → `api.ts.sendChatMessage()` → backend agent → MCP tools → DB → frontend

---

### 2. Sub-Agent & Skill Usage
1. Use the existing sub-agent already created within the project.
2. Automatically leverage these skills wherever applicable:
   - OpenAI ChatKit SDK skill

---

### 3. Implementation Steps
1. Initialize ChatKit SDK (`lib/chatkit.ts`)
2. Create Chat page & container (`/app/chat/`)
3. Build messages & input components
4. Integrate ChatKit API with `api.ts.sendChatMessage()`
5. Implement persistent JWT:
   - Store on login/signup
   - Send with all API calls (manual CRUD + ChatKit)
6. Manage conversation_id (component state / localStorage)
7. Apply responsive UI, Tailwind styling, loading indicators, auto-scroll, tool confirmations
8. Test single-login flow + manual CRUD + AI ChatBot
9. Assign sub-agent & skill roles

---

### 4. Testing & Validation
- ChatKit renders messages correctly
- Messages reach backend agent & trigger MCP tools
- Manual CRUD + AI tasks work together
- Single-login / JWT persistence works across reloads
- Responsive UI & all UX elements (loading, auto-scroll, tool badges)

---

### 5. Decisions & Notes
- JWT storage: localStorage vs secure cookie
- Conversation state: local state vs localStorage
- ChatKit → custom backend only, default disabled
- Additive changes only in `src/libs/api.ts`; no new backend endpoints
- Frontend remains UI-only; backend handles AI reasoning
```

## Response Summary

Created comprehensive implementation plan for OpenAI ChatKit SDK frontend integration with the following key components:

- Technical Context: Defined TypeScript/JavaScript (Next.js 16+), Python 3.11+ (FastAPI), Neon PostgreSQL, JWT authentication
- Project Structure: Detailed frontend and backend directory structures with specific file locations
- User Stories: Organized implementation around priority user stories (task management, authentication, updates, completion/deletion)
- Phase Organization: Structured implementation in phases from setup to polish
- Dependencies: Identified task dependencies and parallel execution opportunities
- Implementation Strategy: MVP approach with incremental delivery

The plan provides a clear roadmap for implementing the AI chatbot integration with proper architecture and user experience considerations.