'use client';

import React, {useMemo} from 'react';
import {TaskStatus} from '@/core/domain/entities/task';
import {getTaskStatusStyle} from '@/utils/style-utils';

/**
 * TaskStatusBadge组件属性接口
 */
interface TaskStatusBadgeProps {
  /** 任务状态 */
  status: TaskStatus | string;
  /** 状态颜色 (API返回的颜色) */
  statusColor?: string;
  /** 标签尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 任务状态标签组件 -
 * 根据任务状态显示不同颜色的标签
 */
const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  statusColor,
  size = 'md',
  showIcon = false,
  className = '',
}) => {
  // 使用useMemo缓存状态样式结果
  const statusStyle = useMemo(() => {
    if (statusColor) {
      // 如果提供了API颜色，使用API颜色
      return {
        textColor: '#ffffff',
        bgColor: statusColor,
        borderColor: statusColor,
        label: typeof status === 'string' ? status : (status as string).toUpperCase(),
        icon: null
      };
    }
    // 否则使用传统的枚举值样式
    return getTaskStatusStyle(status as TaskStatus);
  }, [status, statusColor]);

  // 根据尺寸定义样式类名
  const sizeStyles = {
    xs: 'text-[9px] px-1 py-0.5 rounded-full',
    sm: 'text-[10px] px-1.5 py-0.5 rounded-full',
    md: 'text-xs px-2 py-1 rounded-full',
    lg: 'text-sm px-2.5 py-1.5 rounded-full'
  };

  return (
    <span
      className={`task-status-badge inline-flex items-center font-medium border ${sizeStyles[size]} ${className}`}
      style={{
        color: statusStyle.textColor,
        backgroundColor: statusStyle.bgColor,
        borderColor: statusStyle.borderColor
      }}
      aria-label={statusStyle.label}
      data-status={status.toLowerCase()}
    >
      {/* 显示图标 */}
      {showIcon && statusStyle.icon}

      {/* 显示文字标签 */}
      {statusStyle.label}
    </span>
  );
};

export default TaskStatusBadge;
