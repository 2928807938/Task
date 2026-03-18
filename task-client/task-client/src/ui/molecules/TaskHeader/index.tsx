'use client';

import React, {useEffect, useRef, useState} from 'react';
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
  /** 项目整体进度（百分比） */
  projectProgress?: number;
}

/**
 * 任务列表头部
 * 包含搜索、视图切换、统计等功能，设计符合 macOS/iOS 设计语言
 */
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
  const { theme, isDark } = useTheme();
  const isDarkMode = isDark;
  
  // 使用CSS变量作为后备，避免主题初始化时的闪烁
  const getSkeletonColor = () => theme?.colors?.neutral?.[200] || 'var(--theme-neutral-200)';
  
  // 搜索关键词
  const [searchQuery, setSearchQuery] = useState('');
  // 是否正在使用输入法
  const [isComposing, setIsComposing] = useState(false);
  // 如果没有传入当前视图，默认使用列表视图
  const actualView = currentView || 'list';
  // 是否显示统计卡片，默认不显示
  const [showStats, setShowStats] = useState(false);
  // 是否展开高级筛选
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 引用外部点击关闭筛选面板
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // 处理外部点击关闭筛选面板
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // 如果点击的是筛选按钮本身，不做处理，由按钮的onClick事件处理
      if (filterButtonRef.current && filterButtonRef.current.contains(e.target as Node)) {
        return;
      }
      // 如果点击的不是筛选面板内部，则关闭面板
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setShowAdvancedFilters(false);
      }
    };

    if (showAdvancedFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAdvancedFilters]);

  // 处理视图切换
  const handleViewChange = (view: 'list' | 'board' | 'calendar' | 'gantt') => {
    onViewChange && onViewChange(view);
  };

  // 处理搜索提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch && onSearch(searchQuery);
  };

  return (
    <div className={`overflow-hidden rounded-[28px] border shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] ${
      isDarkMode 
        ? 'bg-slate-900/80 border-white/10' 
        : 'bg-white/95 border-slate-200/80'
    }`}>
      {/* 顶部搜索栏和操作区 - 添加sticky定位，吸附在项目tab栏下面 */}
      <div className={`sticky z-30 px-4 sm:px-5 py-4 flex flex-col sm:flex-row gap-3 border-b backdrop-blur-md ${
        isDarkMode 
          ? 'bg-slate-900/90 border-white/10' 
          : 'bg-white/90 border-slate-200/80'
      }`} style={{
        top: 'var(--project-header-height, 80px)', // 吸附在项目tab栏下面，动态适配项目头部高度
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        backdropFilter: 'saturate(180%) blur(20px)',
      }}>
        {/* 搜索输入框 - 始终占据最大可用宽度 */}
        <div className="w-full sm:max-w-md">
          <div className="relative">
            <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} size={16} />
            <input
              type="text"
              className={`w-full rounded-full border px-10 py-3 text-sm transition-all focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-white/[0.04] border-white/10 text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:ring-blue-500/20' 
                  : 'bg-slate-50/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-300 focus:ring-blue-100'
              }`}
              placeholder="搜索任务..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // 只在清空搜索框时触发搜索，且不在输入法输入过程中
                if (e.target.value === '' && !isComposing) {
                  onSearch && onSearch('');
                } else if (!isComposing) {
                  // 非输入法状态下，每次输入都搜索（针对英文输入）
                  onSearch && onSearch(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isComposing) {
                  e.preventDefault();
                  onSearch && onSearch(searchQuery);
                }
              }}
              onCompositionStart={() => {
                // 输入法开始输入
                setIsComposing(true);
              }}
              onCompositionEnd={(e) => {
                // 输入法输入结束
                setIsComposing(false);
                // 触发一次搜索，使用当前完整的输入值
                onSearch && onSearch(searchQuery);
              }}
            />
            {searchQuery && (
              <button
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  isDarkMode 
                    ? 'text-slate-500 hover:text-slate-300' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                onClick={() => {
                  setSearchQuery('');
                  onSearch && onSearch('');
                }}
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 操作按钮区域 - 使用flex-wrap允许在必要时自动换行 */}
        <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:flex-1 sm:justify-end sm:gap-3">
          {/* 视图切换按钮组 */}
          <div className={`flex flex-nowrap overflow-x-auto rounded-full p-1 no-scrollbar ${
            isDarkMode ? 'bg-white/[0.05]' : 'bg-slate-100/90'
          }`}>
            <button
              onClick={() => handleViewChange('list')}
              className={`flex flex-row flex-nowrap items-center whitespace-nowrap rounded-full px-3 py-2 text-xs sm:text-sm transition-colors ${
                actualView === 'list' 
                  ? isDarkMode 
                    ? 'bg-blue-500/20 text-blue-100 shadow-sm shadow-blue-500/10' 
                    : 'bg-white text-slate-800 shadow-sm'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FiList className="mr-1 sm:mr-1.5 flex-shrink-0" size={14} />
              <span className="truncate">列表视图</span>
            </button>
            <button
              onClick={() => handleViewChange('board')}
              className={`flex flex-row flex-nowrap items-center whitespace-nowrap rounded-full px-3 py-2 text-xs sm:text-sm transition-colors ${
                actualView === 'board' 
                  ? isDarkMode 
                    ? 'bg-blue-500/20 text-blue-100 shadow-sm shadow-blue-500/10' 
                    : 'bg-white text-slate-800 shadow-sm'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FiGrid className="mr-1 sm:mr-1.5 flex-shrink-0" size={14} />
              <span className="truncate">看板视图</span>
            </button>
            <button
              onClick={() => handleViewChange('calendar')}
              className={`flex flex-row flex-nowrap items-center whitespace-nowrap rounded-full px-3 py-2 text-xs sm:text-sm transition-colors ${
                actualView === 'calendar' 
                  ? isDarkMode 
                    ? 'bg-blue-500/20 text-blue-100 shadow-sm shadow-blue-500/10' 
                    : 'bg-white text-slate-800 shadow-sm'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FiCalendar className="mr-1 sm:mr-1.5 flex-shrink-0" size={14} />
              <span className="truncate">日历视图</span>
            </button>
            <button
              onClick={() => handleViewChange('gantt')}
              className={`flex flex-row flex-nowrap items-center whitespace-nowrap rounded-full px-3 py-2 text-xs sm:text-sm transition-colors ${
                actualView === 'gantt' 
                  ? isDarkMode 
                    ? 'bg-blue-500/20 text-blue-100 shadow-sm shadow-blue-500/10' 
                    : 'bg-white text-slate-800 shadow-sm'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FiBarChart2 className="mr-1 sm:mr-1.5 flex-shrink-0" size={14} />
              <span className="truncate">甘特图</span>
            </button>
          </div>

          {/* 筛选和统计按钮 */}
          <div className="flex flex-nowrap gap-2">
            <div className="relative">
              <button
                ref={filterButtonRef}
                className={`inline-flex flex-row flex-nowrap items-center whitespace-nowrap rounded-full border px-3 py-2 text-xs sm:text-sm transition-colors cursor-not-allowed opacity-80 ${
                  isDarkMode 
                    ? 'bg-white/[0.04] text-slate-400 border-white/10' 
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
                title="高级筛选功能，敬请期待"
              >
                <FiFilter size={14} className="mr-1 sm:mr-1.5 flex-shrink-0" />
                <span className="truncate">筛选</span>
              </button>
              {/* 右上角的颜色标记，添加闪烁效果 */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 animate-pulse ${
                isDarkMode ? 'border-gray-800' : 'border-white'
              }`}>
                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" style={{ animationDuration: '2s' }}></span>
              </div>
            </div>

            <button
              onClick={() => setShowStats(!showStats)}
              className={`inline-flex flex-row flex-nowrap items-center whitespace-nowrap rounded-full px-3 py-2 text-xs sm:text-sm transition-colors ${
                showStats 
                  ? isDarkMode
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-blue-50 text-blue-600'
                  : isDarkMode
                    ? 'bg-white/[0.04] text-slate-300 border border-white/10 hover:bg-white/[0.08]'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FiPieChart size={14} className="mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="truncate">统计</span>
              <span className="flex-shrink-0 ml-1">
                {showStats ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </span>
            </button>
          </div>

          {/* 添加任务按钮 */}
          <button
            onClick={onAddTask}
            className="inline-flex flex-row flex-nowrap items-center whitespace-nowrap rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-[0_18px_32px_-20px_rgba(37,99,235,0.9)] transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:px-4 sm:py-2 sm:text-sm"
          >
            <FiPlusCircle className="mr-1 sm:mr-1.5 flex-shrink-0" size={14} />
            <span className="truncate">添加任务</span>
          </button>
        </div>
      </div>

      {/* 高级筛选面板 */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            ref={filterPanelRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-gray-200"
          >
            <div className="px-5 py-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-3">高级筛选</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">状态</label>
                  <select className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm">
                    <option>所有状态</option>
                    <option>未开始</option>
                    <option>进行中</option>
                    <option>已完成</option>
                    <option>已暂停</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">优先级</label>
                  <select className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm">
                    <option>所有优先级</option>
                    <option>高</option>
                    <option>中</option>
                    <option>低</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">负责人</label>
                  <select className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm">
                    <option>所有成员</option>
                    <option>未分配</option>
                    <option>张三</option>
                    <option>李四</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 mr-2">
                  重置
                </button>
                <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  应用筛选
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 统计卡片部分 */}
      <div className="border-b border-gray-100">

        {/* 统计卡片内容 */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 py-4 bg-white"
            >
              {/* 使用统一的骨架屏组件 */}
              {isLoading ? (
                <TaskStatisticsSkeleton />
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 任务完成进度卡片 -  */}
                <motion.div
                  whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative bg-white/[0.85] dark:bg-gray-900/[0.85] backdrop-blur-lg rounded-2xl p-6 border border-[rgba(255,255,255,0.1)] dark:border-[rgba(50,50,50,0.2)] shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.2)] overflow-hidden"
                >
                  {/* 玻璃光效 - 通过拉伸行高和每行的背景透明度实现 */}
                  <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] dark:via-[rgba(255,255,255,0.05)] to-transparent"></div>
                    <div className="h-[1.5px] w-1/3 mt-10 ml-4 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.03)] dark:via-[rgba(255,255,255,0.01)] to-transparent rounded-full"></div>
                    <div className="h-[0.7px] w-1/5 mt-8 ml-auto mr-6 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.03)] dark:via-[rgba(255,255,255,0.01)] to-transparent rounded-full"></div>
                  </div>

                  {/* 使用计算得出的总任务数和完成数 */}
                  {(() => {
                    // 计算完成率，优先使用taskDistribution数据，不可用时使用组件属性
                    let completed = taskDistribution?.completed ?? completedTasks;
                    let total = taskDistribution?.total ?? totalTasks;
                    let completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                      <>
                        {/* 标题区 - 更精确的对齐和间距 */}
                        <div className="flex items-center justify-between mb-4 font-['SF_Pro_Display','-apple-system,BlinkMacSystemFont']">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-blue-50 dark:bg-blue-900/30">
                              <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h3 className="text-sm font-semibold tracking-tight text-gray-800 dark:text-gray-200">任务完成度</h3>
                          </div>
                          <div className="flex items-center">
                            <motion.span
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className="text-xl font-medium text-blue-500 dark:text-blue-400 font-['SF_Pro_Display','-apple-system']"
                            >
                              {isLoading ? '–' : `${completionPercent}%`}
                            </motion.span>
                          </div>
                        </div>

                        {/* 进度条 - 矫形进度指示器 */}
                        <div className="my-1">
                          {isLoading ? (
                            <div className="h-[6px] bg-gray-100 dark:bg-gray-800/40 rounded-full animate-pulse"></div>
                          ) : (
                            <div className="h-[6px] bg-gray-100 dark:bg-gray-800/40 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completionPercent}%` }}
                                transition={{ type: 'spring', stiffness: 100, damping: 30, delay: 0.1 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-500 rounded-full relative"
                              >
                                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%)]"></div>
                              </motion.div>
                            </div>
                          )}
                        </div>

                        {/* 数据统计 - 更精确的对齐和字体样式 */}
                        <div className="flex justify-between items-center mt-3 font-['SF_Pro_Text','-apple-system']">
                          {isLoading ? (
                            <>
                              <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800/40 rounded animate-pulse"></div>
                              <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800/40 rounded animate-pulse"></div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">完成:</span>
                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{completed}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">总计:</span>
                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{total}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}

                  {/* 项目整体进度 - 更精致的分隔线和样式 */}
                  {(typeof projectProgress === 'number') && (
                    <div className="mt-5 pt-3 border-t border-[rgba(200,200,200,0.2)] dark:border-[rgba(70,70,70,0.4)]">
                      <div className="flex items-center justify-between mb-3 font-['SF_Pro_Display','-apple-system']">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-green-50 dark:bg-green-900/20">
                            <svg className="w-3 h-3 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h4 className="text-xs font-semibold tracking-tight text-gray-700 dark:text-gray-300">项目整体进度</h4>
                        </div>
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="text-sm font-medium text-green-500 dark:text-green-400 font-['SF_Pro_Display','-apple-system']"
                        >
                          {projectProgress}%
                        </motion.span>
                      </div>

                      <div className="mt-1">
                        <div className="h-[5px] bg-gray-100 dark:bg-gray-800/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${projectProgress}%` }}
                            transition={{ type: 'spring', stiffness: 100, damping: 30, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 dark:from-green-400 dark:to-emerald-500 rounded-full relative"
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%)]"></div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* 优先级分布卡片*/}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200/20 dark:border-gray-800/20 shadow-sm hover:shadow-md transition-all duration-300">
                  {isLoading || !taskDistribution ? (
                    <div 
                      className="h-5 w-20 rounded animate-pulse mb-3"
                      style={{ backgroundColor: getSkeletonColor() }}
                    ></div>
                  ) : (
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">优先级分布</h3>
                  )}

                  {/* 优先级条目 - 动态渲染 */}
                  {isLoading || !taskDistribution ? (
                    <>
                      {/* 骨架屏 - 三个优先级项 */}
                      {[1, 2, 3].map((_, index) => (
                        <div key={`priority-skeleton-${index}`} className={`mb-${index < 2 ? '3' : '0'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div 
                                className="w-2.5 h-2.5 rounded-full mr-2 animate-pulse"
                                style={{ backgroundColor: getSkeletonColor() }}
                              ></div>
                              <div 
                                className="h-4 w-16 rounded animate-pulse"
                                style={{ backgroundColor: getSkeletonColor() }}
                              ></div>
                            </div>
                            <div 
                              className="h-4 w-8 rounded animate-pulse"
                              style={{ backgroundColor: getSkeletonColor() }}
                            ></div>
                          </div>
                          <div 
                            className="h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: getSkeletonColor() }}
                          ></div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {/* 动态渲染所有优先级项 */}
                      {taskDistribution.priorityDistribution.items.map((item, index) => {
                        // 根据优先级级别选择渐变颜色
                        let gradientColors;
                        switch (item.level) {
                          case 1: // 高优先级
                            gradientColors = 'from-red-400 to-red-500';
                            break;
                          case 2: // 中优先级
                            gradientColors = 'from-amber-400 to-amber-500';
                            break;
                          case 3: // 低优先级
                            gradientColors = 'from-green-400 to-green-500';
                            break;
                          default: // 其他优先级
                            gradientColors = 'from-blue-400 to-blue-500';
                        }

                        return (
                          <div key={`priority-${item.id}`} className={`${index < taskDistribution.priorityDistribution.items.length - 1 ? 'mb-3' : ''}`}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <div className="w-2.5 h-2.5 rounded-full shadow-sm mr-2" style={{backgroundColor: item.color}}></div>
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.name}</div>
                              </div>
                              <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                {item.percent}%
                              </div>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800/40 rounded-full overflow-hidden">
                              <div className="h-full rounded-full relative"
                                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* 状态分布卡片*/}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200/20 dark:border-gray-800/20 shadow-sm hover:shadow-md transition-all duration-300">
                  {isLoading || !taskDistribution ? (
                    <div 
                      className="h-5 w-20 rounded animate-pulse mb-3"
                      style={{ backgroundColor: getSkeletonColor() }}
                    ></div>
                  ) : (
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">状态分布</h3>
                  )}

                  {/* 状态条目 - 动态渲染 */}
                  {isLoading || !taskDistribution ? (
                    <>
                      {/* 骨架屏 - 三个状态项 */}
                      {[1, 2, 3].map((_, index) => (
                        <div key={`status-skeleton-${index}`} className={`mb-${index < 2 ? '3' : '0'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div 
                                className="w-2.5 h-2.5 rounded-full mr-2 animate-pulse"
                                style={{ backgroundColor: getSkeletonColor() }}
                              ></div>
                              <div 
                                className="h-4 w-16 rounded animate-pulse"
                                style={{ backgroundColor: getSkeletonColor() }}
                              ></div>
                            </div>
                            <div 
                              className="h-4 w-8 rounded animate-pulse"
                              style={{ backgroundColor: getSkeletonColor() }}
                            ></div>
                          </div>
                          <div 
                            className="h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: getSkeletonColor() }}
                          ></div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {/* 动态渲染所有状态项 */}
                      {taskDistribution.statusDistribution.items.map((item, index) => {
                        // 根据状态类型选择渐变颜色
                        let gradientColors;
                        if (item.terminal) {
                          // 终止状态（已完成）
                          gradientColors = 'from-green-400 to-green-500';
                        } else if (item.name.includes('进行') || item.name.includes('处理中')) {
                          // 进行中状态
                          gradientColors = 'from-blue-400 to-blue-500';
                        } else if (item.name.includes('待') || item.name.includes('未开始')) {
                          // 待处理状态
                          gradientColors = 'from-gray-400 to-gray-500';
                        } else {
                          // 其他状态
                          gradientColors = 'from-purple-400 to-purple-500';
                        }

                        return (
                          <div key={`status-${item.id}`} className={`${index < taskDistribution.statusDistribution.items.length - 1 ? 'mb-3' : ''}`}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <div className="w-2.5 h-2.5 rounded-full shadow-sm mr-2" style={{backgroundColor: item.color}}></div>
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.name}</div>
                              </div>
                              <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                {item.percent}%
                              </div>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800/40 rounded-full overflow-hidden">
                              <div className="h-full rounded-full relative"
                                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppleStyleTaskHeader;
