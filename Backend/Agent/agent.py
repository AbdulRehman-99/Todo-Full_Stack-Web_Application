import asyncio
import logging
import threading
from typing import List, Dict, Any, AsyncIterator
from dataclasses import dataclass

import openai
from agents import Agent, Runner, AsyncOpenAI
from agents import OpenAIChatCompletionsModel, ModelSettings, function_tool
from agents import set_tracing_disabled

# Disable internal tracing globally
set_tracing_disabled(True)

from .config import Config
from .guardrails import classify_message, GuardrailResult
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
    title: str = "",
    new_title: str | None = None,
    description: str | None = None,
    completed: bool | None = None,
    task_id: str = ""
) -> Dict[str, Any]:
    user_id = _get_context_user_id()
    if not user_id:
        return {"error": "Unauthenticated user"}

    params: Dict[str, Any] = {}
    if title:
        params["title"] = title
    if task_id:
        params["task_id"] = task_id
    if new_title is not None:
        params["new_title"] = new_title
    if description is not None:
        params["description"] = description
    if completed is not None:
        params["completed"] = completed

    return UpdateTaskTool(user_id).execute(params)


@function_tool
async def complete_task(title: str = "", task_id: str = "") -> Dict[str, Any]:
    user_id = _get_context_user_id()
    if not user_id:
        return {"error": "Unauthenticated user"}

    params: Dict[str, Any] = {}
    if title:
        params["title"] = title
    if task_id:
        params["task_id"] = task_id
    return CompleteTaskTool(user_id).execute(params)


@function_tool
async def delete_task(title: str = "", task_id: str = "") -> Dict[str, Any]:
    user_id = _get_context_user_id()
    if not user_id:
        return {"error": "Unauthenticated user"}

    params: Dict[str, Any] = {}
    if title:
        params["title"] = title
    if task_id:
        params["task_id"] = task_id
    return DeleteTaskTool(user_id).execute(params)


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
    "You are a helpful task management assistant.\n\n"

    "CRITICAL TOOL USAGE RULES:\n"
    "- You MUST always use tools for any task-related action.\n"
    "- NEVER ask the user for a task_id directly.\n"
    "- NEVER mention, display, or reference task IDs, UUIDs, or any technical identifiers in your responses.\n"
    "- NEVER output raw JSON, code blocks, tool parameters, or any structured data formats.\n"
    "- NEVER show the contents of tool calls or their return values.\n"
    "- ALWAYS respond in plain, natural language only.\n"
    "- If a tool call returns an error, tell the user in one simple sentence. Do NOT retry, do NOT show tool details, do NOT explain what went wrong technically.\n"
    "- When the user explicitly asks to delete, complete, or update all tasks, do NOT ask for confirmation — proceed directly.\n"
    "- Refer to tasks only by their title or description.\n\n"

    "TASK IDENTIFICATION LOGIC:\n"
    "  1) Call list_tasks to find the task (IDs are returned so you can use them later)\n"
    "  2) Match the task using its title mentioned by the user, or use its task_id directly\n"
    "  3) If exactly ONE task matches, proceed automatically\n"
    "  4) If MULTIPLE tasks match, ask the user to clarify\n\n"

    "BULK OPERATIONS (all tasks):\n"
    "  When the user asks to delete/complete/update ALL tasks:\n"
    "  1) Call list_tasks() first to get every task\n"
    "  2) Then, for EACH task returned, call the appropriate tool (delete_task, complete_task, or update_task) using its task_id\n"
    "  3) After all individual operations finish, summarize what happened for the user\n"
    "  Example: 'delete all tasks' → list_tasks() → delete_task(task_id='...') for each → 'Deleted all 5 tasks.'\n\n"

    "IMPORTANT:\n"
    "- Use task_id when you have it for exact operations, or use the title when that's all you have. Never display task_id to the user.\n"
    "- Do NOT stop and ask for a title if a clear match exists.\n\n"

    "Available tools:\n"
    "- add_task\n"
    "- list_tasks\n"
    "- update_task\n"
    "- complete_task\n"
    "- delete_task"
),

    tools=todo_tools,
    model=OpenAIChatCompletionsModel(
        model=Config.OPENROUTER_MODEL,
        openai_client=AsyncOpenAI(
            api_key=Config.OPENROUTER_API_KEY,
            base_url=Config.OPENROUTER_BASE_URL,
            default_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Todo Full-Stack App",
            },
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
        guardrail = classify_message(message)
        if guardrail == GuardrailResult.GREETING:
            return "Hello! I'm your task management assistant. How can I help you with your tasks today?"
        if guardrail == GuardrailResult.OFF_TOPIC:
            return "I can only help with task management operations — things like adding, viewing, completing, updating, or deleting tasks. Please ask me something task-related!"

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
            max_turns=25,
        )

        return result.final_output or "No response generated."

    except openai.RateLimitError:
        logger.warning("AI model rate limited (429)")
        return "The AI service is currently rate-limited. Please wait a moment and try again."
    except openai.APIStatusError as e:
        if e.status_code == 503:
            logger.warning("AI model unavailable (503)")
            return "The AI model is temporarily unavailable due to high demand. Please try again later."
        logger.error("Agent API error", exc_info=True)
        return f"AI service error (HTTP {e.status_code}). Please try again later."
    except Exception as e:
        logger.error("Agent error", exc_info=True)
        return "Sorry, something went wrong while processing your request."

    finally:
        if hasattr(_local_storage, "current_user_id"):
            delattr(_local_storage, "current_user_id")


async def initialize_agent():
    Config.validate()
    logger.info("TodoAgent initialized")


async def process_user_message_streamed(
    message: str,
    conversation_history: List[Dict[str, str]],
    user_id: str
) -> AsyncIterator[str]:
    try:
        guardrail = classify_message(message)
        if guardrail == GuardrailResult.GREETING:
            yield "Hello! I'm your task management assistant. How can I help you with your tasks today?"
            return
        if guardrail == GuardrailResult.OFF_TOPIC:
            yield "I can only help with task management operations — things like adding, viewing, completing, updating, or deleting tasks. Please ask me something task-related!"
            return

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
            max_turns=25,
        )

        output = result.final_output or "No response generated."
        words = output.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            await asyncio.sleep(0)

    except openai.RateLimitError:
        logger.warning("AI model rate limited (429)")
        yield "The AI service is currently rate-limited. Please wait a moment and try again."
    except openai.APIStatusError as e:
        if e.status_code == 503:
            logger.warning("AI model unavailable (503)")
            yield "The AI model is temporarily unavailable due to high demand. Please try again later."
        else:
            logger.error("Agent API error", exc_info=True)
            yield f"AI service error (HTTP {e.status_code}). Please try again later."
    except Exception as e:
        logger.error("Agent error", exc_info=True)
        yield "Sorry, something went wrong while processing your request."
    finally:
        if hasattr(_local_storage, "current_user_id"):
            delattr(_local_storage, "current_user_id")
