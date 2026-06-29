# Quickstart: CLI Todo Application

## Prerequisites
- Python 3.13 or higher
- UV package manager (optional, for dependency management)

## Setup
1. Clone the repository
2. Navigate to the todo-app directory
3. Run the application: `python main.py`

## Usage
The application provides a menu-driven interface:

```
CLI Todo App
1. Add Todo
2. View Todos
3. Update Todo
4. Delete Todo
5. Mark Complete
6. Exit
```

### Adding a Todo
1. Select option 1
2. Enter your todo description (max 500 characters)
3. The system will assign an auto-generated ID

### Viewing Todos
1. Select option 2
2. All todos will be displayed with their status and ID

### Updating a Todo
1. Select option 3
2. Enter the ID of the todo to update
3. Enter the new description

### Deleting a Todo
1. Select option 4
2. Enter the ID of the todo to delete

### Marking Complete
1. Select option 5
2. Enter the ID of the todo to mark as complete

## Architecture
- **Domain Layer**: TodoItem model in `models/todo.py`
- **Application Layer**: TodoService with command handlers in `services/todo_service.py`
- **Interface Layer**: Menu-driven console interface in `cli/interface.py`

## Data Flow
1. User inputs command via console interface
2. Interface calls appropriate service method
3. Service interacts with in-memory todo store
4. Results are returned to interface for display