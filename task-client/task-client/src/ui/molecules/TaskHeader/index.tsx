'use client';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  FiBarChart2,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiGrid,
  FiList,
  FiPieChart,
  FiPlusCircle,
  FiSearch,
  FiX
} from 'react-icons/fi';
import {AnimatePresence, motion} from 'framer-motion';
import {TaskDistributionData} from '@/types/api-types';
import TaskStatisticsSkeleton from '@/ui/molecules/TaskStatisticsSkeleton';
import {useTheme} from '@/ui/theme';

interface AppleStyleTaskHeaderProps {
  totalTasks: number;
  completedTasks: number;
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  onViewChange?: (view: 'list' | 'board' | 'calendar' | 'gantt') => void;
  onAddTask?: () => void;
  currentView?: 'list' | 'board' | 'calendar' | 'gantt';
  taskDistribution?: TaskDistributionData;
  isLoading?: boolean;
  projectProgress?: number;
}

type FilterDraft = {
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
};

const defaultFilters: FilterDraft = {
  status: 'all',
  priority: 'all',
  assignee: 'all',
  dueDate: 'all'
};

const viewOptions = [
  { key: 'list', label: '列表视图', icon: FiList },
  { key: 'board', label: '看板视图', icon: FiGrid },
  { key: 'calendar', label: '日历视图', icon: FiCalendar },
  { key: 'gantt', label: '甘特图', icon: FiBarChart2 }
] as const;

const AppleStyleTaskHeader: React.FC<AppleStyleTaskHeaderProps> = ({
  totalTasks,
  completedTasks,
  onSearch,
  onFilter,
  onViewChange,
  onAddTask,
  currentView,
  taskDistribution,
  isLoading = false,
  projectProgress
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;

  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterDraft>(defaultFilters);

  const actualView = currentView || 'list';
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const safeTotalTasks = Number.isFinite(Number(totalTasks)) ? Number(totalTasks) : 0;
  const safeCompletedTasks = Number.isFinite(Number(completedTasks)) ? Number(completedTasks) : 0;
  const pendingTasks = Math.max(safeTotalTasks - safeCompletedTasks, 0);
  const completionPercent = Math.round((safeCompletedTasks / Math.max(safeTotalTasks, 1)) * 100);
  const activeFilterCount = Object.values(draftFilters).filter(value => value !== 'all').length;

  const overviewStats = useMemo(() => {
    if (!taskDistribution) {
      return {
        completed: safeCompletedTasks,
        total: safeTotalTasks,
        priorityItems: [],
        statusItems: []
      };
    }

    return {
      completed: Number.isFinite(Number(taskDistribution.completed)) ? Number(taskDistribution.completed) : safeCompletedTasks,
      total: Number.isFinite(Number(taskDistribution.total)) ? Number(taskDistribution.total) : safeTotalTasks,
      priorityItems: taskDistribution.priorityDistribution.items,
      statusItems: taskDistribution.statusDistribution.items
    };
  }, [safeCompletedTasks, safeTotalTasks, taskDistribution]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterButtonRef.current && filterButtonRef.current.contains(event.target as Node)) {
        return;
      }

      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setShowAdvancedFilters(false);
      }
    };

    if (showAdvancedFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAdvancedFilters]);

  const handleViewChange = (view: 'list' | 'board' | 'calendar' | 'gantt') => {
    onViewChange?.(view);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleApplyFilters = () => {
    onFilter?.(draftFilters);
    setShowAdvancedFilters(false);
  };

  const handleResetFilters = () => {
    setDraftFilters(defaultFilters);
    onFilter?.(defaultFilters);
  };

  return (
    <div className={`overflow-hidden rounded-[28px] border shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] ${
      isDarkMode ? 'border-white/10 bg-slate-900/80' : 'border-slate-200/80 bg-white/95'
    }`}>
      <div
        className={`sticky z-30 border-b px-4 py-4 backdrop-blur-xl sm:px-5 ${
          isDarkMode ? 'border-white/10 bg-slate-900/88' : 'border-slate-200/80 bg-white/88'
        }`}
        style={{
          top: 'var(--project-header-height, 80px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          backdropFilter: 'saturate(180%) blur(20px)'
        }}
      >
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <form
            className="w-full xl:max-w-[520px]"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch?.(searchQuery);
            }}
          >
            <div className={`group flex items-center gap-3 rounded-[22px] border px-4 py-3 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)] transition-all ${
              isDarkMode
                ? 'border-white/10 bg-white/[0.04] focus-within:border-blue-400/50 focus-within:bg-white/[0.06]'
                : 'border-slate-200 bg-slate-50/85 focus-within:border-blue-300 focus-within:bg-white'
            }`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                isDarkMode ? 'bg-blue-500/12 text-blue-300' : 'bg-blue-50 text-blue-600'
              }`}>
                <FiSearch size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className={`mb-1 text-[11px] font-medium uppercase tracking-[0.2em] ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Search Tasks
                </div>
                <input
                  type="text"
                  className={`w-full bg-transparent text-sm outline-none ${
                    isDarkMode ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="搜索任务、描述或负责人..."
                  value={searchQuery}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSearchQuery(value);

                    if (value === '' && !isComposing) {
                      onSearch?.('');
                    } else if (!isComposing) {
                      onSearch?.(value);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !isComposing) {
                      event.preventDefault();
                      onSearch?.(searchQuery);
                    }
                  }}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={(event) => {
                    const value = event.currentTarget.value;
                    setIsComposing(false);
                    onSearch?.(value);
                  }}
                />
              </div>

              {searchQuery ? (
                <button
                  type="button"
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:bg-white/10 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-200/70 hover:text-slate-700'
                  }`}
                  onClick={() => handleSearch('')}
                >
                  <FiX size={15} />
                </button>
              ) : (
                <div className={`hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${
                  isDarkMode ? 'bg-white/[0.05] text-slate-400' : 'bg-white text-slate-500'
                }`}>
                  共 {totalTasks} 项
                </div>
              )}
            </div>
          </form>

          <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
            <div className={`inline-flex w-full items-center rounded-[22px] border p-1.5 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.35)] xl:w-auto ${
              isDarkMode ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-100/90'
            }`}>
              {viewOptions.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleViewChange(key)}
                  className={`inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-[16px] px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm xl:flex-none ${
                    actualView === key
                      ? isDarkMode
                        ? 'bg-blue-500/18 text-blue-100 shadow-[0_10px_24px_-18px_rgba(59,130,246,0.9)]'
                        : 'bg-white text-slate-800 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.24)]'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="mr-1.5 shrink-0" size={14} />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <div className="relative">
                <button
                  ref={filterButtonRef}
                  type="button"
                  onClick={() => setShowAdvancedFilters(prev => !prev)}
                  className={`inline-flex items-center rounded-[18px] border px-3.5 py-2.5 text-xs font-medium transition-all sm:text-sm ${
                    showAdvancedFilters || activeFilterCount > 0
                      ? isDarkMode
                        ? 'border-blue-400/30 bg-blue-500/12 text-blue-200'
                        : 'border-blue-200 bg-blue-50 text-blue-700'
                      : isDarkMode
                        ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FiFilter className="mr-1.5 shrink-0" size={14} />
                  筛选
                  {activeFilterCount > 0 && (
                    <span className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${
                      isDarkMode ? 'bg-blue-400/20 text-blue-100' : 'bg-blue-600 text-white'
                    }`}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowStats(prev => !prev)}
                className={`inline-flex items-center rounded-[18px] border px-3.5 py-2.5 text-xs font-medium transition-all sm:text-sm ${
                  showStats
                    ? isDarkMode
                      ? 'border-blue-400/30 bg-blue-500/12 text-blue-200'
                      : 'border-blue-200 bg-blue-50 text-blue-700'
                    : isDarkMode
                      ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FiPieChart className="mr-1.5 shrink-0" size={14} />
                统计
                <span className="ml-1.5 shrink-0">
                  {showStats ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                </span>
              </button>

              <button
                type="button"
                onClick={onAddTask}
                className="inline-flex items-center rounded-[18px] bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_18px_32px_-20px_rgba(37,99,235,0.95)] transition-all hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm"
              >
                <FiPlusCircle className="mr-1.5 shrink-0" size={15} />
                添加任务
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              ref={filterPanelRef}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={`mt-4 rounded-[24px] border p-4 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.45)] ${
                isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/90'
              }`}>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>高级筛选</h3>
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      目前先做前端筛选面板样式统一，不改后端接口。
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isDarkMode ? 'bg-white/[0.05] text-slate-300' : 'bg-white text-slate-500'
                    }`}>
                      已选 {activeFilterCount} 项
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      key: 'status',
                      label: '状态',
                      options: [
                        { value: 'all', label: '全部状态' },
                        { value: 'waiting', label: '待处理' },
                        { value: 'in_progress', label: '进行中' },
                        { value: 'completed', label: '已完成' }
                      ]
                    },
                    {
                      key: 'priority',
                      label: '优先级',
                      options: [
                        { value: 'all', label: '全部优先级' },
                        { value: 'high', label: '高优先级' },
                        { value: 'medium', label: '中优先级' },
                        { value: 'low', label: '低优先级' }
                      ]
                    },
                    {
                      key: 'assignee',
                      label: '负责人',
                      options: [
                        { value: 'all', label: '全部成员' },
                        { value: 'assigned', label: '已分配' },
                        { value: 'unassigned', label: '未分配' },
                        { value: 'mine', label: '仅我的任务' }
                      ]
                    },
                    {
                      key: 'dueDate',
                      label: '截止时间',
                      options: [
                        { value: 'all', label: '全部时间' },
                        { value: 'today', label: '今天到期' },
                        { value: 'week', label: '本周到期' },
                        { value: 'overdue', label: '已逾期' }
                      ]
                    }
                  ].map(item => (
                    <div key={item.key}>
                      <label className={`mb-1.5 block text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.label}
                      </label>
                      <select
                        value={draftFilters[item.key as keyof FilterDraft]}
                        onChange={(event) => setDraftFilters(prev => ({
                          ...prev,
                          [item.key]: event.target.value
                        }))}
                        className={`w-full rounded-[16px] border px-3 py-2.5 text-sm outline-none transition-all ${
                          isDarkMode
                            ? 'border-white/10 bg-slate-900/80 text-slate-200 focus:border-blue-400/40'
                            : 'border-slate-200 bg-white text-slate-700 focus:border-blue-300'
                        }`}
                      >
                        {item.options.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {activeFilterCount === 0 ? (
                      <span className={`rounded-full px-3 py-1 text-xs ${isDarkMode ? 'bg-white/[0.05] text-slate-400' : 'bg-white text-slate-500'}`}>
                        当前未选择筛选条件
                      </span>
                    ) : (
                      Object.entries(draftFilters)
                        .filter(([, value]) => value !== 'all')
                        .map(([key, value]) => (
                          <span
                            key={key}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}
                          >
                            {key} · {value}
                          </span>
                        ))
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`rounded-[14px] px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
                        isDarkMode
                          ? 'border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={handleResetFilters}
                    >
                      重置
                    </button>
                    <button
                      type="button"
                      className="rounded-[14px] bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_14px_28px_-20px_rgba(37,99,235,0.95)] transition-all hover:bg-blue-700 sm:text-sm"
                      onClick={handleApplyFilters}
                    >
                      应用筛选
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className={`border-b px-4 py-4 sm:px-5 ${isDarkMode ? 'border-white/10 bg-slate-950/40' : 'border-slate-100 bg-slate-50/60'}`}
          >
            {isLoading ? (
              <TaskStatisticsSkeleton />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Statistics Overview
                    </p>
                    <h3 className={`mt-1 text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      任务统计总览
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-white/[0.05] text-slate-300' : 'bg-white text-slate-600'}`}>
                      总任务 {overviewStats.total}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                      已完成 {overviewStats.completed}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
                      待处理 {Math.max(overviewStats.total - overviewStats.completed, 0)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_1fr_1fr]">
                  <div className={`rounded-[24px] border p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.4)] ${
                    isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className={`text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          完成情况
                        </h4>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          结合任务总数与完成数，快速查看当前执行进展。
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${isDarkMode ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                        {completionPercent}%
                      </span>
                    </div>

                    <div className={`mt-4 h-2.5 overflow-hidden rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercent}%` }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-emerald-400"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { label: '总任务', value: overviewStats.total },
                        { label: '已完成', value: overviewStats.completed },
                        { label: '待处理', value: Math.max(overviewStats.total - overviewStats.completed, 0) }
                      ].map(item => (
                        <div key={item.label} className={`rounded-2xl border px-3 py-4 ${isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-100 bg-slate-50/80'}`}>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
                          <div className={`mt-2 text-2xl font-semibold leading-none ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {typeof projectProgress === 'number' && (
                      <div className={`mt-4 rounded-2xl border px-4 py-3 ${isDarkMode ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/70'}`}>
                        <div className="flex items-center justify-between text-sm">
                          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>项目整体进度</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{projectProgress}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`rounded-[24px] border p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.4)] ${
                    isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'
                  }`}>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className={`text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>优先级分布</h4>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>识别高优先级任务占比</p>
                      </div>
                      <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Priority</span>
                    </div>

                    <div className="space-y-4">
                      {overviewStats.priorityItems.length > 0 ? overviewStats.priorityItems.map(item => (
                        <div key={item.id}>
                          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{item.name}</span>
                            </div>
                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{item.count} / {item.percent}%</span>
                          </div>
                          <div className={`h-2.5 overflow-hidden rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                            <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                          </div>
                        </div>
                      )) : (
                        <div className={`rounded-2xl border border-dashed px-4 py-8 text-center text-sm ${isDarkMode ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                          暂无优先级统计数据
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`rounded-[24px] border p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.4)] ${
                    isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'
                  }`}>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className={`text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>状态分布</h4>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>查看任务当前状态结构</p>
                      </div>
                      <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Status</span>
                    </div>

                    <div className="space-y-4">
                      {overviewStats.statusItems.length > 0 ? overviewStats.statusItems.map(item => (
                        <div key={item.id}>
                          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{item.name}</span>
                            </div>
                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{item.count} / {item.percent}%</span>
                          </div>
                          <div className={`h-2.5 overflow-hidden rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                            <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                          </div>
                        </div>
                      )) : (
                        <div className={`rounded-2xl border border-dashed px-4 py-8 text-center text-sm ${isDarkMode ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                          暂无状态统计数据
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppleStyleTaskHeader;
