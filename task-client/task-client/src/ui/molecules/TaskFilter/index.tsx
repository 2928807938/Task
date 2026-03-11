'use client';

import React from 'react';
import {TaskPriority, TaskStatus} from '@/core/domain/entities/task';

interface TaskFilterProps {
  statusFilter: string;
  priorityFilter: string;
  sortBy: string;
  onStatusFilterChange: (status: string) => void;
  onPriorityFilterChange: (priority: string) => void;
  onSortChange: (sort: string) => void;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  className?: string;
}

/**
 * 任务筛选组件
 * 用于筛选任务状态、优先级和排序
 */
const TaskFilter: React.FC<TaskFilterProps> = ({
  statusFilter,
  priorityFilter,
  sortBy,
  onStatusFilterChange,
  onPriorityFilterChange,
  onSortChange,
  statusCounts,
  priorityCounts,
  className = '',
}) => {
  return (
    <div className={`bg-gray-50 dark:bg-neutral-900 rounded-lg p-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 状态筛选 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">任务状态</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1 text-xs rounded-full ${
                statusFilter === 'all'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700'
              }`}
            >
              全部
              <span className="ml-1">({statusCounts.all || 0})</span>
            </button>
            <button
              onClick={() => onStatusFilterChange(TaskStatus.IN_PROGRESS)}
              className={`px-3 py-1 text-xs rounded-full ${
                statusFilter === TaskStatus.IN_PROGRESS
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700'
              }`}
            >
              进行中
              <span className="ml-1">({statusCounts[TaskStatus.IN_PROGRESS] || 0})</span>
            </button>
            <button
              onClick={() => onStatusFilterChange(TaskStatus.COMPLETED)}
              className={`px-3 py-1 text-xs rounded-full ${
                statusFilter === TaskStatus.COMPLETED
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700'
              }`}
            >
              已完成
              <span className="ml-1">({statusCounts[TaskStatus.COMPLETED] || 0})</span>
            </button>
            <button
              onClick={() => onStatusFilterChange(TaskStatus.WAITING)}
              className={`px-3 py-1 text-xs rounded-full ${
                statusFilter === TaskStatus.WAITING
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700'
              }`}
            >
              待处理
              <span className="ml-1">({statusCounts[TaskStatus.WAITING] || 0})</span>
            </button>
            <button
              onClick={() => onStatusFilterChange(TaskStatus.OVERDUE)}
              className={`px-3 py-1 text-xs rounded-full ${
                statusFilter === TaskStatus.OVERDUE
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700'
              }`}
            >
              已逾期
              <span className="ml-1">({statusCounts[TaskStatus.OVERDUE] || 0})</span>
            </button>
          </div>
        </div>

        {/* 优先级筛选 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">优先级</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onPriorityFilterChange('all')}
              className={`px-3 py-1 text-xs rounded-full ${
                priorityFilter === 'all'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700'
              }`}
            >
              全部
              <span className="ml-1">({priorityCounts.all || 0})</span>
            </button>
            <button
              onClick={() => onPriorityFilterChange(TaskPriority.HIGH)}
              className={`px-3 py-1 text-xs rounded-full ${
                priorityFilter === TaskPriority.HIGH
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700'
              }`}
            >
              高优先级
              <span className="ml-1">({priorityCounts[TaskPriority.HIGH] || 0})</span>
            </button>
            <button
              onClick={() => onPriorityFilterChange(TaskPriority.MEDIUM)}
              className={`px-3 py-1 text-xs rounded-full ${
                priorityFilter === TaskPriority.MEDIUM
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700'
              }`}
            >
              中优先级
              <span className="ml-1">({priorityCounts[TaskPriority.MEDIUM] || 0})</span>
            </button>
            <button
              onClick={() => onPriorityFilterChange(TaskPriority.LOW)}
              className={`px-3 py-1 text-xs rounded-full ${
                priorityFilter === TaskPriority.LOW
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700'
              }`}
            >
              低优先级
              <span className="ml-1">({priorityCounts[TaskPriority.LOW] || 0})</span>
            </button>
          </div>
        </div>

        {/* 排序选项 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">排序方式</h3>
          <div className="flex flex-col gap-2">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
            >
              <option value="created_at_desc">创建时间（最新优先）</option>
              <option value="created_at_asc">创建时间（最早优先）</option>
              <option value="due_date_asc">截止日期（最近优先）</option>
              <option value="due_date_desc">截止日期（最远优先）</option>
              <option value="priority_desc">优先级（高到低）</option>
              <option value="priority_asc">优先级（低到高）</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;
