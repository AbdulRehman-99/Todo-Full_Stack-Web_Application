"""
CLI Interface for the Todo Application.

This module provides a menu-driven interface for interacting with the todo application.
"""
from services.todo_service import TodoService


class TodoInterface:
    """Menu-driven interface for the CLI Todo Application."""

    def __init__(self):
        """Initialize the TodoInterface with a TodoService."""
        self.service = TodoService()
        self.running = True

    def display_menu(self):
        """Display the main menu options."""
        print("\n" + "="*40)
        print("CLI Todo App")
        print("="*40)
        print("1. Add Todo")
        print("2. View Todos")
        print("3. Update Todo")
        print("4. Delete Todo")
        print("5. Mark Complete")
        print("6. Exit")
        print("="*40)

    def get_user_choice(self) -> str:
        """Get user choice from the menu."""
        try:
            choice = input("Enter your choice (1-6): ").strip()
            return choice
        except (EOFError, KeyboardInterrupt):
            print("\nExiting application...")
            return "6"

    def handle_add_todo(self):
        """Handle adding a new todo item."""
        description = input("Enter todo description: ").strip()
        result = self.service.add_todo(description)
        print(result)

    def handle_view_todos(self):
        """Handle viewing all todo items."""
        todos = self.service.get_all_todos()

        if not todos:
            print("No todos found")
        else:
            print("\nYour Todo List:")
            for todo in todos:
                print(todo)

            stats = self.service.get_store_statistics()
            print(f"\nStatistics: {stats['total_todos']} total, "
                  f"{stats['pending_todos']} pending, {stats['completed_todos']} completed")

    def handle_update_todo(self):
        """Handle updating a todo item."""
        try:
            todo_id = int(input("Enter ID of todo to update: "))
            new_description = input("Enter new description: ").strip()
            result = self.service.update_todo(todo_id, new_description)
            print(result)
        except ValueError:
            print("Error: Please enter a valid ID (integer)")

    def handle_delete_todo(self):
        """Handle deleting a todo item."""
        try:
            todo_id = int(input("Enter ID of todo to delete: "))
            result = self.service.delete_todo(todo_id)
            print(result)
        except ValueError:
            print("Error: Please enter a valid ID (integer)")

    def handle_mark_complete(self):
        """Handle marking a todo item as complete."""
        try:
            todo_id = int(input("Enter ID of todo to mark complete: "))
            result = self.service.mark_complete(todo_id)
            print(result)
        except ValueError:
            print("Error: Please enter a valid ID (integer)")

    def handle_choice(self, choice: str):
        """Handle the user's menu choice."""
        if choice == "1":
            self.handle_add_todo()
        elif choice == "2":
            self.handle_view_todos()
        elif choice == "3":
            self.handle_update_todo()
        elif choice == "4":
            self.handle_delete_todo()
        elif choice == "5":
            self.handle_mark_complete()
        elif choice == "6":
            print("Thank you for using CLI Todo App!")
            self.running = False
        else:
            print(f"Error: Invalid choice '{choice}'")
            self.display_menu()

    def run(self):
        """Main application loop."""
        print("Welcome to CLI Todo App!")
        while self.running:
            self.display_menu()
            choice = self.get_user_choice()
            self.handle_choice(choice)