export type ExportFormat = 'pdf' | 'excel' | 'csv';

export type ReportTemplate = 'simple' | 'detailed' | 'executive' | 'analytics';

export interface ReportTemplateConfig {
  id: ReportTemplate;
  name: string;
  description: string;
  icon: React.ReactNode;
  includeTasks: boolean;
  includeTeamMembers: boolean;
  includeProgress: boolean;
  includeCharts: boolean;
  sections?: string[];
}

export interface CustomFieldOptions {
  // 项目字段
  projectFields: {
    name: boolean;
    description: boolean;
    progress: boolean;
    taskCount: boolean;
    completedTaskCount: boolean;
    memberCount: boolean;
    createdAt: boolean;
    updatedAt: boolean;
  };
  // 任务字段
  taskFields: {
    title: boolean;
    description: boolean;
    status: boolean;
    priority: boolean;
    assignee: boolean;
    createdAt: boolean;
    dueDate: boolean;
    completedAt: boolean;
  };
  // 团队成员字段
  memberFields: {
    name: boolean;
    role: boolean;
    email: boolean;
  };
  // 统计字段
  statisticsFields: {
    totalTasks: boolean;
    completedTasks: boolean;
    inProgressTasks: boolean;
    pendingTasks: boolean;
    overdueTasks: boolean;
    completionRate: boolean;
    averageCompletionTime: boolean;
  };
}

export interface ExportOptions {
  format: ExportFormat;
  template?: ReportTemplate;
  includeTeamMembers: boolean;
  includeTasks: boolean;
  includeProgress: boolean;
  includeCharts: boolean;
  customFields?: CustomFieldOptions;
  dateRange?: {
    start: Date;
    end: Date;
  };
  taskStatuses?: string[];
  taskPriorities?: string[];
}

export interface ExportData {
  project: {
    id: string;
    name: string;
    description?: string;
    progress: number;
    taskCount: number;
    completedTaskCount: number;
    memberCount: number;
    createdAt?: string;
    updatedAt?: string;
  };
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assignee?: string;
    createdAt?: string;
    dueDate?: string;
    completedAt?: string;
    statusColor?: string;
    priorityColor?: string;
  }>;
  members?: Array<{
    id: string;
    name: string;
    role?: string;
    email?: string;
    avatar?: string;
  }>;
  statistics?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    averageCompletionTime?: number;
  };
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
  blob?: Blob;
}