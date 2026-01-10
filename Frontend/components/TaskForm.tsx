// Task ID: T021 - Create TaskForm component for creating and editing tasks
// Task ID: T023 - Implement form validation for required fields (title: 1-255 chars)
// Task ID: T024 - Implement inline validation error display for the form
// Task ID: T028 - Enhance TaskForm component to handle editing existing tasks
// Task ID: T033 - Implement validation for edit form with inline error display
'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';

interface TaskFormProps {
  initialTask?: Task;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'completed'> | Partial<Task>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function TaskForm({ initialTask, onSubmit, onCancel, isEditing = false }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 1 || title.length > 255) {
      newErrors.title = 'Title must be between 1 and 255 characters';
    }

    if (description && description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate) {
      if (isEditing && initialTask) {
        onSubmit({ title: title.trim(), description: description.trim() });
      } else {
        onSubmit({ title: title.trim(), description: description.trim() });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) {
              setErrors(prev => ({ ...prev, title: undefined }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter task title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) {
              setErrors(prev => ({ ...prev, description: undefined }));
            }
          }}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter task description (optional)"
        ></textarea>
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}