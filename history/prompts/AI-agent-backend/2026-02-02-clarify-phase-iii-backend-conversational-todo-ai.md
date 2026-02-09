---
id: clarify-ai-todo-chatbot-2026-02-02-001
title: Clarify Phase-III Backend Conversational Todo AI
stage: spec
date: 2026-02-02
tags: [backend, ai, chatbot, mcp, fastapi, sqlmodel, clarification]
---

# Clarify Phase-III Backend Conversational Todo AI

## PROMPT_TEXT
Clarify "Phase-III Backend – Conversational Todo AI".

Make the spec precise, concise, and unambiguous. Focus on:
1. Stateless POST /api/{user_id}/chat endpoint
2. AI agent logic using OpenAI Agents SDK
3. MCP tools: add_task, list_tasks, update_task, complete_task, delete_task
4. Conversation/message persistence in Neon PostgreSQL via SQLModel
5. Unified authentication: user signs in once, same JWT used for all app features including AI chatbot
6. AI agent must NOT access DB directly, must use MCP tools
7. Error handling and confirmations
8. Locked technology stack (FastAPI, OpenAI Agents SDK, Official MCP SDK, SQLModel, Neon DB)

Output must be concise, clear, and ready for Claude Code implementation.
---

## RESPONSE_TEXT
Successfully clarified the Phase-III Backend specification through an interactive clarification process. Five critical questions were asked and answered to eliminate ambiguities:

1. AI Agent Error Handling Strategy: AI agent should respond with clear error message and suggest alternatives when encountering invalid requests
2. Conversation Context Window Size: Use sliding window of last N messages to maintain context when conversation history becomes too large for API limits
3. Authentication Token Propagation: Validate JWT at API entry point and pass user context to MCP tools (no need to validate JWT in each individual tool)
4. Task Operation Confirmation Strategy: AI agent should always provide clear confirmation messages for all operations (add/update/complete/delete)
5. Concurrent Conversation Handling: Allow multiple concurrent conversations per user with unique conversation IDs

All clarifications were incorporated directly into the spec.md file in the appropriate sections, and documented in a new "Clarifications" section. The specification is now precise, concise, unambiguous, and ready for Claude Code implementation.