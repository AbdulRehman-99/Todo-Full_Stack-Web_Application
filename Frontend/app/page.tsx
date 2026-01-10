// Task ID: T014 - Create home page (Frontend/app/page.tsx) to display all tasks
// Task ID: T018 - Connect home page to task state management
// Task ID: T019 - Add navigation from Header to home page
'use client';

import { useEffect } from 'react';
import { TaskStatus } from '@/lib/types';
import { useTaskContext } from '@/lib/taskStore';
import TaskList from '@/components/TaskList';

export default function HomePage() {
  const { state, loadTasks, toggleComplete, deleteTask, setFilter } = useTaskContext();

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  if (state.loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{state.error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">My Todo List</h1>
        <p className="mt-3 text-lg text-gray-600">
          Manage your tasks efficiently and stay productive
        </p>
      </div>

      <div className="card">
        <TaskList
          tasks={state.tasks}
          onToggleComplete={toggleComplete}
          onDelete={deleteTask}
          filter={state.filter}
          onFilterChange={setFilter}
        />
      </div>
    </div>
  );
}