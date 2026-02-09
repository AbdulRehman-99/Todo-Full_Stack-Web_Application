import asyncio
import logging
import threading
from typing import List, Dict, Any
from dataclasses import dataclass

from agents import Agent, Runner, AsyncOpenAI
from agents import OpenAIChatCompletionsModel, ModelSettings, function_tool
from agents import set_tracing_disabled

# Disable internal tracing globally
set_tracing_disabled(True)

from .config import Config
from mcp.server import mcp_server
from mcp.task_tools import (
    AddTaskTool,
    ListTasksTool,
    UpdateTaskTool,
    CompleteTaskTool,
    DeleteTaskTool,
)

logger = logging.getLogger(__name__)

# Thread-local storage for authenticated user context
_local_storage = threading.local()


def _get_context_user_id() -> str | None:
    return getattr(_local_storage, "current_user_id", None)


# =========================
# MCP TOOL WRAPPERS
# =========================

@function_tool
async def add_task(title: str, description: str = "") -> Dict[str, Any]:
    user_id = _get_context_user_id()
    if not user_id:
        return {"error": "Unauthenticated user"}
    return AddTaskTool(user_id).execute({
        "title": title,
        "description": description
    })


@function_tool
async def list_tasks(filter_completed: bool | None = None, limit: int = 100) -> Dict[str, Any]:
    """
    List user tasks.
    - filter_completed: true / false / null
    """
    user_id = _get_context_user_id()
    if not user_id:
        return {"error": "Unauthenticated user"}

    return ListTasksTool(user_id).execute({
        "filter_completed": filter_completed,
        "limit": limit
    })


@function_tool
async def update_task(
    task_id: str,
    title: str | None = None,
    description: str | None = None,
    completed: bool | None = None
) -> Dict[str, Any]:
    user_id = _get_context_user_id()
    if not user_id:
        return {"error": "Unauthenticated user"}

    params: Dict[str, Any] = {"task_id": task_id}
    if title is not None:
        params["title"] = title
    if description is not None:
        params["description"] = description
    if completed is not None:
        params["completed"] = completed

    return UpdateTaskTool(user_id).execute(params)


@function_tool
async def complete_task(task_id: str) -> Dict[str, Any]:
    user_id = _get_context_user_id()
    if not user_id:
        return {"error": "Unauthenticated user"}

    return CompleteTaskTool(user_id).execute({"task_id": task_id})


@function_tool
async def delete_task(task_id: str) -> Dict[str, Any]:
    user_id = _get_context_user_id()
    if not user_id:
        return {"error": "Unauthenticated user"}

    return DeleteTaskTool(user_id).execute({"task_id": task_id})


todo_tools = [
    add_task,
    list_tasks,
    update_task,
    complete_task,
    delete_task,
]


# =========================
# CONTEXT
# =========================

@dataclass
class Context:
    user_message: str
    conversation_history: List[Dict[str, str]]
    user_id: str
    metadata: Dict[str, Any]


# =========================
# AGENT
# =========================

todo_agent = Agent(
    name="TodoAgent",
    instructions=(
    "You are a task management assistant.\n\n"

    "CRITICAL TOOL USAGE RULES:\n"
    "- You MUST always use tools for any task-related action.\n"
    "- NEVER ask the user for a task_id directly.\n\n"

    "TASK IDENTIFICATION LOGIC:\n"
    "- If the user wants to update, complete, or delete a task and does NOT give a task_id:\n"
    "  1) Call list_tasks\n"
    "  2) Match the task using the task title or description mentioned by the user\n"
    "  3) If exactly ONE task matches, proceed automatically\n"
    "  4) If MULTIPLE tasks match, ask the user to clarify\n\n"

    "IMPORTANT:\n"
    "- Assume tools can infer task_id from title if needed\n"
    "- Do NOT stop and ask for task_id if a clear match exists\n\n"

    "Available tools:\n"
    "- add_task\n"
    "- list_tasks\n"
    "- update_task\n"
    "- complete_task\n"
    "- delete_task"
),

    tools=todo_tools,
    model=OpenAIChatCompletionsModel(
        model=Config.GEMINI_MODEL,
        openai_client=AsyncOpenAI(
            api_key=Config.GEMINI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/",
            _strict_response_validation=False,
        ),
    ),
    model_settings=ModelSettings(
        max_tokens=Config.MAX_OUTPUT_TOKENS,
        temperature=Config.TEMPERATURE,
    ),
)


# =========================
# MESSAGE HANDLER
# =========================

async def process_user_message(
    message: str,
    conversation_history: List[Dict[str, str]],
    user_id: str
) -> str:
    try:
        _local_storage.current_user_id = user_id
        mcp_server.register_default_tools(user_id)

        context = Context(
            user_message=message,
            conversation_history=conversation_history,
            user_id=user_id,
            metadata={"ts": asyncio.get_event_loop().time()},
        )

        result = await Runner.run(
            todo_agent,
            message,
            context=context,
        )

        return result.final_output or "No response generated."

    except Exception as e:
        logger.error("Agent error", exc_info=True)
        return "Sorry, something went wrong while processing your request."

    finally:
        if hasattr(_local_storage, "current_user_id"):
            delattr(_local_storage, "current_user_id")


async def initialize_agent():
    Config.validate()
    logger.info("TodoAgent initialized")
