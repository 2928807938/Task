/**
 * iOS端任务相关类型定义
 * 对应后端TaskIOSVO等数据结构
 */

/**
 * iOS端任务视图对象
 * 对应后端的TaskIOSVO
 */
export interface TaskIOSVO {
  id: number;
  title: string;
  detail: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  priority: number; // 1-低，2-中，3-高
  createdAt: string;
  updatedAt: string;
}

/**
 * iOS端任务统计数据
 * 对应后端的TaskIOSStatisticsVO
 */
export interface TaskIOSStatisticsVO {
  basicStats: TaskIOSFilterStatsVO;
  completionRate: number; // 0.0-1.0
  priorityDistribution: Record<string, number>; // key为优先级数值的字符串
  weeklyProgress: Record<string, number>; // key为日期字符串(MM-dd格式)
  averageCompletionTime: number | null; // 平均完成时间（小时）
}

/**
 * iOS端过滤统计数据
 * 对应后端的TaskIOSFilterStatsVO
 */
export interface TaskIOSFilterStatsVO {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  todayTasks: number;
  overdueTasks: number;
  priorityTasks: number;
  recentTasks: number;
}

/**
 * 获取用户任务列表请求参数
 */
export interface GetUserTasksParams {
  userId?: number;
  projectIds?: number[];
  statusFilter?: 'all' | 'pending' | 'completed';
  priority?: number;
  includeCompleted?: boolean;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

/**
 * 任务过滤请求参数
 */
export interface TaskFilterRequest {
  primaryFilter: 'all' | 'pending' | 'completed' | 'today' | 'overdue' | 'priority' | 'recent';
  searchText?: string;
  sortBy?: 'default' | 'dateCreated' | 'dueDate' | 'priority' | 'alphabetical';
  showCompletedOnly?: boolean;
  page?: number;
  size?: number;
}

/**
 * 分页数据响应
 */
export interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
}

/**
 * 任务优先级枚举
 */
export enum TaskPriorityLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}

/**
 * 任务过滤器枚举
 */
export enum TaskFilterType {
  ALL = 'all',
  PENDING = 'pending', 
  COMPLETED = 'completed',
  TODAY = 'today',
  OVERDUE = 'overdue',
  PRIORITY = 'priority',
  RECENT = 'recent'
}

/**
 * 任务排序选项枚举
 */
export enum TaskSortOption {
  DEFAULT = 'default',
  DATE_CREATED = 'dateCreated', 
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority',
  ALPHABETICAL = 'alphabetical'
}

/**
 * TaskIOSVO转换为前端Task对象的映射函数
 */
export function mapTaskIOSVOToTask(taskIOS: TaskIOSVO): any {
  return {
    id: taskIOS.id.toString(),
    title: taskIOS.title,
    description: taskIOS.detail,
    isCompleted: taskIOS.isCompleted,
    dueDate: taskIOS.dueDate,
    priority: taskIOS.priority,
    createdAt: taskIOS.createdAt,
    updatedAt: taskIOS.updatedAt
  };
}

/**
 * 前端Task对象转换为TaskIOSVO的映射函数
 */
export function mapTaskToCreateRequest(task: any): {
  title: string;
  detail: string | null;
  dueDate: string | null;
  priority: number;
} {
  return {
    title: task.title,
    detail: task.description || null,
    dueDate: task.dueDate || null,
    priority: task.priority || TaskPriorityLevel.MEDIUM
  };
}

/**
 * 优先级数值转换为显示文本
 */
export function getPriorityDisplayText(priority: number): string {
  switch (priority) {
    case TaskPriorityLevel.LOW:
      return '低';
    case TaskPriorityLevel.MEDIUM:
      return '中';
    case TaskPriorityLevel.HIGH:
      return '高';
    default:
      return '中';
  }
}

/**
 * 过滤器类型转换为显示文本
 */
export function getFilterDisplayText(filter: TaskFilterType): string {
  switch (filter) {
    case TaskFilterType.ALL:
      return '全部';
    case TaskFilterType.PENDING:
      return '待完成';
    case TaskFilterType.COMPLETED:
      return '已完成';
    case TaskFilterType.TODAY:
      return '今天';
    case TaskFilterType.OVERDUE:
      return '过期';
    case TaskFilterType.PRIORITY:
      return '高优先级';
    case TaskFilterType.RECENT:
      return '最近';
    default:
      return '全部';
  }
}