// API client for backend integration
// Task ID: T012 - Connect frontend to backend API at http://localhost:8000

import { Task, TaskList, TaskStatus } from './types';
import { getAccessToken } from '../src/utils/token-storage';

// Define the base URL for the backend API
const BACKEND_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to make API requests
const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  const url = `${BACKEND_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Some endpoints (DELETE) return no content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Helper function to convert date strings to Date objects
const convertDates = (task: any): Task => {
  return {
    ...task,
    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
    updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
  };
};

// API functions that connect to the backend
export const getTasks = async (): Promise<TaskList> => {
  const response = await makeRequest('/', { method: 'GET' });
  return response.map((task: any) => convertDates(task));
};

export const getTaskById = async (id: string): Promise<Task> => {
  const response = await makeRequest(`/${id}`, { method: 'GET' });
  return convertDates(response);
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'updatedAt'>): Promise<Task> => {
  const response = await makeRequest('/', {
    method: 'POST',
    body: JSON.stringify({
      title: task.title,
      description: task.description || '',
    }),
  });
  return convertDates(response);
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
  const response = await makeRequest(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      completed: task.completed,
    }),
  });
  return convertDates(response);
};

export const deleteTask = async (id: string): Promise<void> => {
  await makeRequest(`/${id}`, { method: 'DELETE' });
};

export const toggleTaskCompletion = async (id: string): Promise<{ id: string; completed: boolean }> => {
  // First get the current task to get its current state
  const currentTask = await makeRequest(`/${id}`, { method: 'GET' });

  // Then update it with the toggled completion state
  const response = await makeRequest(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: currentTask.title,
      description: currentTask.description,
      completed: !currentTask.completed,
    }),
  });

  return { id, completed: response.completed };
};