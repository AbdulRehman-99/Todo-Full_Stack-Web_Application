# CLAUDE.md 

## Project Overview
- Multi-phase Todo App:
  1. Phase 1 → Todo in-memory console Python
  2. Phase 2 → Full stack Todo App
  3. Phase 3 → Todo AI Chatbot
- Stack:
  - Frontend: Next.js 16+, TypeScript, Tailwind CSS
  - Backend: FastAPI, SQLModel, Neon PostgreSQL
  - Auth: Better Auth with JWT

## Spec References
- Features:
  - `@specs/features/task-crud.md`
  - `@specs/features/authentication.md`
- API:
  - `@specs/api/rest-endpoints.md`
- Database:
  - `@specs/database/schema.md`
- UI:
  - `@specs/ui/components.md`
  - `@specs/ui/pages.md`
- Overview:
  - `@specs/overview.md`

## Workflow for Claude Code
1. **Read the relevant spec files** before implementing anything.
2. **Follow Spec-Kit lifecycle strictly**: Specify → Plan → Tasks → Implement
3. **Implement only what the spec and tasks authorize**.
4. **Reference Task IDs** in all code files and documentation.
5. **Phase compliance**:
   - Implement features only for the current phase.
   - Stop and request clarification if the spec is missing or underspecified.
6. **Test and iterate** according to acceptance criteria after implementation.

## Agent Notes
- No freestyle code or architecture changes without spec.
- Always check `Agent.md` for behavioral rules.
- Ensure feature implementation spans frontend + backend + DB as specified.
- Use /tmpclaude-temporary-files for temporary files. Do not write temporary files in the project root.

## Active Technologies
- TypeScript 5.0+, JavaScript ES2022 + Next.js 16+, React 18+, Tailwind CSS 3.4+ (001-frontend-todo-app)
- In-memory state using React useState/useReducer (no persistence) (001-frontend-todo-app)
- Python 3.11+ + FastAPI, SQLModel, Pydantic, Neon PostgreSQL driver (001-backend-api)
- Neon PostgreSQL database accessed via SQLModel ORM (001-backend-api)

## Recent Changes
- 001-frontend-todo-app: Added TypeScript 5.0+, JavaScript ES2022 + Next.js 16+, React 18+, Tailwind CSS 3.4+
