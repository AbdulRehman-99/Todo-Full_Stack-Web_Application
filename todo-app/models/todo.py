"""
TodoItem model and in-memory store for the CLI Todo Application.

This module contains the TodoItem class and the in-memory store that manages
all todo items during the application session.
"""
from datetime import datetime
from typing import List, Optional


class TodoItem:
    """Represents a single todo item with id, description, completion status, and timestamp."""

    def __init__(self, id: int, description: str, completed: bool = False):
        """
        Initialize a TodoItem.

        Args:
            id: Unique identifier for the todo item
            description: Text description of the todo
            completed: Boolean indicating completion status (default: False)
        """
        if not description or not description.strip():
            raise ValueError("Description cannot be empty or contain only whitespace")

        if len(description.strip()) > 500:
            raise ValueError("Description exceeds 500 character limit")

        self.id = id
        self.description = description.strip()
        self.completed = completed
        self.created_at = datetime.now()

    def __str__(self) -> str:
        """Return a string representation of the TodoItem."""
        status = "X" if self.completed else "O"
        return f"[{status}] {self.id}. {self.description}"

    def __repr__(self) -> str:
        """Return a detailed string representation of the TodoItem."""
        return f"TodoItem(id={self.id}, description='{self.description}', completed={self.completed}, created_at={self.created_at})"


class InMemoryTodoStore:
    """In-memory store for managing todo items."""

    def __init__(self):
        """Initialize the in-memory store."""
        self.todo_list: List[TodoItem] = []
        self.next_id = 1

    def add_todo(self, description: str) -> TodoItem:
        """
        Add a new todo item to the store.

        Args:
            description: Text description of the todo item

        Returns:
            TodoItem: The newly created TodoItem
        """
        if not description or not description.strip():
            raise ValueError("Description cannot be empty or contain only whitespace")

        if len(description.strip()) > 500:
            raise ValueError("Description exceeds 500 character limit")

        todo_item = TodoItem(id=self.next_id, description=description.strip())
        self.todo_list.append(todo_item)
        self.next_id += 1
        return todo_item

    def get_todo_by_id(self, todo_id: int) -> Optional[TodoItem]:
        """
        Retrieve a todo item by its ID.

        Args:
            todo_id: The ID of the todo item to retrieve

        Returns:
            TodoItem if found, None otherwise
        """
        for todo in self.todo_list:
            if todo.id == todo_id:
                return todo
        return None

    def get_all_todos(self) -> List[TodoItem]:
        """
        Retrieve all todo items in the store.

        Returns:
            List of all TodoItems
        """
        return self.todo_list.copy()

    def update_todo(self, todo_id: int, new_description: str) -> bool:
        """
        Update the description of a todo item.

        Args:
            todo_id: The ID of the todo item to update
            new_description: The new description

        Returns:
            True if the todo was updated, False if not found
        """
        if not new_description or not new_description.strip():
            raise ValueError("Description cannot be empty or contain only whitespace")

        if len(new_description.strip()) > 500:
            raise ValueError("Description exceeds 500 character limit")

        for todo in self.todo_list:
            if todo.id == todo_id:
                todo.description = new_description.strip()
                return True
        return False

    def delete_todo(self, todo_id: int) -> bool:
        """
        Delete a todo item by its ID.

        Args:
            todo_id: The ID of the todo item to delete

        Returns:
            True if the todo was deleted, False if not found
        """
        for i, todo in enumerate(self.todo_list):
            if todo.id == todo_id:
                del self.todo_list[i]
                return True
        return False

    def mark_complete(self, todo_id: int) -> bool:
        """
        Mark a todo item as complete.

        Args:
            todo_id: The ID of the todo item to mark as complete

        Returns:
            True if the todo was marked as complete, False if not found
        """
        for todo in self.todo_list:
            if todo.id == todo_id:
                todo.completed = True
                return True
        return False

    def mark_incomplete(self, todo_id: int) -> bool:
        """
        Mark a todo item as incomplete.

        Args:
            todo_id: The ID of the todo item to mark as incomplete

        Returns:
            True if the todo was marked as incomplete, False if not found
        """
        for todo in self.todo_list:
            if todo.id == todo_id:
                todo.completed = False
                return True
        return False