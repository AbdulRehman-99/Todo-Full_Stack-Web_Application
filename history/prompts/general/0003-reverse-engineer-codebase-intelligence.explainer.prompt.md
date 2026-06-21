---
id: 0003
title: reverse-engineer-codebase-intelligence
stage: explainer
date: 2026-06-22
surface: agent
model: deepseek-v4-flash-free
feature: none
branch: main
user: muhib
command: We are performing a comprehensive reverse engineering workflow to extract specs, plans, tasks, and reusable intelligence from the existing codebase.
labels: [reverse-engineering, spec, plan, tasks, intelligence, architecture, codebase-analysis]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - docs/reverse-engineered/spec.md
  - docs/reverse-engineered/plan.md
  - docs/reverse-engineered/tasks.md
  - docs/reverse-engineered/intelligence-object.md
tests:
  - null
---

## Prompt

We are performing a comprehensive reverse engineering workflow to extract specs, plans, tasks, and reusable intelligence from the existing codebase. We have a full-stack Todo app with FastAPI backend and Next.js 14 frontend, featuring AI-powered task management via OpenRouter, streaming chat, and secure JWT authentication.

The system has 3 evolutionary phases: CLI prototype (Python in-memory), Full Stack (FastAPI + Next.js 14 + Neon PostgreSQL), AI Agent (OpenRouter GPT-4o-mini via OpenAI Agents SDK).

We need to produce four artifacts:
1. spec.md — Specification the codebase SHOULD have been built from
2. plan.md — Implementation plan that would produce this architecture
3. tasks.md — Task breakdown for systematic development
4. intelligence-object.md — Reusable intelligence (skills, patterns, ADRs)

## Response snapshot

Completed comprehensive codebase analysis across all 3 phases:
- Phase 1: Mapped structure (8 top-level dirs, Backend/Agent/, Frontend/), dependencies (22 backend packages, 15 frontend), entry points (2 FastAPI apps, Next.js app)
- Phase 2: Deep analysis of intent (task management + AI chat), architecture (three-tier + AI agent extension), patterns (Repository, Dependency Injection, Singleton, Guardrails, SSE Streaming, Word-Chunking), data flow (REST and SSE paths), gaps (missing conversation_id in SSE, legacy dead code, secrets in .env)
- Phase 3: Produced 4 artifacts in docs/reverse-engineered/ — spec.md (12KB), plan.md (19KB), tasks.md (20KB), intelligence-object.md (24KB)

Key findings: Two-parallel service layers (REST TaskService + MCP task_tools), word-chunking fallback for broken SDK streaming, thread-local auth for AI tools, unfilled constitution template, 37 PHRs across 8 feature areas.

## Outcome

- Impact: Full reverse engineering of undocumented codebase — enables regeneration, reveals architectural anti-patterns (dual entry points, dual data access layers), captures reusable skills (SSE streaming, guardrails, JWT interceptor)
- Tests: No tests run (documentation-only deliverables)
- Files: 4 artifacts in docs/reverse-engineered/
- Next prompts: Apply extracted skills to other projects; fill constitution template; implement fixes for identified gaps (SSE done event, legacy cleanup, secrets management)
- Reflection: The word-chunking workaround and two-layer data access pattern are the most novel findings — both resulted from retro-fitting AI into an existing app. The 37 PHRs document the full evolution from CLI prototype to AI-powered full-stack app.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): Reverse engineering workflow from system prompt
- Next experiment (smallest change to try): Fix SSE done event to include conversation_id
