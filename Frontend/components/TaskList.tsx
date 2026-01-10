// Task ID: T010 - Create basic TaskList component to display multiple tasks
'use client';

import { Task, TaskStatus } from '@/lib/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  filter: TaskStatus;
  onFilterChange: (filter: TaskStatus) => void;
}

export default function TaskList({ tasks, onToggleComplete, onDelete, filter, onFilterChange }: TaskListProps) {
  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all' filter
  });

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>

          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                filter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onFilterChange('active')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                filter === 'active'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => onFilterChange('completed')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tasks</h3>
          <p className="mt-2 text-gray-500">
            {filter === 'completed'
              ? 'No completed tasks yet.'
              : filter === 'active'
                ? 'No active tasks. Great job!'
                : 'No tasks yet. Add one to get started!'}
          </p>
          {filter === 'all' && (
            <div className="mt-6">
              <a
                href="/tasks/new"
                className="btn-primary"
              >
                Create your first task
              </a>
            </div>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}