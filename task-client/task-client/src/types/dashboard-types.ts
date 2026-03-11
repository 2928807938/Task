/**
 * Dashboard相关类型定义
 * 统一管理仪表盘组件使用的所有类型
 */

// 导入基础API类型
import { ApiResponse } from './api-types';

/**
 * 任务基础类型 - 统一TodoTask定义
 * 这个类型用于仪表盘和任务列表组件
 */
export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  statusId: string;
  statusName: string;
  statusColor: string;
  priorityId: string;
  priorityName: string;
  priorityColor: string;
  priorityScore?: string;
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
  assigneeId: string;
  assigneeName: string;
  creatorId?: string;
  creatorName?: string;
  progress?: string;
  parentTaskId?: string;
  startTime?: string;
}

/**
 * 协作活动类型
 */
export interface CollaborationActivity {
  id: string;
  type: string;
  userId: string;
  username: string;
  projectId: string;
  projectName: string;
  content: string;
  timestamp: string;
  taskId?: string;
  taskTitle?: string;
  userName: string;
}

/**
 * Dashboard数据响应类型
 */
export interface DashboardDataResponse {
  tasks: {
    items?: TodoTask[];
  } | TodoTask[];
  activities: CollaborationActivity[];
}

/**
 * Dashboard API响应类型
 */
export type DashboardApiResponse = ApiResponse<DashboardDataResponse>;

/**
 * 任务分类结果类型
 */
export interface TaskClassificationResult {
  upcomingTasks: TodoTask[];
  myTasks: TodoTask[];
}

/**
 * Dashboard完整数据类型
 */
export interface DashboardData {
  tasks: TodoTask[];
  activities: CollaborationActivity[];
  upcomingTasks: TodoTask[];
  myTasks: TodoTask[];
}

/**
 * Dashboard统计信息类型
 */
export interface DashboardStats {
  hasData: boolean;
  totalTasks: number;
  upcomingTasksCount: number;
  myTasksCount: number;
  activitiesCount: number;
}

/**
 * Dashboard Hook选项类型
 */
export interface DashboardOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  staleTime?: number;
}

/**
 * Dashboard Hook返回类型
 */
export interface DashboardHookResult extends DashboardData, DashboardStats {
  isLoading: boolean;
  isRefreshing: boolean;
  error: any;
  refreshData: () => Promise<void>;
  classifyTasks: (tasks: TodoTask[]) => TaskClassificationResult;
  processApiData: (data: any) => DashboardData;
}

/**
 * 任务点击处理器类型
 */
export type TaskClickHandler = (taskId: string) => void;

/**
 * 活动点击处理器类型
 */
export type ActivityClickHandler = (activity: CollaborationActivity) => void;

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED'
}

/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

/**
 * 活动类型枚举
 */
export enum ActivityType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMMENTED = 'TASK_COMMENTED',
  USER_JOINED_PROJECT = 'USER_JOINED_PROJECT',
  USER_LEFT_PROJECT = 'USER_LEFT_PROJECT'
}

/**
 * 时间格式化选项类型
 */
export interface TimeFormatOptions {
  showRelative?: boolean;
  format?: 'short' | 'medium' | 'long';
  includeTime?: boolean;
}

/**
 * 任务筛选选项类型
 */
export interface TaskFilterOptions {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchKeyword?: string;
}

/**
 * 排序选项类型
 */
export interface SortOptions {
  field: 'dueDate' | 'createdAt' | 'updatedAt' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}

/**
 * 导出任务格式类型
 */
export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

/**
 * 批量操作类型
 */
export interface BatchOperation {
  type: 'status_change' | 'priority_change' | 'assignee_change' | 'delete';
  taskIds: string[];
  payload?: any;
}

/**
 * 任务模板类型
 */
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  defaultStatus: string;
  defaultPriority: string;
  estimatedHours?: number;
  subTaskTemplates?: {
    name: string;
    description: string;
    estimatedHours?: number;
  }[];
}

/**
 * 仪表盘配置类型
 */
export interface DashboardConfig {
  showUpcomingTasks: boolean;
  showMyTasks: boolean;
  showCollaborationTimeline: boolean;
  showRecentCommunications: boolean;
  showCalendar: boolean;
  upcomingTasksDays: number; // 临期任务的天数阈值
  maxItemsPerPanel: number;
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number;
}

/**
 * 面板大小类型
 */
export type PanelSize = 'small' | 'medium' | 'large';

/**
 * 面板布局类型
 */
export interface PanelLayout {
  id: string;
  size: PanelSize;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visible: boolean;
}

/**
 * Dashboard布局配置类型
 */
export interface DashboardLayout {
  panels: Record<string, PanelLayout>;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

// 导出所有类型，确保其他文件可以轻松导入
export type {
  ApiResponse,
  DashboardDataResponse as RawDashboardResponse
};

// 重新导出常用类型，保持向后兼容
export type Task = TodoTask;
export type Activity = CollaborationActivity;