# Backend CLAUDE.md

## 📌 Project Context

This folder contains the **Backend service** for the Todo Full-Stack Web Application.

- Backend is implemented using **:contentReference[oaicite:0]{index=0}**
- Database is **:contentReference[oaicite:1]{index=1}**
- ORM is **:contentReference[oaicite:2]{index=2}**
- Authentication will be added later using **:contentReference[oaicite:3]{index=3}**

⚠️ **Important:**  
Authentication is **NOT implemented yet**, but the backend **must be written as if authentication will exist in the future**.

---

## 🎯 Backend Responsibilities

The backend is responsible for:

- Exposing RESTful APIs under `/api/`
- Persisting Todo data in PostgreSQL (Neon)
- Enforcing **user-level data isolation**
- Remaining **auth-ready** without rework when authentication is added

The backend **must NOT**:
- Handle UI logic
- Implement signup/login flows
- Trust any user identifiers sent from the frontend

---

## 🧠 Core Architectural Rule (DO NOT VIOLATE)

> **All backend routes MUST depend on a `get_current_user()` abstraction.**

- Even when authentication is not enabled
- Even when using a fake or demo user
- Even in development mode

This rule exists to ensure:
- Zero breaking changes when auth is added
- Consistent security boundaries
- Clean separation of concerns

---

## 📁 Required Backend Structure

Claude Code must follow this structure strictly:

```text
backend/
└── app/
    ├── main.py                  # FastAPI app entry
    ├── core/
    │   ├── config.py            # Environment & settings
    │   └── current_user.py      # 🔑 Auth abstraction
    ├── db/
    │   └── session.py           # Database session
    ├── models/
    │   └── task.py              # SQLModel DB models
    ├── schemas/
    │   └── task.py              # Pydantic request/response models
    ├── services/
    │   └── task_service.py      # Business logic
    └── routes/
        └── tasks.py             # API routes