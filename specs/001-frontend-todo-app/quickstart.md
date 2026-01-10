# Quickstart Guide: Frontend Todo App

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Basic knowledge of TypeScript and React

## Setup Instructions

### 1. Initialize Next.js Project
```bash
npx create-next-app@latest Frontend --typescript --tailwind --eslint
cd Frontend
```

### 2. Install Additional Dependencies
```bash
npm install uuid date-fns
# or
yarn add uuid date-fns
```

### 3. Project Structure Setup
Create the following directory structure:
```
Frontend/
├── app/
│   ├── page.tsx
│   ├── tasks/
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── layout.tsx
├── components/
│   ├── Header.tsx
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   ├── TaskForm.tsx
│   └── DeleteConfirmationModal.tsx
├── lib/
│   ├── types.ts
│   └── api.ts
├── styles/
│   └── globals.css
```

### 4. Environment Configuration
No environment variables needed for this in-memory implementation.

### 5. Run Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

## Key Features Implementation Order

1. **Task State Management**: Implement in-memory task storage using React hooks
2. **Core Pages**: Create home page, new task page, and edit task page
3. **Reusable Components**: Build Header, TaskList, TaskItem, and TaskForm components
4. **Form Validation**: Implement validation for task creation and editing
5. **Responsive UI**: Apply Tailwind CSS for responsive design across breakpoints
6. **Optional Enhancements**: Add filtering, sorting, and delete confirmation

## API Placeholder Structure
The `lib/api.ts` file contains placeholder functions that will connect to backend in future phases:
- `getTasks()` - Retrieve all tasks
- `createTask(task)` - Create a new task
- `updateTask(id, task)` - Update an existing task
- `deleteTask(id)` - Delete a task
- `toggleTaskCompletion(id)` - Toggle task completion status