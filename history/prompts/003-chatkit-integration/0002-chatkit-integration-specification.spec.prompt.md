---
id: "0002"
title: "ChatKit Integration Specification"
stage: "spec"
feature: "003-chatkit-integration"
date: "2026-02-05"
author: "Claude"
---

## Prompt

```
Phase-III: Integrate OpenAI ChatKit SDK Frontend with Backend Agent and Persistent Authentication

Create a new folder inside the specs

Target audience: Frontend developers implementing ChatKit UI in an existing Next.js full-stack todo app

Focus:
- Add a conversational Chat UI to the frontend
- Connect ChatKit frontend with existing FastAPI backend + Agent + MCP tools
- Use official OpenAI ChatKit SDK guidelines (https://platform.openai.com/docs/guides/chatkit)
- Implement **single login / persistent JWT authentication**
- Ensure users can perform task CRUD manually **and** via AI ChatBot without logging in again
- All frontend rules and Spec-5 requirements are satisfied

Success criteria:
- Fully working ChatKit frontend integrated with backend agent
- All ChatKit messages sent via `api.ts` (no direct backend calls)
- Existing task CRUD logic in `api.ts` is untouched
- Conversation state managed on frontend (conversation_id) but backend is single source of truth
- ChatKit does not use default hosted backend
- Users login/signup only once; JWT/session token persists
- Manual CRUD operations and AI ChatBot task operations work seamlessly
- Responsive UI with Tailwind CSS, loading indicators, message auto-scroll, and tool call confirmations
- Claude Code sub-agent and skill rules for frontend applied
- Additive API functions for chat and auth added only

Constraints:
- Authentication through **single login with JWT/session token**
  - JWT stored in frontend (localStorage or cookie)
  - All API calls (manual CRUD + ChatKit) send JWT
  - Backend extracts user_id from JWT
- Do not modify backend logic or create new backend endpoints
- Frontend must remain UI-only; no AI reasoning happens here
- Claude Code safe: follow sub-agent/skill rules
- Follow official OpenAI ChatKit SDK documentation and integration patterns

Not building:
- Backend agent logic, MCP tools, or database operations
- Task CRUD API modifications (existing functions)
- AI reasoning in frontend
- Creating new backend endpoints
- Multi-login flows; only single login/session

Timeline:
- Deliver complete frontend ChatKit integration with **persistent authentication** and all above requirements
```

## Response Summary

Created complete specification for OpenAI ChatKit SDK frontend integration with the following key components:

- User scenarios for AI chat interface, persistent authentication, conversational task updates, and task completion/deletion
- Functional requirements covering JWT persistence, API routing, authentication, and task operations
- Success criteria with measurable outcomes for response time, accuracy, and user experience
- Proper entity definitions for Conversation, ChatMessage, and JWT Token
- Clarifications added for automatic token refresh, dedicated API functions for ChatKit, and server-side conversation storage