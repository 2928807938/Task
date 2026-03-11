'use client';

import React, {useMemo} from 'react';
import {TaskPriority} from '@/core/domain/entities/task';
import {getTaskPriorityStyle} from '@/utils/style-utils';

/**
 * TaskPriorityBadge组件属性接口
 */
interface TaskPriorityBadgeProps {
  /** 任务优先级 */
  priority: TaskPriority | string;
  /** 优先级颜色 (API返回的颜色) */
  priorityColor?: string;
  /** 标签尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 任务优先级标签组件 -
 * 根据任务优先级显示不同颜色的标签
 */
const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({
  priority,
  priorityColor,
  size = 'md',
  showIcon = false,
  className = '',
}) => {
  // 使用useMemo缓存优先级样式结果
  const priorityStyle = useMemo(() => {
    if (priorityColor) {
      // 如果提供了API颜色，使用API颜色
      return {
        textColor: '#ffffff',
        bgColor: priorityColor,
        borderColor: priorityColor,
        label: typeof priority === 'string' ? priority : (priority as string).toUpperCase(),
        icon: null
      };
    }
    // 否则使用传统的枚举值样式
    return getTaskPriorityStyle(priority as TaskPriority);
  }, [priority, priorityColor]);

  // 根据尺寸定义样式类名
  const sizeStyles = {
    xs: 'text-[9px] px-1 py-0.5 rounded-full',
    sm: 'text-[10px] px-1.5 py-0.5 rounded-full',
    md: 'text-xs px-2 py-1 rounded-full',
    lg: 'text-sm px-2.5 py-1.5 rounded-full'
  };

  return (
    <span
      className={`task-priority-badge inline-flex items-center font-medium border ${sizeStyles[size]} ${className}`}
      style={{
        color: priorityStyle.textColor,
        backgroundColor: priorityStyle.bgColor,
        borderColor: priorityStyle.borderColor
      }}
      aria-label={priorityStyle.label}
      data-priority={priority.toLowerCase()}
    >
      {/* 显示图标 */}
      {showIcon && priorityStyle.icon}

      {/* 显示文字标签 */}
      {priorityStyle.label}
    </span>
  );
};

export default TaskPriorityBadge;
