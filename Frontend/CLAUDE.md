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