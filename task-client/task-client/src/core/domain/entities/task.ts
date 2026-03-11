export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  CUSTOM = 'custom'
}

export enum TaskStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  WAITING = 'waiting'
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User;
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  progress?: number;
}
