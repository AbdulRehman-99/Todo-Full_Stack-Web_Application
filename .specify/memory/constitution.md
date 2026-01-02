<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.1
Modified principles:
- Phase-First Development (renamed from PRINCIPLE_1_NAME)
- Correctness-First (renamed from PRINCIPLE_2_NAME)
- Explicit State Management (renamed from PRINCIPLE_3_NAME)
- Evolutionary Architecture (renamed from PRINCIPLE_4_NAME)
- Tooling Discipline (renamed from PRINCIPLE_5_NAME)
- Deterministic AI Integration (added as new principle)
Added sections: Phase-Specific Constraints
Modified sections: Phase I Requirements (added UV to approved tools)
Templates requiring updates: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md
Follow-up TODOs: None
-->

# Progressive Todo Application Constitution

## Core Principles

### Phase-First Development
Phase-first development with hard isolation between phases. Each phase must be completed in isolation with clearly defined interfaces before moving to the next phase. This ensures clean separation of concerns and prevents cross-phase dependencies.

### Correctness-First
Correctness, clarity, and determinism before optimization or scale. Code must be correct and clear first, with performance and scaling considerations addressed in later phases. Prioritize explicit, understandable implementations over clever optimizations.

### Explicit State Management
Explicit state management; no hidden side effects or implicit behavior. All state changes must be clearly visible and traceable. Avoid hidden state mutations, implicit dependencies, or side effects that make the system behavior unpredictable.

### Evolutionary Architecture
Evolutionary architecture that enables extension without refactoring. Design systems to evolve incrementally without requiring major rewrites. Public interfaces must remain stable and forward-compatible across phases to support gradual enhancement.

### Tooling Discipline
Tooling discipline: only approved tools per phase may be used. Each phase has a defined set of approved technologies and tools that must be strictly adhered to. This prevents technology sprawl and ensures focused development within each phase's constraints.

### Deterministic AI Integration
AI integrations must be deterministic, inspectable, and auditable. When implementing AI features, ensure they are transparent in their operation, their decisions can be traced and understood, and their behavior is consistent and predictable.

## Phase-Specific Constraints

### Phase I Requirements
- Must be a pure in-memory Python console application
- No persistence (files, databases), networking, or external APIs allowed in Phase I
- Clear separation between domain logic, application state, and I/O handling required
- Tools restricted to: Python, UV, Claude Code, Spec-Kit Plus

### Phase II Requirements
- Tools restricted to: Next.js, FastAPI, SQLModel, Neon DB
- Must strictly follow official documentation for each technology
- Maintain backward compatibility with Phase I public interfaces

## Development Workflow

### Implementation Standards
- All phases must follow the defined technology stack constraints
- Public interfaces must remain stable and forward-compatible across phases
- Later phases must strictly follow official documentation for each technology
- Clear separation between domain logic, application state, and I/O handling required

### Quality Gates
- Code reviews must verify compliance with phase-specific tooling constraints
- Tests must validate phase-specific requirements are met
- Architecture reviews must confirm adherence to cross-phase interface stability

## Governance

This constitution supersedes all other development practices and must be followed. Amendments require documentation of the change, approval from project stakeholders, and a migration plan for existing code. All pull requests and code reviews must verify compliance with these principles. Complexity must be justified with clear reasoning, and teams should use this constitution as their primary guidance for development decisions.

**Version**: 1.1.1 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-02