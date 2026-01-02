"""
TodoService for the CLI Todo Application.

This service handles all business logic for todo operations.
"""
from typing import List, Optional
from models.todo import InMemoryTodoStore, TodoItem


class TodoService:
    """Service class for handling todo operations."""

    def __init__(self):
        """Initialize the TodoService with an in-memory store."""
        self.store = InMemoryTodoStore()

    def add_todo(self, description: str) -> str:
        """
        Add a new todo item.

        Args:
            description: Description of the todo item

        Returns:
            Success message with the assigned ID
        """
        try:
            todo_item = self.store.add_todo(description)
            return f"Todo added with ID: {todo_item.id}"
        except ValueError as e:
            return f"Error: {str(e)}"

    def get_all_todos(self) -> List[TodoItem]:
        """
        Get all todo items.

        Returns:
            List of all TodoItems
        """
        return self.store.get_all_todos()

    def get_todo_by_id(self, todo_id: int) -> Optional[TodoItem]:
        """
        Get a specific todo item by ID.

        Args:
            todo_id: ID of the todo item to retrieve

        Returns:
            TodoItem if found, None otherwise
        """
        return self.store.get_todo_by_id(todo_id)

    def update_todo(self, todo_id: int, new_description: str) -> str:
        """
        Update a todo item's description.

        Args:
            todo_id: ID of the todo item to update
            new_description: New description for the todo item

        Returns:
            Success or error message
        """
        try:
            if self.store.update_todo(todo_id, new_description):
                return f"Todo {todo_id} updated successfully"
            else:
                return f"Error: Todo with ID {todo_id} not found"
        except ValueError as e:
            return f"Error: {str(e)}"

    def delete_todo(self, todo_id: int) -> str:
        """
        Delete a todo item.

        Args:
            todo_id: ID of the todo item to delete

        Returns:
            Success or error message
        """
        if self.store.delete_todo(todo_id):
            return f"Todo {todo_id} deleted successfully"
        else:
            return f"Error: Todo with ID {todo_id} not found"

    def mark_complete(self, todo_id: int) -> str:
        """
        Mark a todo item as complete.

        Args:
            todo_id: ID of the todo item to mark as complete

        Returns:
            Success or error message
        """
        if self.store.mark_complete(todo_id):
            return f"Todo {todo_id} marked as complete"
        else:
            return f"Error: Todo with ID {todo_id} not found"

    def mark_incomplete(self, todo_id: int) -> str:
        """
        Mark a todo item as incomplete.

        Args:
            todo_id: ID of the todo item to mark as incomplete

        Returns:
            Success or error message
        """
        if self.store.mark_incomplete(todo_id):
            return f"Todo {todo_id} marked as incomplete"
        else:
            return f"Error: Todo with ID {todo_id} not found"

    def get_store_statistics(self) -> dict:
        """
        Get statistics about the todo store.

        Returns:
            Dictionary with store statistics
        """
        all_todos = self.store.get_all_todos()
        total_count = len(all_todos)
        completed_count = sum(1 for todo in all_todos if todo.completed)
        pending_count = total_count - completed_count

        return {
            "total_todos": total_count,
            "completed_todos": completed_count,
            "pending_todos": pending_count
        }