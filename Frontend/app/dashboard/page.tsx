'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/src/utils/token-storage';
import { logout } from '@/src/services/auth.service';
import { getUserTasks, createTask, deleteTask, toggleTaskCompletion } from '@/src/services/task.service';
import { LogOut, CirclePlus, Check, Trash2, ListTodo, CheckSquare } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const DashboardPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchTasks();
  }, [router]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const userTasks = await getUserTasks();
      setTasks(userTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if ((error as any).response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        completed: false,
      });

      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (error) {
      console.error('Error creating task:', error);
      if ((error as any).response?.status === 401) {
        router.push('/login');
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = await toggleTaskCompletion(task.id, task.completed);
      setTasks(tasks.map(t => t.id === task.id ? { ...updatedTask } : t));
    } catch (error) {
      console.error('Error updating task:', error);
      if ((error as any).response?.status === 401) {
        router.push('/login');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      if ((error as any).response?.status === 401) {
        router.push('/login');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="mt-4 text-surface-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow-sm">
                <CheckSquare size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-900">My Tasks</h1>
                <p className="text-sm text-surface-500">{tasks.length} tasks</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost text-surface-500 hover:text-danger-600 hover:bg-danger-50"
            >
              <LogOut size={16} className="mr-1.5" />
              Logout
            </button>
          </div>

          {/* Create Task Form */}
          <form onSubmit={handleCreateTask} className="mt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                className="input-field flex-1"
                placeholder="What needs to be done?"
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                <CirclePlus size={16} className="mr-1.5" />
                Add Task
              </button>
            </div>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              rows={2}
              className="input-field mt-3 resize-none"
              placeholder="Add a description (optional)"
            />
          </form>

          {/* Tasks List */}
          <div className="mt-6 space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
                  <ListTodo size={24} className="text-surface-400" />
                </div>
                <p className="text-surface-500">No tasks yet. Add your first task!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-50 border border-surface-200 hover:border-surface-300 transition-all duration-200 animate-fade-in-up"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-200 ${
                        task.completed
                          ? 'bg-success-500 border-success-500'
                          : 'border-surface-300 hover:border-primary-400'
                      }`}
                    >
                      {task.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-surface-400' : 'text-surface-900'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className={`text-sm mt-0.5 ${task.completed ? 'line-through text-surface-400' : 'text-surface-500'}`}>
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs text-surface-400 mt-1">
                        Created: {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-50 transition-all duration-200 ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
