'use client';

import React, {useMemo} from 'react';
import {getDueDateStatusStyle} from '@/utils/style-utils';

/**
 * TaskDueDateBadge组件属性接口
 */
interface TaskDueDateBadgeProps {
  /** 截止日期字符串(ISO格式) */
  dueDate: string;
  /** 是否显示文字标签 */
  showLabel?: boolean;
  /** 是否显示剩余天数 */
  showDays?: boolean;
  /** 尺寸选项 */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
  /** 自定义状态样式阈值（天数） */
  thresholds?: {
    /** 紧急阈值（默认2天） */
    urgent?: number;
    /** 即将到期阈值（默认5天） */
    soon?: number;
  };
}

/**
 * 任务截止日期状态标签组件
 * 根据任务截止日期的紧急程度显示不同样式的标签
 */
const TaskDueDateBadge: React.FC<TaskDueDateBadgeProps> = ({
  dueDate,
  showLabel = true,
  showDays = false,
  size = 'sm',
  className = '',
  thresholds = { urgent: 2, soon: 5 }
}) => {
  // 使用useMemo缓存计算结果，避免不必要的重复计算
  const { statusStyle, daysText } = useMemo(() => {
    return getDueDateStatusStyle(dueDate, thresholds);
  }, [dueDate, thresholds]);

  // 根据尺寸定义样式类名
  const sizeStyles = {
    xs: 'text-[9px] px-1 py-0.5 rounded-full',
    sm: 'text-[10px] px-1.5 py-0.5 rounded-full',
    md: 'text-xs px-2 py-0.5 rounded-full',
    lg: 'text-sm px-2.5 py-0.75 rounded-full'
  };

  // 构建显示的标签文本
  const displayText = showDays && daysText
    ? (showLabel ? `${statusStyle.label}(${daysText})` : daysText)
    : statusStyle.label;

  return (
    <span
      className={`task-due-date-badge inline-flex items-center font-medium border ${sizeStyles[size]} ${className}`}
      style={{
        color: statusStyle.color,
        backgroundColor: statusStyle.bgColor,
        borderColor: statusStyle.borderColor
      }}
      aria-label={statusStyle.label}
      data-status={statusStyle.status}
    >
      {/* 在特小尺寸下只显示圆点 */}
      {size === 'xs' && !showLabel && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: statusStyle.color }}
        />
      )}

      {/* 显示文字标签 */}
      {(size !== 'xs' || showLabel) && displayText}
    </span>
  );
};

export default TaskDueDateBadge;
