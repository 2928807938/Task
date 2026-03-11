import {TaskPriority, TaskStatus} from '@/core/domain/entities/task';

/**
 * 日历事件类型枚举
 */
export enum CalendarEventType {
  TASK = 'TASK',           // 任务
  MEETING = 'MEETING',     // 会议
  MILESTONE = 'MILESTONE', // 里程碑
  DEADLINE = 'DEADLINE',   // 截止日期
  OTHER = 'OTHER'          // 其他
}

/**
 * 日历事件接口
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: CalendarEventType;
  status?: TaskStatus;      // 如果是任务类型，可以有状态
  priority?: TaskPriority;  // 如果是任务类型，可以有优先级
  assignees?: Array<{      // 负责人
    id: string;
    name: string;
    avatar?: string;
  }>;
  relatedTaskId?: string;   // 关联的任务ID
  color?: string;           // 事件颜色
  isAllDay?: boolean;       // 是否全天事件
}

/**
 * 日历视图类型
 */
export enum CalendarViewType {
  MONTH = 'month',
  WEEK = 'week',
  DAY = 'day'
}
