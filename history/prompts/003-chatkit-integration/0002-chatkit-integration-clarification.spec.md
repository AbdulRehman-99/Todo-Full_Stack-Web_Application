---
id: "0002"
title: "ChatKit Integration Clarification"
stage: "spec"
feature: "003-chatkit-integration"
date: "2026-02-05"
author: "Claude"
---

## Prompt

```
Review /sp.specify for Phase-III Frontend ChatKit with Persistent Authentication.

Verify:
- Scope: Frontend ChatKit UI + backend agent via MCP tools.
- Single login / persistent JWT; all API calls use api.ts.
- ChatKit: UI-only, no direct AI or MCP logic, no default backend.
- Conversation state managed frontend-side; backend is source of truth.
- UI: Tailwind, responsive, loading indicators, auto-scroll, tool confirmations.

Check for ambiguities:
- JWT storage/renewal unclear?
- ChatKit ↔ api.ts integration unclear?
- Edge cases combining manual CRUD + AI tasks?

Suggest minimal clarifications only.
Do not change scope, features, folder structure, backend rules, or architecture.
```

## Response Summary

Clarified three key aspects of the ChatKit integration specification:

1. **JWT Management** (Answer A): Implement automatic refresh using stored refresh token
2. **API Integration** (Answer B): Create new api.ts functions specifically for ChatKit communication
3. **Conversation Storage** (Answer C): Store conversations in database using conversation_id for persistence

Updated the specification with these clarifications to ensure proper implementation of:
- Automatic token refresh during active chat sessions
- Dedicated ChatKit wrapper functions in api.ts
- Server-side conversation history storage with cross-session persistence