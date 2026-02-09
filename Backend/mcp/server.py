from typing import Dict, Any, Callable
from mcp.task_tools import AddTaskTool, ListTasksTool, UpdateTaskTool, CompleteTaskTool, DeleteTaskTool
from fastapi import HTTPException


class MCPServer:
    """MCP Server to handle tool registration and execution."""

    def __init__(self):
        self.tools: Dict[str, Callable] = {}

    def register_tool(self, name: str, tool_func: Callable):
        """Register a tool with the server."""
        self.tools[name] = tool_func

    def register_default_tools(self, user_id: str):
        """Register all default task management tools."""
        # Create instances of tools with the user context
        add_tool = AddTaskTool(user_id)
        list_tool = ListTasksTool(user_id)
        update_tool = UpdateTaskTool(user_id)
        complete_tool = CompleteTaskTool(user_id)
        delete_tool = DeleteTaskTool(user_id)

        # Register the tools
        self.register_tool("add_task", add_tool.execute)
        self.register_tool("list_tasks", list_tool.execute)
        self.register_tool("update_task", update_tool.execute)
        self.register_tool("complete_task", complete_tool.execute)
        self.register_tool("delete_task", delete_tool.execute)

    async def execute_tool(self, method: str, params: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Execute a tool with the given method and parameters.

        Args:
            method: The name of the tool to execute
            params: Parameters for the tool execution
            user_id: The ID of the authenticated user

        Returns:
            Dictionary containing the result of the tool execution
        """
        if method not in self.tools:
            raise HTTPException(status_code=400, detail=f"Unknown tool: {method}")

        # Execute the tool
        result = self.tools[method](params)
        return result


# Global MCP server instance
mcp_server = MCPServer()