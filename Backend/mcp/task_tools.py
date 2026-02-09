from typing import Dict, Any, Optional
from datetime import datetime, timezone
import sys
import os

# Add backend root to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from .base_tool import BaseMCPTaskTool, MCPToolResult, MCPToolError
from app.models.task import Task
from sqlmodel import select
from app.db.session import get_session


# -------------------------
# HELPERS
# -------------------------

def _infer_task_by_title(
    session,
    user_id: str,
    title: Optional[str]
) -> Optional[Task]:
    if not title:
        return None

    stmt = select(Task).where(
        Task.user_id == user_id,
        Task.title.ilike(f"%{title}%")
    )

    tasks = session.exec(stmt).all()

    if len(tasks) == 1:
        return tasks[0]

    return None


# -------------------------
# ADD TASK
# -------------------------
class AddTaskTool(BaseMCPTaskTool):
    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            title = params.get("title")
            description = params.get("description")

            if not title:
                return MCPToolError("INVALID_INPUT", "Title is required").dict()

            if len(title) > 200:
                return MCPToolError("INVALID_INPUT", "Title too long").dict()

            if description and len(description) > 1000:
                return MCPToolError("INVALID_INPUT", "Description too long").dict()

            with next(get_session()) as session:
                task = Task(
                    user_id=self.user_id,
                    title=title,
                    description=description,
                    completed=False
                )
                session.add(task)
                session.commit()
                session.refresh(task)

                return MCPToolResult(
                    success=True,
                    data={
                        "task_id": str(task.id),
                        "title": task.title,
                        "description": task.description,
                        "completed": task.completed,
                        "created_at": task.created_at.isoformat() if task.created_at else None,
                    },
                    message="Task created"
                ).dict()

        except Exception as e:
            return MCPToolError("DATABASE_ERROR", str(e)).dict()


# -------------------------
# LIST TASKS
# -------------------------
class ListTasksTool(BaseMCPTaskTool):
    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            filter_completed = params.get("filter_completed")
            limit = min(int(params.get("limit", 100)), 1000)

            with next(get_session()) as session:
                stmt = select(Task).where(Task.user_id == self.user_id)

                if filter_completed is not None:
                    stmt = stmt.where(Task.completed == filter_completed)

                stmt = stmt.limit(limit)
                tasks = session.exec(stmt).all()

                return MCPToolResult(
                    success=True,
                    data={
                        "tasks": [
                            {
                                "id": str(t.id),
                                "title": t.title,
                                "description": t.description,
                                "completed": t.completed,
                                "created_at": t.created_at.isoformat() if t.created_at else None,
                                "updated_at": t.updated_at.isoformat() if t.updated_at else None,
                            }
                            for t in tasks
                        ],
                        "total": len(tasks)
                    },
                    message="Tasks fetched"
                ).dict()

        except Exception as e:
            return MCPToolError("DATABASE_ERROR", str(e)).dict()


# -------------------------
# UPDATE TASK (SMART)
# -------------------------
class UpdateTaskTool(BaseMCPTaskTool):
    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            task_id = params.get("task_id")
            title_hint = params.get("title")

            update_fields = {
                k: v for k, v in params.items()
                if k in {"title", "description", "completed"} and v is not None
            }

            if not update_fields:
                return MCPToolError("INVALID_INPUT", "No fields to update").dict()

            with next(get_session()) as session:
                task = None

                if task_id:
                    task = session.exec(
                        select(Task)
                        .where(Task.id == task_id)
                        .where(Task.user_id == self.user_id)
                    ).first()
                else:
                    task = _infer_task_by_title(session, self.user_id, title_hint)

                if not task:
                    return MCPToolError(
                        "TASK_NOT_FOUND",
                        "Unable to uniquely identify task"
                    ).dict()

                for k, v in update_fields.items():
                    setattr(task, k, v)

                task.updated_at = datetime.now(timezone.utc)
                session.commit()
                session.refresh(task)

                return MCPToolResult(
                    success=True,
                    data={
                        "id": str(task.id),
                        "title": task.title,
                        "description": task.description,
                        "completed": task.completed,
                        "updated_at": task.updated_at.isoformat(),
                    },
                    message="Task updated"
                ).dict()

        except Exception as e:
            return MCPToolError("DATABASE_ERROR", str(e)).dict()


# -------------------------
# COMPLETE TASK (SMART)
# -------------------------
class CompleteTaskTool(BaseMCPTaskTool):
    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            task_id = params.get("task_id")
            title_hint = params.get("title")

            with next(get_session()) as session:
                task = None

                if task_id:
                    task = session.exec(
                        select(Task)
                        .where(Task.id == task_id)
                        .where(Task.user_id == self.user_id)
                    ).first()
                else:
                    task = _infer_task_by_title(session, self.user_id, title_hint)

                if not task:
                    return MCPToolError("TASK_NOT_FOUND", "Task not found").dict()

                task.completed = True
                task.updated_at = datetime.now(timezone.utc)
                session.commit()

                return MCPToolResult(
                    success=True,
                    data={
                        "id": str(task.id),
                        "completed": True,
                        "updated_at": task.updated_at.isoformat(),
                    },
                    message="Task completed"
                ).dict()

        except Exception as e:
            return MCPToolError("DATABASE_ERROR", str(e)).dict()


# -------------------------
# DELETE TASK (SMART)
# -------------------------
class DeleteTaskTool(BaseMCPTaskTool):
    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            task_id = params.get("task_id")
            title_hint = params.get("title")

            with next(get_session()) as session:
                task = None

                if task_id:
                    task = session.exec(
                        select(Task)
                        .where(Task.id == task_id)
                        .where(Task.user_id == self.user_id)
                    ).first()
                else:
                    task = _infer_task_by_title(session, self.user_id, title_hint)

                if not task:
                    return MCPToolError("TASK_NOT_FOUND", "Task not found").dict()

                session.delete(task)
                session.commit()

                return MCPToolResult(
                    success=True,
                    data={"deleted_task_id": str(task.id)},
                    message="Task deleted"
                ).dict()

        except Exception as e:
            return MCPToolError("DATABASE_ERROR", str(e)).dict()
