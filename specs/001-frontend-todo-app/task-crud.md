# Feature: Frontend Task CRUD Operations

## User Stories
- As a user, I can **create a new task** via the UI
- As a user, I can **view all my tasks**
- As a user, I can **update task details** from the UI
- As a user, I can **delete tasks** via the UI
- As a user, I can **mark tasks as complete or incomplete**

## Acceptance Criteria

### Create Task
- User can type title (1-200 characters) and optional description (max 1000 characters)
- Submit button triggers API call to create task
- UI shows new task immediately

### View Tasks
- Display list of tasks fetched from API
- Show task title, description, and completion status
- Allow filtering by status (All, Pending, Completed)

### Update Task
- User can edit task title and description
- Submit triggers API call to update task
- UI reflects changes immediately

### Delete Task
- User can click delete button on a task
- Confirmation prompt before deletion
- Task is removed from UI after successful API call

### Mark Complete/Incomplete
- Toggle button to mark task complete/incomplete
- Status update reflected immediately in the UI
- Optional visual indicator (strike-through for completed)

## Rules
- Implement only what spec defines
- Reference Task IDs in code/comments
- Follow Tailwind CSS for styling
- Communicate with backend via API client (`@/lib/api.ts`)
