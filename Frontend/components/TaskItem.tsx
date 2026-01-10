// Task ID: T009 - Create basic TaskItem component to display task information
// Task ID: T015 - Enhance TaskItem component to include toggle completion button
// Task ID: T016 - Implement visual distinction for completed tasks (strikethrough)
// Task ID: T032 - Add edit button to TaskItem component that navigates to edit page
// Task ID: T035 - Add delete button to TaskItem component
'use client';

import { Task } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    if (task.completed) {
      // If task is already completed, delete directly
      onDelete(task.id);
    } else {
      // Otherwise, show confirmation
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <li className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors duration-200 ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-blue-500'
            }`}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`mt-2 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>Created: {task.createdAt.toLocaleDateString()}</span>
              {task.updatedAt && (
                <span className="ml-3">Updated: {task.updatedAt.toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2 ml-4">
          <Link
            href={`/tasks/${task.id}`}
            className="btn-secondary"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit
          </Link>
          <button
            onClick={handleDeleteClick}
            className="btn-danger"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl transform transition-all">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the task "{task.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}