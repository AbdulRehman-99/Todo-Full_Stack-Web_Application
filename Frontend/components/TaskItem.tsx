'use client';

import { Task } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { Pencil, Trash2, Check, AlertTriangle } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    if (task.completed) {
      onDelete(task.id);
    } else {
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
    <li className="card-hover p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`relative flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-200 ${
              task.completed
                ? 'bg-success-500 border-success-500 scale-105'
                : 'border-surface-300 hover:border-primary-400 hover:scale-105'
            }`}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed && (
              <Check size={14} className="text-white animate-scale-in" strokeWidth={3} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-semibold ${task.completed ? 'line-through text-surface-400' : 'text-surface-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`mt-1.5 text-sm ${task.completed ? 'line-through text-surface-400' : 'text-surface-500'}`}>
                {task.description}
              </p>
            )}
            <div className="mt-2.5 flex items-center gap-3 text-xs text-surface-400">
              <span>Created: {task.createdAt.toLocaleDateString()}</span>
              {task.updatedAt && (
                <span>Updated: {task.updatedAt.toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Link
            href={`/tasks/${task.id}`}
            className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
            aria-label="Edit task"
          >
            <Pencil size={16} />
          </Link>
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-50 transition-all duration-200"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-soft-lg animate-scale-in">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-50">
              <AlertTriangle size={24} className="text-danger-500" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-surface-900 mb-2">Delete Task</h3>
              <p className="text-surface-500 text-sm mb-6">
                Are you sure you want to delete &ldquo;{task.title}&rdquo;? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
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
