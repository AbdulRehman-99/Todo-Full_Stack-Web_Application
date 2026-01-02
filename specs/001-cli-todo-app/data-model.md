# Data Model: CLI Todo Application

## TodoItem Entity

### Attributes
- **id**: Integer (auto-incrementing, unique identifier starting from 1)
- **description**: String (text content of the todo item, max 500 characters)
- **completed**: Boolean (status indicating completion, default: False)
- **created_at**: DateTime (timestamp of creation)

### Validation Rules
- Description must not be empty or contain only whitespace
- Description must not exceed 500 characters
- ID must be unique within the collection
- ID must be a positive integer

### State Transitions
- **Pending** (completed = False) → **Completed** (completed = True) when marked complete
- **Completed** (completed = True) → **Pending** (completed = False) when marked incomplete (if supported)

## In-Memory Store

### Structure
- **todo_list**: List of TodoItem objects
- **next_id**: Integer (tracks the next available ID for auto-increment)

### Operations
- Add new TodoItem to the list
- Retrieve TodoItem by ID
- Update TodoItem properties
- Delete TodoItem by ID
- List all TodoItems
- Find TodoItem by ID with validation

### Constraints
- All data exists only in memory (lost when application closes)
- Maximum recommended size: 100 items for performance
- Thread safety not required (single-user application)