import asyncio
from typing import Dict, Any, List
from .agent import process_user_message, initialize_agent
from mcp.server import mcp_server


class AgentRunner:
    """
    Runner class to manage execution of the AI agent with MCP tools integration.
    Ensures proper initialization and sets user context for tools.
    """

    def __init__(self):
        self.initialized = False

    async def initialize(self):
        """Initialize the agent with required configurations."""
        await initialize_agent()
        self.initialized = True

    async def run_agent(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Run the AI agent and return the response.

        Args:
            user_message: Message from the user
            conversation_history: History of the conversation
            user_id: Authenticated user's ID

        Returns:
            Dictionary containing the agent's response and status
        """
        if not self.initialized:
            await self.initialize()

        # Ensure MCP tools are registered for this user session
        mcp_server.register_default_tools(user_id)

        try:
            response = await process_user_message(
                message=user_message,
                conversation_history=conversation_history,
                user_id=user_id
            )
            return {
                "response": response,
                "user_id": user_id,
                "success": True
            }

        except Exception as e:
            return {
                "response": f"Error processing message: {str(e)}",
                "user_id": user_id,
                "success": False
            }

    async def run_with_tools(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Run the agent with MCP tools enabled.

        The tools are automatically callable by the agent if included
        in agent.py's tools list. This method ensures context is set
        correctly for MCP tool execution.

        Args:
            user_message: Message from the user
            conversation_history: History of the conversation
            user_id: Authenticated user's ID

        Returns:
            Dictionary containing the final response and status
        """
        # Currently this just calls run_agent, but kept separate
        # for future advanced tool execution features
        return await self.run_agent(
            user_message=user_message,
            conversation_history=conversation_history,
            user_id=user_id
        )


# --- Global runner instance ---
agent_runner = AgentRunner()


async def get_agent_runner() -> AgentRunner:
    """Return the global agent runner, initializing it if necessary."""
    if not agent_runner.initialized:
        await agent_runner.initialize()
    return agent_runner
