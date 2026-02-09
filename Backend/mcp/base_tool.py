from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel


class MCPToolResult(BaseModel):
    """Standard result format for MCP tool operations."""
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


class MCPToolError(BaseModel):
    """Standard error format for MCP tool operations."""
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class BaseMCPTaskTool(ABC):
    """Base class for all MCP task management tools."""

    def __init__(self, user_id: str):
        """
        Initialize the tool with the authenticated user's ID.

        Args:
            user_id: The ID of the authenticated user making the request
        """
        self.user_id = user_id

    @abstractmethod
    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the tool with the given parameters.

        Args:
            params: Parameters for the tool execution

        Returns:
            Dictionary containing the result of the operation
        """
        pass

    def validate_user_access(self, target_user_id: str) -> bool:
        """
        Validate that the current user has access to the target resource.

        Args:
            target_user_id: The user ID of the resource owner

        Returns:
            True if the current user has access, False otherwise
        """
        return self.user_id == target_user_id