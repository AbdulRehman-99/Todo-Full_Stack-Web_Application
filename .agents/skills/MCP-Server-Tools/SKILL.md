# SKILL: MCP Server Tools

## Purpose
Expose controlled, stateless tools that allow AI agents
to interact with application functionality safely.

## Responsibilities
- Define strict tool interfaces
- Enforce boundaries between AI and business logic
- Execute allowed operations via existing services
- Persist all state changes to database

## Design Principles
- Tools MUST be stateless
- Tools MUST be deterministic
- Tools MUST validate all inputs
- Tools MUST return structured outputs

## Allowed Operations
- Create tasks
- Read tasks
- Update tasks
- Complete tasks
- Delete tasks

## Forbidden Operations
- Holding session state
- Managing conversation memory
- Calling AI models directly
- Performing authentication checks internally

## Integration Pattern
- Agent → MCP Tool → Existing Backend Logic → Database
- No tool directly talks to frontend
- No tool manages UI behavior

## Database Interaction
- Tools may read/write database
- Database is the single source of truth
- No caching or in-memory state allowed

## Error Handling
- Return explicit errors (e.g. task not found)
- Never mask failures
- Never fabricate results

## Security Model
- Assume user identity is already verified
- Enforce user_id scoping strictly
- Reject unauthorized access immediately

## When to Use
- Bridging AI agents with backend logic
- Enforcing AI safety boundaries
- Building reusable AI tool layers

## When NOT to Use
- AI reasoning
- UI interactions
- Session or memory management