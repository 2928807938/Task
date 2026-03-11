'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {ProjectTask, TaskDistributionData} from '@/types/api-types';
import {FiPlus} from 'react-icons/fi';
import AppleStyleTaskHeader from '../../molecules/TaskHeader';
// 导入视图组件
import TaskBoardView from '@/ui/organisms/TaskBoardView/TaskBoardView';
import TaskCalendarView from '@/ui/organisms/TaskCalendarView/TaskCalendarView';
import TaskGanttView from '@/ui/organisms/TaskGanttView/TaskGanttView';
// 导入可滑动任务组件
// 导入新的任务行组件
import SwipeableTaskRow from './SwipeableTaskRow';

interface TaskTableViewProps {
  tasks: ProjectTask[];
  onTaskClick?: (task: ProjectTask) => void;
  onAddTask?: () => void;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  taskDistribution?: TaskDistributionData;
  projectId?: string; // 添加项目ID参数
  onTaskComplete?: (taskId: string) => void; // 添加任务完成处理函数
  onTaskDelete?: (taskId: string) => void; // 添加任务删除处理函数
  onTaskUpdate?: () => void; // 任务更新后的回调函数
  /** 项目整体进度（百分比） */
  projectProgress?: number;
  /** 项目任务总数 - 来自项目详情接口 */
  projectTaskCount?: number;
  /** 项目已完成任务数 - 来自项目详情接口 */
  projectCompletedTaskCount?: number;
  /** 当前视图类型（列表、看板、日历、甘特图） */
  currentView?: 'list' | 'board' | 'calendar' | 'gantt';
  /** 视图类型切换回调 */
  onViewChange?: (view: 'list' | 'board' | 'calendar' | 'gantt') => void;
}

export function TaskTableView({
  tasks,
  onTaskClick,
  onAddTask,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  taskDistribution,
  projectId,
  onTaskComplete,
  onTaskDelete,
  onTaskUpdate,
  projectProgress,
  projectTaskCount,
  projectCompletedTaskCount,
  currentView = 'list',
  onViewChange
}: TaskTableViewProps) {
  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  // 排序状态
  type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'startTime' | 'dueDate';
  type SortDirection = 'asc' | 'desc' | null;

  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({ field: 'dueDate', direction: 'asc' });

  // 内部视图状态（作为备用，优先使用传入的props）
  const [innerCurrentView, setInnerCurrentView] = useState<'list' | 'board' | 'calendar' | 'gantt'>(currentView);

  // 当传入的currentView属性变化时更新内部状态
  useEffect(() => {
    setInnerCurrentView(currentView);
  }, [currentView]);

  // 完成任务计数
  const [completedTasksCount, setCompletedTasksCount] = useState(0);

  // 计算完成任务数量
  useEffect(() => {
    const completedCount = tasks.filter(task => task.status === 'COMPLETED').length;
    setCompletedTasksCount(completedCount);
  }, [tasks]);

  // 排序处理函数
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => {
      if (prevConfig.field === field) {
        if (prevConfig.direction === 'asc') {
          return { field, direction: 'desc' };
        } else if (prevConfig.direction === 'desc') {
          return { field: 'dueDate', direction: 'asc' }; // 重置为默认排序
        } else {
          return { field, direction: 'asc' };
        }
      }
      return { field, direction: 'asc' };
    });
  };

  // 渲染排序指示器 - 使用更简洁的方式显示排序状态
  const renderSortIndicator = (field: SortField) => {
    if (sortConfig.field !== field || !sortConfig.direction) {
      return null; // 不显示任何指示器
    }
    // 只用文本显示排序状态，而不是箭头图标
    return <span className="ml-1 text-xs text-blue-400">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  // 排序和搜索过滤后的任务数据
  const sortedTasks = useMemo(() => {
    // 创建一个任务列表的副本进行处理
    let tasksCopy = [...tasks];

    // 先应用搜索过滤
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      tasksCopy = tasksCopy.filter(task =>
        task.title.toLowerCase().includes(keyword) ||
        (task.description && task.description.toLowerCase().includes(keyword)) ||
        (task.assignee && task.assignee.toLowerCase().includes(keyword))
      );
    }

    // 再进行排序
    if (!sortConfig.direction) return tasksCopy;

    return tasksCopy.sort((a, b) => {
      switch (sortConfig.field) {
        case 'title':
          return sortConfig.direction === 'asc'
            ? (a.title || '').localeCompare(b.title || '')
            : (b.title || '').localeCompare(a.title || '');

        case 'status':
          return sortConfig.direction === 'asc'
            ? (a.status || '').localeCompare(b.status || '')
            : (b.status || '').localeCompare(a.status || '');

        case 'priority':
          // 定义优先级的排序权重
          const priorityWeight = {
            'HIGH': 3,
            'MEDIUM': 2,
            'LOW': 1,
            '': 0
          };
          return sortConfig.direction === 'asc'
            ? (priorityWeight[a.priority as keyof typeof priorityWeight] || 0) - (priorityWeight[b.priority as keyof typeof priorityWeight] || 0)
            : (priorityWeight[b.priority as keyof typeof priorityWeight] || 0) - (priorityWeight[a.priority as keyof typeof priorityWeight] || 0);

        case 'assignee':
          return sortConfig.direction === 'asc'
            ? (a.assignee || '').localeCompare(b.assignee || '')
            : (b.assignee || '').localeCompare(a.assignee || '');

        case 'startTime':
          // 处理开始日期比较
          const startDateA = a.startTime ? new Date(a.startTime).getTime() : 0;
          const startDateB = b.startTime ? new Date(b.startTime).getTime() : 0;
          return sortConfig.direction === 'asc' ? startDateA - startDateB : startDateB - startDateA;

        case 'dueDate':
          // 处理截止日期比较
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;

        default:
          return 0;
      }
    });
  }, [tasks, sortConfig, searchKeyword]); // 添加searchKeyword作为依赖项

  // 处理视图切换
  const handleViewChange = (view: 'list' | 'board' | 'calendar' | 'gantt') => {
    // 如果有外部提供的切换回调，优先使用外部回调
    if (onViewChange) {
      onViewChange(view);
    } else {
      // 否则使用内部状态
      setInnerCurrentView(view);
    }
  };

  // 加载状态展示 - 苹果风格
  if (isLoading) {
    return (
      <div className="w-full">
        <AppleStyleTaskHeader
          totalTasks={tasks.length}
          completedTasks={completedTasksCount}
          onAddTask={onAddTask}
          onSearch={(query) => console.log('Search:', query)}
          onViewChange={handleViewChange}
          currentView={currentView}
        />

        <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-md shadow-sm mt-4">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-100 dark:bg-gray-800"></div>
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-50 dark:bg-gray-800/50 rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 主要渲染部分
  return (
    <div className="w-full">
      <AppleStyleTaskHeader
        totalTasks={projectTaskCount ?? tasks.length}
        completedTasks={projectCompletedTaskCount ?? completedTasksCount}
        onAddTask={onAddTask}
        onSearch={(query) => {
          // 处理搜索查询
          setSearchKeyword(query);

          // 如果用户清空搜索框，重置到第一页
          if (!query.trim() && onPageChange && currentPage !== 1) {
            onPageChange(1);
          }
        }}
        onViewChange={handleViewChange}
        currentView={onViewChange ? currentView : innerCurrentView} // 使用外部或内部当前视图
        taskDistribution={taskDistribution}
        isLoading={isLoading}
        projectProgress={projectProgress}
      />



      {/* 根据当前视图类型渲染不同视图组件 */}
      {(onViewChange ? currentView : innerCurrentView) === 'list' && (
        <div className="overflow-x-auto" style={{ minWidth: '768px' }}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50">
              <tr>
                <th
                  className="w-[40%] px-4 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide cursor-pointer whitespace-nowrap select-none"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    任务名称
                    {renderSortIndicator('title')}
                  </div>
                </th>
                <th
                  className="w-[10%] px-4 py-4 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide whitespace-nowrap select-none"
                >
                  <div className="flex items-center justify-center">
                    任务类型
                  </div>
                </th>
                <th
                  className="w-[10%] px-4 py-4 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide cursor-pointer whitespace-nowrap select-none"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center justify-center">
                    优先级
                    {renderSortIndicator('priority')}
                  </div>
                </th>
                <th
                  className="w-[10%] px-4 py-4 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide cursor-pointer whitespace-nowrap select-none"
                  onClick={() => handleSort('assignee')}
                >
                  <div className="flex items-center justify-center">
                    负责人
                    {renderSortIndicator('assignee')}
                  </div>
                </th>
                <th
                  className="w-[10%] px-4 py-4 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide cursor-pointer whitespace-nowrap select-none"
                  onClick={() => handleSort('startTime')}
                >
                  <div className="flex items-center justify-center">
                    开始时间
                    {renderSortIndicator('startTime')}
                  </div>
                </th>
                <th
                  className="w-[10%] px-4 py-4 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide cursor-pointer whitespace-nowrap select-none"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center justify-center">
                    截止日期
                    {renderSortIndicator('dueDate')}
                  </div>
                </th>
                <th className="w-[8%] px-4 py-4 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide whitespace-nowrap select-none">
                  进度
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {/* 显示所有任务，并标识主任务和子任务 */}
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedTasks.length > 0 ? (
                sortedTasks.map(task => (
                  <SwipeableTaskRow
                    key={task.id}
                    task={task}
                    tasks={tasks}
                    onTaskClick={onTaskClick}
                    onTaskComplete={onTaskComplete}
                    onTaskDelete={onTaskDelete}
                  />
                ))
              ) : searchKeyword.trim() ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">没有找到匹配的任务</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">尝试使用其他关键词搜索</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    暂无任务
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 如果存在分页信息，显示分页组件 */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} 条，共 {totalItems} 条
              </div>

              <div className="flex justify-center space-x-1">
                <button
                  className={`px-2 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                  disabled={currentPage === 1}
                  onClick={() => onPageChange && onPageChange(currentPage - 1)}
                >
                  上一页
                </button>

                {/* 动态生成页码按钮 */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  // 显示第一页、最后一页、当前页和当前页前后两页
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${pageNum === currentPage
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => onPageChange && onPageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === 2 && currentPage > 3) ||
                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    // 显示省略号
                    return <span key={pageNum} className="flex items-center px-1">…</span>;
                  }
                  return null;
                })}

                <button
                  className={`px-2 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange && onPageChange(currentPage + 1)}
                >
                  下一页
                </button>
              </div>

              {/* 每页显示数量选择器 */}
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">每页显示</span>
                <select
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm py-1 px-2 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                  value={pageSize}
                  onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
                >
                  {[10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 看板视图 */}
      {(onViewChange ? currentView : innerCurrentView) === 'board' && (
        <TaskBoardView
          tasks={sortedTasks}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
          projectId={projectId}
          onTaskUpdate={onTaskUpdate}
        />
      )}

      {/* 日历视图 */}
      {(onViewChange ? currentView : innerCurrentView) === 'calendar' && (
        <TaskCalendarView
          tasks={sortedTasks}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
        />
      )}

      {/* 甘特图视图 */}
      {(onViewChange ? currentView : innerCurrentView) === 'gantt' && (
        <TaskGanttView
          tasks={sortedTasks}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
        />
      )}

      {/* 空状态展示 - 支持所有视图 */}
      {sortedTasks.length === 0 && !isLoading && (
        <div className="mt-4 text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
          <svg
            className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            {tasks.length === 0 ? '没有任务' : '没有匹配的任务'}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {tasks.length === 0 
              ? '这个项目中尚未创建任何任务。点击下方按钮开始创建您的第一个任务。'
              : `没有找到匹配 "${searchKeyword}" 的任务。请尝试其他搜索关键词或清除搜索条件。`
            }
          </p>
          <div className="mt-4 space-y-2">
            {/* 如果是搜索结果为空，显示清除搜索按钮 */}
            {tasks.length > 0 && searchKeyword.trim() && (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                onClick={() => setSearchKeyword('')}
              >
                清除搜索条件
              </button>
            )}
            
            {/* 创建任务按钮，只在没有任务时显示 */}
            {onAddTask && tasks.length === 0 && (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                onClick={onAddTask}
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                创建新任务
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
