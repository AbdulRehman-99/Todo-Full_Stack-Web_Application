# Data Model: Frontend Todo App

## Task Entity

### Fields
- **id**: string | number (required, unique identifier, auto-generated)
- **title**: string (required, 1-255 characters)
- **description**: string (optional, max 1000 characters)
- **completed**: boolean (required, default: false)
- **createdAt**: Date | string (required, auto-generated timestamp)
- **updatedAt**: Date | string (optional, updated when task is modified)

### Validation Rules
- title: Required, minimum 1 character, maximum 255 characters
- description: Optional, maximum 1000 characters
- completed: Boolean value, default is false
- createdAt: Auto-generated timestamp when task is created
- updatedAt: Auto-generated timestamp when task is modified

### State Transitions
- New Task: `completed = false` (default)
- Toggle Complete: `completed = !completed` (toggles between true/false)
- Edit Task: Update `title`, `description`, `updatedAt`
- Delete Task: Remove from task collection

## TaskList Collection

### Structure
- Array of Task entities
- Maintained in-memory during user session
- Supports CRUD operations (Create, Read, Update, Delete)

### Operations
- **Create**: Add new Task to collection with unique ID
- **Read**: Filter, sort, display tasks from collection
- **Update**: Modify existing Task in collection
- **Delete**: Remove Task from collection

## Type Definitions (TypeScript)

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

type TaskList = Task[];

type TaskStatus = 'active' | 'completed' | 'all';
```