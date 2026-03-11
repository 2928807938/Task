'use client';

import React, {useState} from 'react';
import {FiFilter, FiList, FiPlus, FiSearch, FiX} from 'react-icons/fi';
import {Task, TaskPriority, TaskStatus} from '@/core/domain/entities/task';
import {TaskItem} from '@/ui/molecules/TaskItem/TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
}

export function TaskList({ tasks, onToggleTask, onRemoveTask }: TaskListProps) {
  type FilterType = 'all' | 'in_progress' | 'completed';
  type SortType = 'created_at' | 'due_date' | 'priority';
  type PriorityFilter = 'all' | TaskPriority.HIGH | TaskPriority.MEDIUM | TaskPriority.LOW;

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortBy, setSortBy] = useState<SortType>('created_at');
  const [showFilters, setShowFilters] = useState(false);

  // 根据筛选条件过滤任务
  const filteredTasks = tasks.filter(task => {
    // 搜索条件过滤
    const matchesSearch = searchText === '' ||
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchText.toLowerCase()));

    // 状态过滤
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && task.status === TaskStatus.COMPLETED) ||
      (filterStatus === 'in_progress' && task.status === TaskStatus.IN_PROGRESS);

    // 优先级过滤
    const matchesPriority =
      priorityFilter === 'all' ||
      (priorityFilter === TaskPriority.HIGH && task.priority === TaskPriority.HIGH) ||
      (priorityFilter === TaskPriority.MEDIUM && task.priority === TaskPriority.MEDIUM) ||
      (priorityFilter === TaskPriority.LOW && task.priority === TaskPriority.LOW);

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 排序任务
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'created_at') {
      // 创建时间晚的排在前面
      return (new Date(b.createdAt)).getTime() - (new Date(a.createdAt)).getTime();
    } else if (sortBy === 'due_date') {
      // 截止日期近的排在前面，没有截止日期的排在后面
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return (new Date(a.dueDate)).getTime() - (new Date(b.dueDate)).getTime();
    } else if (sortBy === 'priority') {
      // 优先级映射：HIGH > MEDIUM > LOW
      const priorityMap: {[key: string]: number} = {
        [TaskPriority.HIGH]: 3,
        [TaskPriority.MEDIUM]: 2,
        [TaskPriority.LOW]: 1
      };
      return priorityMap[b.priority] - priorityMap[a.priority];
    }
    return 0;
  });

  // 分类统计任务数量
  const taskStats = {
    all: tasks.length,
    in_progress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    [TaskPriority.HIGH]: tasks.filter(t => t.priority === TaskPriority.HIGH).length,
    [TaskPriority.MEDIUM]: tasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
    [TaskPriority.LOW]: tasks.filter(t => t.priority === TaskPriority.LOW).length
  };

  // 空状态展示
  if (tasks.length === 0) {
    return (
      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center h-32 border border-dashed border-gray-200">
              {index === 0 ? (
                <div className="flex flex-col items-center">
                  <button className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mb-2">
                    <FiPlus className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-500">添加新任务</span>
                </div>
              ) : (
                <span className="text-gray-300">空白任务卡片</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {/* 搜索栏 */}
      <div className="relative mb-4">
        <div className="flex items-center w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-2 text-gray-500">
            <FiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="搜索任务名称或描述..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 py-2 pr-3 outline-none text-gray-700 placeholder-gray-400"
          />
          {searchText && (
            <button
              className="p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSearchText('')}
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 任务筛选区域 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span>状态：</span>
          {['all', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as FilterType)}
              className={`px-2 py-1 rounded ${filterStatus === status 
                ? 'bg-blue-50 text-blue-500 font-medium' 
                : 'hover:bg-gray-50'}`}
            >
              {status === 'all' && '全部'}
              {status === 'in_progress' && '进行中'}
              {status === 'completed' && '已完成'}
              <span className="ml-1 text-xs">
                ({taskStats[status as keyof typeof taskStats]})
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white"
          >
            <option value="created_at">按创建时间</option>
            <option value="due_date">按截止日期</option>
            <option value="priority">按优先级</option>
          </select>
          <button
            className={`p-1.5 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-500' : 'bg-white border-gray-200 text-gray-500'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 高级筛选区域 */}
      {showFilters && (
        <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200 animate-fadeIn">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">优先级筛选</span>
              <div className="flex gap-2">
                {['all', TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priority as PriorityFilter)}
                    className={`px-2 py-1 text-xs rounded ${priorityFilter === priority 
                      ? 'bg-blue-50 text-blue-500 font-medium' 
                      : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
                  >
                    {priority === 'all' && '全部'}
                    {priority === TaskPriority.HIGH && '高'}
                    {priority === TaskPriority.MEDIUM && '中'}
                    {priority === TaskPriority.LOW && '低'}
                    {priority !== 'all' && (
                      <span className="ml-1">({taskStats[priority as keyof typeof taskStats] || 0})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 这里可以添加更多筛选条件，如日期范围等 */}
          </div>
        </div>
      )}

      {/* 任务卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onRemove={onRemoveTask}
            />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg p-8 text-center shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiList className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">没有找到匹配的任务</h3>
              <p className="text-gray-500 mb-4">
                {searchText ? `没有找到包含「${searchText}」的任务` : ''}
                {filterStatus !== 'all' ? `，且${filterStatus === 'completed' ? '已完成' : '进行中'}` : ''}
                {priorityFilter !== 'all' ? `，且优先级为「${priorityFilter === TaskPriority.HIGH ? '高' : priorityFilter === TaskPriority.MEDIUM ? '中' : '低'}」` : ''}
                {!searchText && filterStatus === 'all' && priorityFilter === 'all' ? '尝试调整筛选条件或创建新任务' : '尝试调整搜索条件或筛选条件'}
              </p>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2">
                <FiPlus className="w-4 h-4" />
                添加新任务
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
