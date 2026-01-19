import { apiClient, default as api } from '../lib/api';

/**
 * Task Service for Frontend
 * Handles task-related API calls with authentication and user data isolation
 */

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Gets all tasks for the authenticated user
 */
export const getUserTasks = async (): Promise<Task[]> => {
  try {
    const response = await apiClient.tasks.getAll();

    // The backend should only return tasks belonging to the authenticated user
    // This ensures data isolation at the server level
    return response.data || [];
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    throw error;
  }
};

/**
 * Gets a specific task by ID
 */
export const getTaskById = async (taskId: string): Promise<Task> => {
  try {
    const response = await apiClient.tasks.getById(taskId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Creates a new task for the authenticated user
 */
export const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> => {
  try {
    const response = await apiClient.tasks.create(taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Updates an existing task
 */
export const updateTask = async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
  try {
    const response = await apiClient.tasks.update(taskId, taskData);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Deletes a task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await apiClient.tasks.delete(taskId);
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Marks a task as completed
 */
export const completeTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await apiClient.tasks.toggleComplete(taskId, true);
    return response.data;
  } catch (error) {
    console.error(`Error completing task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Marks a task as incomplete
 */
export const uncompleteTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await apiClient.tasks.toggleComplete(taskId, false);
    return response.data;
  } catch (error) {
    console.error(`Error uncompleting task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Toggles a task's completion status
 */
export const toggleTaskCompletion = async (taskId: string, completed: boolean): Promise<Task> => {
  return completed ? uncompleteTask(taskId) : completeTask(taskId);
};

/**
 * Filters tasks by completion status
 */
export const getTasksByCompletion = async (completed: boolean): Promise<Task[]> => {
  try {
    const response = await api.get(`/tasks?completed=${completed}`);
    return response.data.tasks || response.data;
  } catch (error) {
    console.error(`Error fetching ${completed ? 'completed' : 'incomplete'} tasks:`, error);
    throw error;
  }
};

/**
 * Search tasks by title or description
 */
export const searchTasks = async (query: string): Promise<Task[]> => {
  try {
    const response = await api.get(`/tasks/search?q=${encodeURIComponent(query)}`);
    return response.data.tasks || response.data;
  } catch (error) {
    console.error(`Error searching tasks for query "${query}":`, error);
    throw error;
  }
};

/**
 * Batch update tasks
 */
export const batchUpdateTasks = async (taskIds: string[], updates: Partial<Task>): Promise<Task[]> => {
  try {
    const response = await api.patch('/tasks/batch', {
      task_ids: taskIds,
      updates
    });
    return response.data;
  } catch (error) {
    console.error('Error batch updating tasks:', error);
    throw error;
  }
};