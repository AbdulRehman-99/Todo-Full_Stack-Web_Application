# Frontend Todo App

This is a frontend todo application built with Next.js, TypeScript, and Tailwind CSS. It provides a clean, responsive UI for managing tasks with in-memory state management.

## Features

- **Add Task**: Create new tasks with title and description
- **View Tasks**: See all tasks on the home page with filtering options
- **Edit Task**: Modify existing tasks via the edit page
- **Delete Task**: Remove tasks with confirmation modal
- **Mark Complete/Incomplete**: Toggle task completion status
- **Responsive Design**: Works on mobile, tablet, and desktop screens
- **Form Validation**: Inline validation for task creation and editing

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.4+
- **State Management**: React Context and useReducer
- **Package Manager**: npm

## Project Structure

```
Frontend/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Home page - displays all tasks with CRUD operations
│   ├── tasks/
│   │   ├── new/
│   │   │   └── page.tsx # New task page - form to create a task
│   │   └── [id]/
│   │       └── page.tsx # Edit task page - form to edit existing task
│   └── layout.tsx       # Root layout component with global providers
├── components/          # Reusable UI components
│   ├── Header.tsx       # Site navigation (Home, Add Task)
│   ├── TaskList.tsx     # Renders all tasks
│   ├── TaskItem.tsx     # Displays single task info + action buttons (edit, delete, toggle complete)
│   ├── TaskForm.tsx     # Form used for creating or editing tasks
│   └── DeleteConfirmationModal.tsx # Modal for delete confirmation
├── lib/                 # Utility functions and state management
│   ├── types.ts         # Type definitions for Task and other entities
│   ├── api.ts           # API client placeholder with mock implementation
│   └── taskStore.tsx    # Centralized state management with React Context and useReducer
├── styles/              # Tailwind CSS configuration and extra styling
│   └── globals.css      # Global styles
├── public/              # Static assets
├── package.json         # Project dependencies and scripts
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## State Management

The application uses React Context and useReducer for centralized state management. The `taskStore.tsx` file contains the global state for all tasks, with functions to load, add, update, delete, and toggle task completion status.

## API Layer

The `api.ts` file contains placeholder functions that will connect to a backend in future phases. Currently, it uses mock implementations for in-memory task management.