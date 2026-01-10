// Task ID: T007 - Implement centralized in-memory task state management using React Context and useReducer for global task state
'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { Task, TaskList, TaskStatus } from './types';
import { getTasks, createTask, updateTask, deleteTask, toggleTaskCompletion } from './api';

// Define the state type
interface TaskState {
  tasks: TaskList;
  loading: boolean;
  error: string | null;
  filter: TaskStatus;
}

// Define action types
type TaskAction =
  | { type: 'SET_TASKS'; payload: TaskList }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: { id: string; completed: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTER'; payload: TaskStatus };

// Initial state
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  filter: 'all',
};

// Reducer function
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: [...action.payload.map(task => ({...task}))] }; // Deep copy tasks
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, { ...action.payload }] }; // Create new array with new task
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'TOGGLE_COMPLETE':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, completed: action.payload.completed, updatedAt: new Date() }
            : task
        ),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    default:
      return state;
  }
};

// Create context
interface TaskContextType {
  state: TaskState;
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  setFilter: (filter: TaskStatus) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const loadTasks = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const tasks = await getTasks();
      dispatch({ type: 'SET_TASKS', payload: tasks });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load tasks' });
      console.error(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newTask = await createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: newTask });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create task' });
      console.error(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateTaskFunc = useCallback(async (id: string, taskData: Partial<Task>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedTask = await updateTask(id, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
      console.error(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteTaskFunc = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await deleteTask(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete task' });
      console.error(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await toggleTaskCompletion(id);
      dispatch({ type: 'TOGGLE_COMPLETE', payload: result });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle task completion' });
      console.error(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const setFilter = useCallback((filter: TaskStatus) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  return (
    <TaskContext.Provider
      value={{
        state,
        loadTasks,
        addTask,
        updateTask: updateTaskFunc,
        deleteTask: deleteTaskFunc,
        toggleComplete,
        setFilter,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};