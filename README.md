# CLI Todo Application

A simple command-line interface (CLI) todo application that runs entirely in memory. All data is lost when the application closes, making it perfect for quick task management without persistence concerns.

## Features

- Add new todo items
- View all todo items
- Update existing todo items
- Delete todo items
- Mark todo items as complete/incomplete
- Menu-driven interface for easy navigation

## Requirements

- Python 3.13+
- UV package manager

## Installation

1. Clone or download the repository
2. Navigate to the project directory
3. Install dependencies using UV:
   ```bash
   uv sync
   ```

## Usage

Run the application using Python:

```bash
python main.py
```

The application will present a menu with the following options:
1. Add Todo - Add a new todo item
2. View Todos - Display all todo items
3. Update Todo - Modify an existing todo item
4. Delete Todo - Remove a todo item
5. Mark Complete - Mark a todo as complete
6. Exit - Close the application

## Data Model

- **TodoItem**: Each todo has an ID, description, completion status, and creation timestamp
- **In-Memory Storage**: All data is stored in memory only and lost when the application closes
- **Character Limit**: Descriptions are limited to 500 characters
- **ID System**: Auto-incrementing numeric IDs starting from 1

## Architecture

The application follows a layered architecture:
- **Domain Layer**: TodoItem class and in-memory store in `models/todo.py`
- **Application Layer**: TodoService with command handlers in `services/todo_service.py`
- **Interface Layer**: Menu-driven console interface in `cli/interface.py`

## Phase I Constraints

- Pure in-memory Python console application
- No persistence (files, databases), networking, or external APIs
- Clear separation between domain logic, application state, and I/O handling
- Built with Python 3.13+ standard library only (no external dependencies)