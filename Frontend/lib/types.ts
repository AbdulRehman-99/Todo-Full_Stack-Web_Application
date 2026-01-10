export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export type TaskList = Task[];

export type TaskStatus = 'active' | 'completed' | 'all';