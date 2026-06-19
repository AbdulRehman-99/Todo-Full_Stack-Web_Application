'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/lib/types';
import { useTaskContext } from '@/lib/taskStore';
import { apiClient } from '@/src/lib/api';
import TaskForm from '@/components/TaskForm';
import { Pencil, CheckSquare } from 'lucide-react';

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { state, loadTasks, updateTask } = useTaskContext();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const currentTask = state.tasks.find(task => task.id === params.id);

  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(currentTask || null);
  const [isLoadingTask, setIsLoadingTask] = React.useState(!currentTask);

  React.useEffect(() => {
    const fetchTask = async () => {
      if (!currentTask) {
        try {
          setIsLoadingTask(true);
          const response = await apiClient.tasks.getById(params.id);
          const foundTask = response.data;

          if (foundTask) {
            setTaskToEdit(foundTask);
          }
        } catch (error) {
          console.error('Error fetching task:', error);
        } finally {
          setIsLoadingTask(false);
        }
      } else {
        setTaskToEdit(currentTask);
        setIsLoadingTask(false);
      }
    };

    fetchTask();
  }, [params.id, currentTask]);

  const handleSubmit = async (taskData: Partial<Task>) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, taskData);
      router.push('/');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (state.loading || isLoadingTask) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 animate-fade-in">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-surface-500">Loading task...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-4 border-danger-100 bg-danger-50/50 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-danger-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-danger-800">Error</h3>
              <p className="mt-1 text-sm text-danger-600">{state.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!taskToEdit) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6 border-warning-100 bg-warning-50/50 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-warning-800">Task Not Found</h3>
              <p className="mt-1 text-sm text-warning-600">
                The task you&apos;re looking for doesn&apos;t exist or may have been deleted.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in-down">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow-sm">
            <Pencil size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Edit Task</h1>
            <p className="text-sm text-surface-500">Update the details for your task</p>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="card p-4 mb-6 border-danger-100 bg-danger-50/50 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-danger-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-danger-800">Error</h3>
              <p className="mt-1 text-sm text-danger-600">{state.error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card p-6 animate-fade-in-up">
        <TaskForm
          initialTask={taskToEdit}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={true}
        />
      </div>
    </div>
  );
}
