'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {ProjectTask, TaskDistributionData} from '@/types/api-types';
import {FiCheckCircle, FiClock, FiList, FiPlus, FiTarget} from 'react-icons/fi';
import AppleStyleTaskHeader from '../../molecules/TaskHeader';
import TaskBoardView from '@/ui/organisms/TaskBoardView/TaskBoardView';
import TaskCalendarView from '@/ui/organisms/TaskCalendarView/TaskCalendarView';
import TaskGanttView from '@/ui/organisms/TaskGanttView/TaskGanttView';
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
  projectId?: string;
  onTaskComplete?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskUpdate?: () => void;
  projectProgress?: number;
  projectTaskCount?: number;
  projectCompletedTaskCount?: number;
  currentView?: 'list' | 'board' | 'calendar' | 'gantt';
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
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'startTime' | 'dueDate';
  type SortDirection = 'asc' | 'desc' | null;

  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({ field: 'dueDate', direction: 'asc' });

  const [innerCurrentView, setInnerCurrentView] = useState<'list' | 'board' | 'calendar' | 'gantt'>(currentView);

  useEffect(() => {
    setInnerCurrentView(currentView);
  }, [currentView]);

  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const activeView = onViewChange ? currentView : innerCurrentView;

  useEffect(() => {
    const completedCount = tasks.filter(task => task.status === 'COMPLETED').length;
    setCompletedTasksCount(completedCount);
  }, [tasks]);

  const summaryTotalTasks = projectTaskCount ?? (totalItems > 0 ? totalItems : tasks.length);
  const summaryCompletedTasks = projectCompletedTaskCount ?? completedTasksCount;
  const summaryPendingTasks = Math.max(summaryTotalTasks - summaryCompletedTasks, 0);
  const summaryProgress = typeof projectProgress === 'number'
    ? Math.round(projectProgress)
    : Math.round((summaryCompletedTasks / Math.max(summaryTotalTasks, 1)) * 100);

  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => {
      if (prevConfig.field === field) {
        if (prevConfig.direction === 'asc') {
          return { field, direction: 'desc' };
        }
        if (prevConfig.direction === 'desc') {
          return { field: 'dueDate', direction: 'asc' };
        }
        return { field, direction: 'asc' };
      }
      return { field, direction: 'asc' };
    });
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortConfig.field !== field || !sortConfig.direction) {
      return null;
    }

    return <span className="ml-1 text-xs text-blue-400">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const sortedTasks = useMemo(() => {
    let tasksCopy = [...tasks];

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      tasksCopy = tasksCopy.filter(task =>
        task.title.toLowerCase().includes(keyword) ||
        (task.description && task.description.toLowerCase().includes(keyword)) ||
        (task.assignee && task.assignee.toLowerCase().includes(keyword))
      );
    }

    if (!sortConfig.direction) {
      return tasksCopy;
    }

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
        case 'priority': {
          const priorityWeight = {
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1,
            '': 0
          };

          return sortConfig.direction === 'asc'
            ? (priorityWeight[a.priority as keyof typeof priorityWeight] || 0) - (priorityWeight[b.priority as keyof typeof priorityWeight] || 0)
            : (priorityWeight[b.priority as keyof typeof priorityWeight] || 0) - (priorityWeight[a.priority as keyof typeof priorityWeight] || 0);
        }
        case 'assignee':
          return sortConfig.direction === 'asc'
            ? (a.assignee || '').localeCompare(b.assignee || '')
            : (b.assignee || '').localeCompare(a.assignee || '');
        case 'startTime': {
          const startDateA = a.startTime ? new Date(a.startTime).getTime() : 0;
          const startDateB = b.startTime ? new Date(b.startTime).getTime() : 0;
          return sortConfig.direction === 'asc' ? startDateA - startDateB : startDateB - startDateA;
        }
        case 'dueDate': {
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        default:
          return 0;
      }
    });
  }, [tasks, sortConfig, searchKeyword]);

  const handleViewChange = (view: 'list' | 'board' | 'calendar' | 'gantt') => {
    if (onViewChange) {
      onViewChange(view);
      return;
    }

    setInnerCurrentView(view);
  };

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

        <div className="mt-4 overflow-hidden rounded-md border border-gray-200 shadow-sm dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-100 dark:bg-gray-800"></div>
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-14 rounded-md bg-gray-50 dark:bg-gray-800/50"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AppleStyleTaskHeader
        totalTasks={summaryTotalTasks}
        completedTasks={summaryCompletedTasks}
        onAddTask={onAddTask}
        onSearch={(query) => {
          setSearchKeyword(query);

          if (!query.trim() && onPageChange && currentPage !== 1) {
            onPageChange(1);
          }
        }}
        onViewChange={handleViewChange}
        currentView={activeView}
        taskDistribution={taskDistribution}
        isLoading={isLoading}
        projectProgress={projectProgress}
      />

      {activeView === 'list' && (
        <div className="mt-4 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/75">
          <div className="border-b border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-blue-50/70 px-4 py-4 dark:border-white/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-[0_12px_28px_-16px_rgba(37,99,235,0.9)]">
                    <FiList size={18} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">任务列表</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      当前显示 {sortedTasks.length} 条{searchKeyword.trim() ? '搜索结果' : ''}，已完成 {summaryCompletedTasks} 条，待处理 {summaryPendingTasks} 条
                    </p>
                  </div>
                </div>

                <div className="mt-4 max-w-xl rounded-2xl border border-white/70 bg-white/80 p-3 shadow-[0_12px_36px_-28px_rgba(15,23,42,0.28)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500 dark:text-slate-400">整体完成进度</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{summaryProgress}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${summaryProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:min-w-[380px]">
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <FiTarget size={14} />
                    <span className="text-xs font-medium">任务总数</span>
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{summaryTotalTasks}</div>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-3 shadow-sm backdrop-blur-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
                    <FiCheckCircle size={14} />
                    <span className="text-xs font-medium">已完成</span>
                  </div>
                  <div className="mt-2 text-xl font-semibold text-emerald-700 dark:text-emerald-200">{summaryCompletedTasks}</div>
                </div>

                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-3 shadow-sm backdrop-blur-sm dark:border-amber-500/20 dark:bg-amber-500/10">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
                    <FiClock size={14} />
                    <span className="text-xs font-medium">待处理</span>
                  </div>
                  <div className="mt-2 text-xl font-semibold text-amber-700 dark:text-amber-200">{summaryPendingTasks}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                完成率 {summaryProgress}%
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                共 {summaryTotalTasks} 个任务
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
                当前页 {sortedTasks.length} 条
              </span>
              {searchKeyword.trim() && (
                <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                  搜索：{searchKeyword}
                </span>
              )}
            </div>
          </div>

          <div className="px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
            <div className="overflow-x-auto" style={{ minWidth: '768px' }}>
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead className="sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th
                      className="w-[38%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex cursor-pointer items-center whitespace-nowrap select-none">
                        任务名称
                        {renderSortIndicator('title')}
                      </div>
                    </th>
                    <th className="w-[10%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                      <div className="flex items-center justify-center whitespace-nowrap">任务类型</div>
                    </th>
                    <th
                      className="w-[10%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300"
                      onClick={() => handleSort('priority')}
                    >
                      <div className="flex cursor-pointer items-center justify-center whitespace-nowrap select-none">
                        优先级
                        {renderSortIndicator('priority')}
                      </div>
                    </th>
                    <th
                      className="w-[12%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300"
                      onClick={() => handleSort('assignee')}
                    >
                      <div className="flex cursor-pointer items-center justify-center whitespace-nowrap select-none">
                        负责人
                        {renderSortIndicator('assignee')}
                      </div>
                    </th>
                    <th
                      className="w-[12%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300"
                      onClick={() => handleSort('startTime')}
                    >
                      <div className="flex cursor-pointer items-center justify-center whitespace-nowrap select-none">
                        开始时间
                        {renderSortIndicator('startTime')}
                      </div>
                    </th>
                    <th
                      className="w-[12%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300"
                      onClick={() => handleSort('dueDate')}
                    >
                      <div className="flex cursor-pointer items-center justify-center whitespace-nowrap select-none">
                        截止日期
                        {renderSortIndicator('dueDate')}
                      </div>
                    </th>
                    <th className="w-[8%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                      进度
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
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
                      <td colSpan={7} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 py-10 dark:border-white/10 dark:bg-white/[0.02]">
                          <svg className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <p className="mb-1 text-slate-600 dark:text-slate-300">没有找到匹配的任务</p>
                          <p className="text-sm text-slate-400 dark:text-slate-500">尝试使用其他关键词搜索</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center">
                        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 py-10 text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-400">
                          暂无任务
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-2 flex flex-col gap-3 rounded-[24px] border border-slate-200/70 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} 条，共 {totalItems} 条
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    className={`rounded-full px-3 py-1.5 text-sm ${currentPage === 1 ? 'cursor-not-allowed text-slate-400' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/5'}`}
                    disabled={currentPage === 1}
                    onClick={() => onPageChange && onPageChange(currentPage - 1)}
                  >
                    上一页
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={pageNum}
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${pageNum === currentPage
                            ? 'bg-blue-600 text-white shadow-[0_10px_20px_-12px_rgba(37,99,235,0.9)] dark:bg-blue-500 dark:text-white'
                            : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/5'
                          }`}
                          onClick={() => onPageChange && onPageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    }

                    if (
                      (pageNum === 2 && currentPage > 3) ||
                      (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return <span key={pageNum} className="flex items-center px-1">…</span>;
                    }

                    return null;
                  })}

                  <button
                    className={`rounded-full px-3 py-1.5 text-sm ${currentPage === totalPages ? 'cursor-not-allowed text-slate-400' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/5'}`}
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange && onPageChange(currentPage + 1)}
                  >
                    下一页
                  </button>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 text-sm text-slate-500 dark:text-slate-400">每页显示</span>
                  <select
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:focus:ring-blue-400"
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
        </div>
      )}

      {activeView === 'board' && (
        <TaskBoardView
          tasks={sortedTasks}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
          projectId={projectId}
          onTaskUpdate={onTaskUpdate}
        />
      )}

      {activeView === 'calendar' && (
        <TaskCalendarView
          tasks={sortedTasks}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
        />
      )}

      {activeView === 'gantt' && (
        <TaskGanttView
          tasks={sortedTasks}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
        />
      )}

      {activeView !== 'list' && sortedTasks.length === 0 && !isLoading && (
        <div className="mt-4 rounded-[28px] border border-slate-200/80 bg-white/90 py-14 text-center shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/70">
          <svg
            className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600"
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
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {tasks.length === 0 ? '没有任务' : '没有匹配的任务'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {tasks.length === 0
              ? '这个项目中尚未创建任何任务。点击下方按钮开始创建您的第一个任务。'
              : `没有找到匹配 "${searchKeyword}" 的任务。请尝试其他搜索关键词或清除搜索条件。`
            }
          </p>
          <div className="mt-4 space-y-2">
            {tasks.length > 0 && searchKeyword.trim() && (
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setSearchKeyword('')}
              >
                清除搜索条件
              </button>
            )}

            {onAddTask && tasks.length === 0 && (
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-[0_18px_32px_-20px_rgba(37,99,235,0.9)] transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
