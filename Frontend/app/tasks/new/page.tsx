// Task ID: T022 - Create new task page (Frontend/app/tasks/new/page.tsx)
// Task ID: T025 - Connect form submission to task creation in state management
// Task ID: T026 - Add navigation from Header to new task page
// Task ID: T027 - Add navigation from home page to new task page
'use client';

import { useRouter } from 'next/navigation';
import { useTaskContext } from '@/lib/taskStore';
import { Task } from '@/lib/types';
import TaskForm from '@/components/TaskForm';

export default function NewTaskPage() {
  const router = useRouter();
  const { addTask, state } = useTaskContext();

  const handleSubmit = async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    await addTask(taskData);
    router.push('/'); // Redirect to home page after successful creation
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Create New Task</h1>
        <p className="mt-2 text-gray-600">
          Fill in the details for your new task. All fields are straightforward to use.
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
        <TaskForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}