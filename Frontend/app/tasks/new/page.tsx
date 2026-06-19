'use client';

import { useRouter } from 'next/navigation';
import { useTaskContext } from '@/lib/taskStore';
import { Task } from '@/lib/types';
import TaskForm from '@/components/TaskForm';
import { PlusCircle, CheckSquare } from 'lucide-react';

export default function NewTaskPage() {
  const router = useRouter();
  const { addTask, state } = useTaskContext();

  const handleSubmit = async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'> | Partial<Task>) => {
    if (!taskData.title) {
      return;
    }

    await addTask({
      title: taskData.title,
      description: taskData.description || ''
    });
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in-down">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow-sm">
            <PlusCircle size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Create New Task</h1>
            <p className="text-sm text-surface-500">Fill in the details for your new task</p>
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
        <TaskForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
