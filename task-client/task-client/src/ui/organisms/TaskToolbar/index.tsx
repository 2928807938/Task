'use client';

import React from 'react';
import {FiPlus} from 'react-icons/fi';
import ActionButton from '@/ui/molecules/ActionButton';
import SearchBar from '@/ui/molecules/SearchBar';
import TaskFilter from '@/ui/molecules/TaskFilter';

interface TaskToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onAddTask: () => void;
  className?: string;
  // 筛选相关属性
  statusFilter?: string;
  priorityFilter?: string;
  sortBy?: string;
  onStatusFilterChange?: (status: string) => void;
  onPriorityFilterChange?: (priority: string) => void;
  onSortChange?: (sort: string) => void;
  statusCounts?: Record<string, number>;
  priorityCounts?: Record<string, number>;
}

/**
 * 任务工具栏组件
 * 统一处理搜索、视图切换和新增任务按钮
 */
const TaskToolbar: React.FC<TaskToolbarProps> = ({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  onAddTask,
  className = '',
  // 筛选相关属性
  statusFilter = 'all',
  priorityFilter = 'all',
  sortBy = 'created_at_desc',
  onStatusFilterChange = () => {},
  onPriorityFilterChange = () => {},
  onSortChange = () => {},
  statusCounts = {},
  priorityCounts = {},
}) => {

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-3 mb-4 ${className} ${showFilters ? 'pb-0' : ''}`}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        {/* 搜索栏容器 */}
        <div className="flex-1 min-w-[250px]">
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="搜索任务..."
            showFilters={showFilters}
            onToggleFilters={onToggleFilters}
          />
        </div>

        {/* 新增任务按钮 - 只在一个地方出现 */}
        <ActionButton
          icon={<FiPlus />}
          text="新增任务"
          variant="primary"
          onClick={onAddTask}
        />
      </div>



      {/* 筛选面板 - 内嵌在工具栏内部 */}
      {showFilters && (
        <div className="mt-3 border-t border-gray-200 dark:border-neutral-700 pt-3 animate-fadeIn">
          <TaskFilter
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            sortBy={sortBy}
            onStatusFilterChange={onStatusFilterChange}
            onPriorityFilterChange={onPriorityFilterChange}
            onSortChange={onSortChange}
            statusCounts={statusCounts}
            priorityCounts={priorityCounts}
          />
        </div>
      )}
    </div>
  );
};

export default TaskToolbar;
