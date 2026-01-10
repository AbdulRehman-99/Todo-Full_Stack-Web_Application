# AGENT.md

## Purpose
- All agents (Claude, Gemini, Copilot, local LLMs) must strictly follow **Spec-Kit lifecycle**:
  **Specify → Plan → Tasks → Implement**
- No code should be generated without an explicit **Task ID** and approved spec.
- Stop and request clarification if any required spec or task is missing.

## Rules
1. Never code without referenced Task ID.
2. Never modify architecture without updating `speckit.plan`.
3. Never propose new features without updating `speckit.specify`.
4. Every code file must include a comment linking it to the Task and Spec.
5. Always test against acceptance criteria before considering implementation complete.

## Failure Modes (Avoid These)
- Freestyle coding or improvisation
- Ignoring acceptance criteria
- Altering stack, endpoints, or DB schema without spec approval
- Creating tasks independently without authorization
- Violating phase boundaries or Spec-Kit hierarchy

## Agent Workflow
1. Read relevant spec files first: `overview.md`, feature specs, API specs, database schema, UI specs.
2. Reference Task IDs in all code and documentation.
3. Implement only what the spec and tasks authorize.
4. Request spec updates for anything missing or underspecified.
5. Iterate after testing and feedback.
