import React, {ReactElement} from 'react';
import {differenceInDays, isValid, parseISO} from 'date-fns';

// 任务状态类型，与@/core/domain/entities/task中的定义保持一致
type TaskStatusType = 'COMPLETED' | 'IN_PROGRESS' | 'WAITING' | 'OVERDUE' | string;

// 任务优先级类型，与@/core/domain/entities/task中的定义保持一致
type TaskPriorityType = 'HIGH' | 'MEDIUM' | 'LOW' | string;

/**
 * 任务状态样式接口
 */
export interface TaskStatusStyle {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  darkTextColor: string;
  darkBgColor: string;
  darkBorderColor: string;
  icon?: ReactElement;
}

/**
 * 任务优先级样式接口
 */
export interface TaskPriorityStyle {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  darkTextColor: string;
  darkBgColor: string;
  darkBorderColor: string;
  icon?: ReactElement;
}

/**
 * 根据任务优先级返回对应的样式 (旧版本 - 已过时)
 * @param priority 优先级（高、中、低）
 * @returns 包含文本颜色、背景色、边框色和图标的样式对象
 * @deprecated 请使用 getTaskPriorityStyle 替代
 */
export const getPriorityStyle = (priority: string): {
    textColor: string;
    bgColor: string;
    borderColor: string;
    icon: ReactElement
} => {
    switch (priority.toLowerCase()) {
        case "高":
            return {
                textColor: "text-red-600",
                bgColor: "bg-red-50",
                borderColor: "border-red-100",
                icon: React.createElement("span", { className: "text-red-500 mr-1" }, "●")
            };
        case "中":
            return {
                textColor: "text-orange-600",
                bgColor: "bg-orange-50",
                borderColor: "border-orange-100",
                icon: React.createElement("span", { className: "text-orange-500 mr-1" }, "●")
            };
        case "低":
            return {
                textColor: "text-blue-600",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-100",
                icon: React.createElement("span", { className: "text-blue-500 mr-1" }, "●")
            };
        default:
            return {
                textColor: "text-gray-600",
                bgColor: "bg-gray-50",
                borderColor: "border-gray-100",
                icon: React.createElement("span", { className: "text-gray-500 mr-1" }, "●")
            };
    }
};

/**
 * 根据任务优先级返回样式
 * @param priority 任务优先级
 * @returns 任务优先级样式对象
 */
export const getTaskPriorityStyle = (priority: TaskPriorityType): TaskPriorityStyle => {
  // 将优先级转换为小写以便于比较
  const priorityLower = priority?.toLowerCase() || '';

  // 苹果设计风格的颜色系统
  switch (priorityLower) {
    case 'high':
      return {
        label: '高',
        textColor: '#FF3B30',  // 苹果红色
        bgColor: '#FF3B3015',
        borderColor: '#FF3B3030',
        darkTextColor: '#FF453A',  // 暗黑模式下的苹果红色
        darkBgColor: '#FF3B3015',
        darkBorderColor: '#FF3B3040',
        icon: React.createElement('span', { className: 'mr-1 text-[#FF3B30]' }, '●')
      };
    case 'medium':
      return {
        label: '中',
        textColor: '#FF9500',  // 苹果橙色
        bgColor: '#FF950015',
        borderColor: '#FF950030',
        darkTextColor: '#FF9F0A',  // 暗黑模式下的苹果橙色
        darkBgColor: '#FF950015',
        darkBorderColor: '#FF950040',
        icon: React.createElement('span', { className: 'mr-1 text-[#FF9500]' }, '●')
      };
    case 'low':
      return {
        label: '低',
        textColor: '#007AFF',  // 苹果蓝色
        bgColor: '#007AFF15',
        borderColor: '#007AFF30',
        darkTextColor: '#0A84FF',  // 暗黑模式下的苹果蓝色
        darkBgColor: '#007AFF15',
        darkBorderColor: '#007AFF40',
        icon: React.createElement('span', { className: 'mr-1 text-[#007AFF]' }, '●')
      };
    default:
      return {
        label: '未定',
        textColor: '#8E8E93',  // 苹果灰色
        bgColor: '#8E8E9310',
        borderColor: '#8E8E9320',
        darkTextColor: '#98989D',  // 暗黑模式下的苹果灰色
        darkBgColor: '#8E8E9310',
        darkBorderColor: '#8E8E9330',
        icon: React.createElement('span', { className: 'mr-1 text-[#8E8E93]' }, '●')
      };
  }
};

/**
 * 根据任务状态返回对应的样式（文本、背景、边框、图标）
 * 支持常见状态：未开始、进行中、已暂停、已完成、已取消
 */
export const getStatusStyle = (status?: string): {
    textColor: string;
    bgColor: string;
    borderColor: string;
    icon: ReactElement;
} => {
    const s = (status || '').toLowerCase();
    switch (s) {
        case '未开始':
        case '筹划中':
        case 'not_started':
            return {
                textColor: 'text-purple-700',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-200',
                icon: React.createElement('span', { className: 'mr-1 text-[#9C27B0]' }, '●'),
            };
        case '进行中':
        case 'in_progress':
            return {
                textColor: 'text-green-700',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                icon: React.createElement('span', { className: 'mr-1 text-[#00C853]' }, '●'),
            };
        case '已暂停':
        case 'paused':
            return {
                textColor: 'text-yellow-700',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                icon: React.createElement('span', { className: 'mr-1 text-[#FFD600]' }, '●'),
            };
        case '已完成':
        case 'completed':
            return {
                textColor: 'text-blue-700',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                icon: React.createElement('span', { className: 'mr-1 text-[#03A9F4]' }, '●'),
            };
        case '已取消':
        case 'cancelled':
            return {
                textColor: 'text-orange-700',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                icon: React.createElement('span', { className: 'mr-1 text-[#FF3D00]' }, '●'),
            };
        default:
            return {
                textColor: 'text-gray-700',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-100',
                icon: React.createElement('span', { className: 'mr-1 text-gray-400' }, '●'),
            };
    }
};

/**
 * 根据并行组标识符返回对应的样式
 * @param group 并行组标识符
 * @returns 包含文本颜色、背景色和边框色的样式对象
 */
export const getParallelGroupStyle = (group: string): {
    textColor: string;
    bgColor: string;
    borderColor: string
} => {
    const styles = [
        { textColor: "text-indigo-700", bgColor: "bg-indigo-50/70", borderColor: "border-indigo-100" },
        { textColor: "text-purple-700", bgColor: "bg-purple-50/70", borderColor: "border-purple-100" },
        { textColor: "text-pink-700", bgColor: "bg-pink-50/70", borderColor: "border-pink-100" },
        { textColor: "text-green-700", bgColor: "bg-green-50/70", borderColor: "border-green-100" },
        { textColor: "text-yellow-700", bgColor: "bg-yellow-50/70", borderColor: "border-yellow-100" },
    ];

    // 根据组名的ASCII码值选择样式
    const index = group.charCodeAt(0) % styles.length;
    return styles[index];
};

/**
 * 日期状态类型
 */
export type TaskDueDateStatus = 'overdue' | 'urgent' | 'soon' | 'normal';

/**
 * 日期状态样式接口
 */
export interface DueDateStatusStyle {
  status: TaskDueDateStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon?: ReactElement;
}

/**
 * 根据任务截止日期返回对应的样式和状态信息
 * @param dueDate 截止日期字符串(ISO格式)
 * @param thresholds 自定义阈值设置(紧急和即将到期的天数)
 * @returns 包含状态和计算结果的对象
 */
/**
 * 根据任务状态返回样式
 * @param status 任务状态
 * @returns 任务状态样式对象
 */
export const getTaskStatusStyle = (status: TaskStatusType): TaskStatusStyle => {
  // 将状态转换为小写以便于比较
  const statusLower = status?.toLowerCase() || '';

  // 苹果设计风格的颜色系统
  switch (statusLower) {
    case 'completed':
      return {
        label: '已完成',
        textColor: '#34C759',  // 苹果绿色
        bgColor: '#34C75915',
        borderColor: '#34C75930',
        darkTextColor: '#30D158',  // 暗黑模式下的苹果绿色
        darkBgColor: '#34C75915',
        darkBorderColor: '#34C75940',
        icon: React.createElement('span', { className: 'mr-1 text-[#34C759]' }, '●')
      };
    case 'in_progress':
      return {
        label: '进行中',
        textColor: '#007AFF',  // 苹果蓝色
        bgColor: '#007AFF15',
        borderColor: '#007AFF30',
        darkTextColor: '#0A84FF',  // 暗黑模式下的苹果蓝色
        darkBgColor: '#007AFF15',
        darkBorderColor: '#007AFF40',
        icon: React.createElement('span', { className: 'mr-1 text-[#007AFF]' }, '●')
      };
    case 'waiting':
      return {
        label: '等待中',
        textColor: '#FF9500',  // 苹果橙色
        bgColor: '#FF950015',
        borderColor: '#FF950030',
        darkTextColor: '#FF9F0A',  // 暗黑模式下的苹果橙色
        darkBgColor: '#FF950015',
        darkBorderColor: '#FF950040',
        icon: React.createElement('span', { className: 'mr-1 text-[#FF9500]' }, '●')
      };
    case 'overdue':
      return {
        label: '已逾期',
        textColor: '#FF9500',  // 使用橙色而非红色，视觉更温和
        bgColor: '#FF950015',
        borderColor: '#FF950030',
        darkTextColor: '#FF9F0A',  // 暗黑模式下的苹果橙色
        darkBgColor: '#FF950015',
        darkBorderColor: '#FF950040',
        icon: React.createElement('span', { className: 'mr-1 text-[#FF9500]' }, '●')
      };
    default:
      return {
        label: '未知',
        textColor: '#8E8E93',  // 苹果灰色
        bgColor: '#8E8E9310',
        borderColor: '#8E8E9320',
        darkTextColor: '#98989D',  // 暗黑模式下的苹果灰色
        darkBgColor: '#8E8E9310',
        darkBorderColor: '#8E8E9330',
        icon: React.createElement('span', { className: 'mr-1 text-[#8E8E93]' }, '●')
      };
  }
};

export const getDueDateStatusStyle = (
  dueDate: string,
  thresholds: { urgent?: number; soon?: number } = { urgent: 2, soon: 5 }
): { statusStyle: DueDateStatusStyle; daysText: string } => {
  // 检查日期是否有效
  if (!dueDate || !isValid(parseISO(dueDate))) {
    return {
      statusStyle: {
        status: 'normal',
        label: '正常',
        color: '#8E8E93',  // 苹果灰色
        bgColor: '#8E8E9310',
        borderColor: '#8E8E9320'
      },
      daysText: '未设置'
    };
  }

  const dueDateObj = parseISO(dueDate);
  const today = new Date();
  const diffDays = differenceInDays(dueDateObj, today);

  // 计算显示的天数文本
  let daysText = '';
  if (diffDays < 0) {
    daysText = `逾期${Math.abs(diffDays)}天`;
  } else if (diffDays === 0) {
    daysText = '今天';
  } else if (diffDays === 1) {
    daysText = '明天';
  } else if (diffDays < 7) {
    daysText = `${diffDays}天后`;
  } else {
    // 使用日期格式化显示MM/DD
    const month = dueDateObj.getMonth() + 1;
    const day = dueDateObj.getDate();
    daysText = `${month}/${day}`;
  }

  let statusStyle: DueDateStatusStyle;

  if (diffDays < 0) {
    // 过期任务 - 根据主题使用不同颜色
    statusStyle = {
      status: 'overdue',
      label: '已过期',
      color: document.documentElement.classList.contains('dark-theme') ? '#FF453A' : '#FF3B30',  // 苹果红色（深色/浅色模式）
      bgColor: document.documentElement.classList.contains('dark-theme') ? '#FF453A15' : '#FF3B3015',
      borderColor: document.documentElement.classList.contains('dark-theme') ? '#FF453A30' : '#FF3B3030'
    };
  } else if (diffDays < (thresholds?.urgent || 2)) {
    // 临期任务（紧急）- 使用更温和的橙色
    statusStyle = {
      status: 'urgent',
      label: '临期',
      color: document.documentElement.classList.contains('dark-theme') ? '#FF9F0A' : '#FF9500',  // 苹果橙色
      bgColor: document.documentElement.classList.contains('dark-theme') ? '#FF9F0A15' : '#FF950015',
      borderColor: document.documentElement.classList.contains('dark-theme') ? '#FF9F0A30' : '#FF950030'
    };
  } else if (diffDays < (thresholds?.soon || 5)) {
    // 即将到期（提醒）- 使用苹果橙色
    statusStyle = {
      status: 'soon',
      label: '即将到期',
      color: '#FF9500',  // 苹果橙色
      bgColor: '#FF950015',
      borderColor: '#FF950030'
    };
  } else {
    // 正常 - 使用苹果灰色
    statusStyle = {
      status: 'normal',
      label: '正常',
      color: '#8E8E93',  // 苹果灰色
      bgColor: '#8E8E9310',
      borderColor: '#8E8E9320'
    };
  }

  return { statusStyle, daysText };
};
