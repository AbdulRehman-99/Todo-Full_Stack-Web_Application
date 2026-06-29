# API Contracts: CLI Todo Application

## Todo Management Operations

### Add Todo
- **Command**: `add`
- **Input**: Todo description (string, max 500 chars)
- **Output**: Success message with assigned ID or error message
- **Success Response**: "Todo added with ID: {id}"
- **Error Responses**:
  - "Error: Description cannot be empty"
  - "Error: Description exceeds 500 character limit"

### View Todos
- **Command**: `view` or `list`
- **Input**: None
- **Output**: List of all todos with ID, description, and completion status
- **Success Response**: Formatted list of todos or "No todos found"
- **Error Responses**: None

### Update Todo
- **Command**: `update`
- **Input**: Todo ID (integer) and new description (string, max 500 chars)
- **Output**: Success confirmation or error message
- **Success Response**: "Todo {id} updated successfully"
- **Error Responses**:
  - "Error: Todo with ID {id} not found"
  - "Error: Description cannot be empty"

### Delete Todo
- **Command**: `delete`
- **Input**: Todo ID (integer)
- **Output**: Success confirmation or error message
- **Success Response**: "Todo {id} deleted successfully"
- **Error Responses**: "Error: Todo with ID {id} not found"

### Mark Complete
- **Command**: `complete`
- **Input**: Todo ID (integer)
- **Output**: Success confirmation or error message
- **Success Response**: "Todo {id} marked as complete"
- **Error Responses**: "Error: Todo with ID {id} not found"

### Menu Interface
- **Command**: None (default)
- **Output**: Display menu options 1-6
- **Options**:
  1. Add Todo
  2. View Todos
  3. Update Todo
  4. Delete Todo
  5. Mark Complete
  6. Exit