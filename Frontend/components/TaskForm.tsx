'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { Type, FileText, X, Check } from 'lucide-react';

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

    if (validate()) {
      if (isEditing && initialTask) {
        onSubmit({ title: title.trim(), description: description.trim() });
      } else {
        onSubmit({ title: title.trim(), description: description.trim() });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="form-label flex items-center gap-1.5">
          <Type size={14} className="text-surface-400" />
          Title <span className="text-danger-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                const newErrors = { ...errors };
                delete newErrors.title;
                setErrors(newErrors);
              }
            }}
            className={`input-field ${errors.title ? 'input-error' : ''}`}
            placeholder="What needs to be done?"
          />
          {title && !errors.title && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check size={16} className="text-success-500" />
            </div>
          )}
        </div>
        {errors.title && (
          <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-danger-500" />
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="form-label flex items-center gap-1.5">
          <FileText size={14} className="text-surface-400" />
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) {
              const newErrors = { ...errors };
              delete newErrors.description;
              setErrors(newErrors);
            }
          }}
          rows={4}
          className={`input-field resize-none ${errors.description ? 'input-error' : ''}`}
          placeholder="Add more details (optional)"
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-danger-500" />
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary w-full sm:w-auto"
        >
          <X size={16} className="mr-1.5" />
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto"
        >
          <Check size={16} className="mr-1.5" />
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
