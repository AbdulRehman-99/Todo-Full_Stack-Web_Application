'use client';

import { Task, TaskStatus } from '@/lib/types';
import TaskItem from './TaskItem';
import { ClipboardList, CheckCircle2, ListTodo } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  filter: TaskStatus;
  onFilterChange: (filter: TaskStatus) => void;
}

export default function TaskList({ tasks, onToggleComplete, onDelete, filter, onFilterChange }: TaskListProps) {
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-surface-900">Your Tasks</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
          </p>
        </div>

        <div className="flex gap-1.5 bg-surface-100 p-1 rounded-xl" role="group">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              filter === 'all'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('active')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              filter === 'active'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => onFilterChange('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              filter === 'completed'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card py-16 text-center animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-surface-100 mb-4">
            {filter === 'completed' ? (
              <CheckCircle2 size={32} className="text-surface-400" />
            ) : filter === 'active' ? (
              <ListTodo size={32} className="text-surface-400" />
            ) : (
              <ClipboardList size={32} className="text-surface-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-surface-900 mb-1">
            {filter === 'completed'
              ? 'No completed tasks'
              : filter === 'active'
                ? 'All caught up!'
                : 'No tasks yet'}
          </h3>
          <p className="text-surface-500 text-sm max-w-sm mx-auto">
            {filter === 'completed'
              ? 'Complete a task to see it here.'
              : filter === 'active'
                ? 'You have no active tasks. Great job!'
                : 'Get started by creating your first task.'}
          </p>
          {filter === 'all' && (
            <div className="mt-6">
              <a href="/tasks/new" className="btn-primary">
                Create your first task
              </a>
            </div>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
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
