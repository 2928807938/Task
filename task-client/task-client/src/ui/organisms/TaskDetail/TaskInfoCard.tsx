import React from 'react';
import {motion} from 'framer-motion';
import {Avatar} from '@/ui/atoms/Avatar';
import {FiCalendar, FiClock, FiPlay} from 'react-icons/fi';

interface TaskInfoCardProps {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  delay?: number;
}

/**
 * 任务信息卡片组件
 */
export const TaskInfoCard: React.FC<TaskInfoCardProps> = ({
  label,
  children,
  icon,
  delay = 0
}) => {
  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <div className="flex items-center">
        {icon && <span className="mr-1 text-gray-400 dark:text-gray-500">{icon}</span>}
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</h3>
      </div>
      <div>{children}</div>
    </motion.div>
  );
};

/**
 * 任务类型标签组件
 */
export const TaskTypeBadge: React.FC<{ isMainTask: boolean }> = ({ isMainTask }) => {
  if (isMainTask) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50">
        <span className="mr-1 flex-shrink-0" style={{ color: '#10b981' }}>●</span>
        主任务
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50">
      <span className="mr-1 flex-shrink-0" style={{ color: '#f59e0b' }}>●</span>
      子任务
    </span>
  );
};

/**
 * 任务优先级标签组件
 */
export const PriorityBadge: React.FC<{ priority?: string; color?: string }> = ({ priority, color }) => {
  const getPriorityStyles = () => {
    if (color) {
      return {
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`
      };
    }

    let textColor = 'text-gray-700';
    let bgColor = 'bg-gray-50';
    let borderColor = 'border-gray-100';
    let icon = '○';

    switch (priority?.toUpperCase()) {
      case 'HIGH':
        textColor = 'text-red-600';
        bgColor = 'bg-red-50';
        borderColor = 'border-red-100';
        icon = '●';
        break;
      case 'MEDIUM':
        textColor = 'text-orange-600';
        bgColor = 'bg-orange-50';
        borderColor = 'border-orange-100';
        icon = '●';
        break;
      case 'LOW':
        textColor = 'text-green-600';
        bgColor = 'bg-green-50';
        borderColor = 'border-green-100';
        icon = '●';
        break;
      // 添加暗色模式支持
      case 'HIGH_DARK':
        textColor = 'text-red-400';
        bgColor = 'bg-red-900/20';
        borderColor = 'border-red-800/50';
        icon = '●';
        break;
      case 'MEDIUM_DARK':
        textColor = 'text-orange-400';
        bgColor = 'bg-orange-900/20';
        borderColor = 'border-orange-800/50';
        icon = '●';
        break;
      case 'LOW_DARK':
        textColor = 'text-green-400';
        bgColor = 'bg-green-900/20';
        borderColor = 'border-green-800/50';
        icon = '●';
        break;
    }

    const darkModeClass = priority?.includes('_DARK') ? ' dark' : '';

    return {
      className: `${textColor}${darkModeClass} ${bgColor}${darkModeClass} ${borderColor}${darkModeClass}`,
      icon
    };
  };

  const styles = getPriorityStyles();

  if (color) {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm"
        style={{
          backgroundColor: `${color}20`,
          color: color,
          borderColor: `${color}40`
        }}
      >
        <span className="mr-1" style={{ color }}>●</span>
        {priority || '未设置'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles.className} border`}>
      <span className="mr-1">{styles.icon}</span>
      {priority || '未设置'}优先级
    </span>
  );
};

/**
 * 任务状态标签组件
 */
export const StatusBadge: React.FC<{ status?: string; statusColor?: string }> = ({ status, statusColor }) => {
  const getStatusStyles = () => {
    let textColor = 'text-gray-700 dark:text-gray-300';
    let bgColor = 'bg-gray-50 dark:bg-gray-800/30';
    let borderColor = 'border-gray-100 dark:border-gray-700';
    let icon = '○';

    switch (status?.toUpperCase()) {
      case 'TO_DO':
      case 'TODO':
        textColor = 'text-blue-600 dark:text-blue-400';
        bgColor = 'bg-blue-50 dark:bg-blue-900/20';
        borderColor = 'border-blue-100 dark:border-blue-800/50';
        icon = '○';
        break;
      case 'IN_PROGRESS':
      case 'INPROGRESS':
        textColor = 'text-yellow-600 dark:text-yellow-400';
        bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
        borderColor = 'border-yellow-100 dark:border-yellow-800/50';
        icon = '◔';
        break;
      case 'UNDER_REVIEW':
      case 'REVIEW':
        textColor = 'text-purple-600 dark:text-purple-400';
        bgColor = 'bg-purple-50 dark:bg-purple-900/20';
        borderColor = 'border-purple-100 dark:border-purple-800/50';
        icon = '◑';
        break;
      case 'COMPLETED':
      case 'DONE':
        textColor = 'text-green-600 dark:text-green-400';
        bgColor = 'bg-green-50 dark:bg-green-900/20';
        borderColor = 'border-green-100 dark:border-green-800/50';
        icon = '●';
        break;
      case 'BLOCKED':
        textColor = 'text-red-600 dark:text-red-400';
        bgColor = 'bg-red-50 dark:bg-red-900/20';
        borderColor = 'border-red-100 dark:border-red-800/50';
        icon = '■';
        break;
    }

    return { textColor, bgColor, borderColor, icon };
  };

  const { textColor, bgColor, borderColor, icon } = getStatusStyles();

  // 如果提供了statusColor，使用指定的颜色
  if (statusColor) {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
        style={{
          color: statusColor,
          backgroundColor: `${statusColor}15`,
          borderColor: `${statusColor}30`
        }}
      >
        <span className="mr-1" style={{ color: statusColor }}>{icon}</span>
        {status || '未设置'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${textColor} ${bgColor} ${borderColor} border`}>
      <span className="mr-1">{icon}</span>
      {status || '未设置'}
    </span>
  );
};

// 使用统一的原子级 ProgressBar 组件，不再需要内联实现

/**
 * 格式化日期
 */
export const formatDate = (dateString: string, options: { format?: 'short' | 'medium' | 'long'; showYear?: boolean; showTime?: boolean } = {}) => {
  if (!dateString) return '无日期';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '无效日期';

    const { format = 'medium', showYear = true, showTime = false } = options;

    // 日期格式化选项
    const dateFormatOptions: Intl.DateTimeFormatOptions = {
      year: showYear ? 'numeric' : undefined,
      month: format === 'short' ? '2-digit' : format === 'medium' ? 'short' : 'long',
      day: '2-digit',
      hour: showTime ? '2-digit' : undefined,
      minute: showTime ? '2-digit' : undefined,
      hour12: false
    };

    return new Intl.DateTimeFormat('zh-CN', dateFormatOptions).format(date);
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '格式化错误';
  }
};

/**
 * 任务日期信息组件
 */
export const TaskDateInfo: React.FC<{
  createdAt?: string;
  startTime?: string;
  dueDate?: string;
  isOverdue?: boolean;
}> = ({ createdAt, startTime, dueDate, isOverdue }) => {
  return (
    <div className="grid grid-cols-1 gap-3 bg-gray-50 dark:bg-gray-800/30 p-2 rounded-lg">
      {/* 创建日期 */}
      <div className="mb-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">创建日期</p>
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <FiClock className="mr-1" size={12} />
          <span>{formatDate(createdAt || '', { format: 'long', showYear: true, showTime: true })}</span>
        </div>
      </div>

      {/* 开始日期 */}
      <div className="mb-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">开始日期</p>
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <FiPlay className="mr-1" size={12} />
          {startTime ? (
            <span>{formatDate(startTime, { format: 'long', showYear: true, showTime: true })}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">-</span>
          )}
        </div>
      </div>

      {/* 截止日期 */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">截止日期</p>
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <FiCalendar className="mr-1" size={12} />
          {dueDate ? (
            <span className="flex items-center">
              <span>{formatDate(dueDate, { format: 'long', showYear: true, showTime: true })}</span>
              {isOverdue && (
                <span className="text-red-500 text-xs ml-1 px-1 py-0 bg-red-50 dark:bg-red-900/20 rounded-full">
                  已逾期
                </span>
              )}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">-</span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 任务负责人组件
 */
export const TaskAssignee: React.FC<{
  assignee?: string;
  avatarUrl?: string;
}> = ({ assignee, avatarUrl }) => {
  if (!assignee) {
    return (
      <p className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 p-2 rounded-md inline-block">
        未分配
      </p>
    );
  }

  return (
    <div className="flex items-center bg-gray-50 dark:bg-gray-800/30 p-2 rounded-md inline-block">
      <Avatar name={assignee} src={avatarUrl} size="sm" className="mr-2" />
      <span className="text-gray-700 dark:text-gray-300">{assignee}</span>
    </div>
  );
};
