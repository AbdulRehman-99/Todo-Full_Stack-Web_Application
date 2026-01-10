// Task ID: T029 - Create edit task page (Frontend/app/tasks/[id]/page.tsx)
// Task ID: T030 - Implement pre-filling form with existing task data
// Task ID: T031 - Connect form submission to task update in state management
// Task ID: T034 - Add navigation from home page to edit page via edit button
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/lib/types';
import { useTaskContext } from '@/lib/taskStore';
import { getTaskById } from '@/lib/api';
import TaskForm from '@/components/TaskForm';

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { state, loadTasks, updateTask } = useTaskContext();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Find task in local state first, but fetch from API if not found
  const currentTask = state.tasks.find(task => task.id === params.id);

  // If task not found in state, fetch it directly from the API
  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(currentTask || null);
  const [isLoadingTask, setIsLoadingTask] = React.useState(!currentTask);

  React.useEffect(() => {
    const fetchTask = async () => {
      if (!currentTask) {
        try {
          setIsLoadingTask(true);
          // Fetch the specific task from the API using the params.id
          const foundTask = await getTaskById(params.id);

          if (foundTask) {
            setTaskToEdit(foundTask);
          } else {
            // Task doesn't exist
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
      router.push('/'); // Redirect to home page after successful update
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (state.loading || isLoadingTask) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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

  if (!taskToEdit) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Task Not Found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>The task you're looking for doesn't exist or may have been deleted.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Edit Task</h1>
        <p className="mt-2 text-gray-600">
          Update the details for "{taskToEdit.title}". Make changes and save when ready.
        </p>
      </div>

      {state.error && (
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
      )}

      <div className="card">
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