'use client';

import React from 'react';
import {FiChevronDown} from 'react-icons/fi';

// 任务卡片属性接口
export interface TaskMetricCardProps {
  title: string;
  subtitle?: string;
  progressValue?: number;
  progressMax?: number;
  progressLabel?: string;
  progressColor?: string;
  badge?: {
    text: string;
    color: string;
  };
  taskCount?: number;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

// 新拟态样式
const neumorphicStyles = {
  container: "bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-700",
  transition: "transition-all duration-200",
};

/**
 * 通用任务指标卡片组件
 * 用于显示任务相关的统计数据和进度信息
 */
const TaskMetricCard: React.FC<TaskMetricCardProps> = ({
  title,
  subtitle,
  progressValue = 0,
  progressMax = 100,
  progressLabel,
  progressColor = 'bg-blue-500',
  badge,
  taskCount,
  icon,
  children,
  fullWidth = false,
  className = '',
}) => {
  // 计算进度百分比
  const progressPercent = progressMax > 0 ? (progressValue / progressMax) * 100 : 0;

  return (
    <div className={`${neumorphicStyles.container} ${neumorphicStyles.transition} group hover:shadow p-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* 卡片头部 */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>

        {badge && (
          <div className={`${badge.color} text-xs font-medium px-2 py-1 rounded-full`}>
            {badge.text}
          </div>
        )}
      </div>

      {/* 进度条（如果有） */}
      {(progressValue !== undefined && progressMax !== undefined) && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {progressLabel || `${progressValue}/${progressMax}`}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-neutral-700 rounded-full h-1.5">
            <div
              className={`${progressColor} h-1.5 rounded-full`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 卡片内容 */}
      {children}

      {/* 底部计数（如果有） */}
      {taskCount !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>共 {taskCount} 个任务</span>
          <button className="text-blue-500 hover:text-blue-700 flex items-center transition-colors">
            查看详情 <FiChevronDown className="ml-1 h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskMetricCard;
