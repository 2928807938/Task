'use client';

import React, {useState} from 'react';
import {
    FiBarChart2,
    FiCalendar,
    FiDownload,
    FiFilter,
    FiGrid,
    FiList,
    FiPlus,
    FiSave,
    FiSliders,
    FiUpload
} from 'react-icons/fi';
import {AnimatePresence, motion} from 'framer-motion';

interface TaskListToolbarProps {
  onViewChange?: (view: 'list' | 'board' | 'calendar' | 'gantt') => void;
  onAddTask?: () => void;
  totalTasks?: number;
  completedTasks?: number;
  onFilter?: (filters: any) => void;
  onExport?: () => void;
  onImport?: () => void;
  onSaveView?: (viewName: string) => void;
}

/**
 * 任务列表工具栏 -
 * 提供视图切换、搜索、筛选、导入导出等功能
 */
const TaskListToolbar: React.FC<TaskListToolbarProps> = ({
  onViewChange,
  onAddTask,
  totalTasks = 0,
  completedTasks = 0,
  onFilter,
  onExport,
  onImport,
  onSaveView
}) => {
  // 当前视图
  const [currentView, setCurrentView] = useState<'list' | 'board' | 'calendar' | 'gantt'>('list');
  // 显示高级筛选
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // 显示保存视图对话框
  const [showSaveView, setShowSaveView] = useState(false);
  // 保存视图名称
  const [savedViewName, setSavedViewName] = useState('');

  // 处理视图切换
  const handleViewChange = (view: 'list' | 'board' | 'calendar' | 'gantt') => {
    setCurrentView(view);
    onViewChange && onViewChange(view);
  };



  // 计算完成度百分比
  const completionPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="mb-5 space-y-3">
      {/* 上方操作栏 - 视图切换、添加 */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {/* 移动设备上的收起/展开筛选器按钮 */}
        <button
          className="md:hidden p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <FiFilter size={16} />
        </button>

        {/* 视图切换分段控件*/}
        <div className="hidden md:flex items-center p-0.5 bg-gray-100 dark:bg-gray-800/70 rounded-lg">
          <button
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${
              currentView === 'list'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => handleViewChange('list')}
          >
            <FiList className="mr-1.5" size={14} />
            列表
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${
              currentView === 'board'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => handleViewChange('board')}
          >
            <FiGrid className="mr-1.5" size={14} />
            看板
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${
              currentView === 'calendar'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => handleViewChange('calendar')}
          >
            <FiCalendar className="mr-1.5" size={14} />
            日历
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${
              currentView === 'gantt'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => handleViewChange('gantt')}
          >
            <FiBarChart2 className="mr-1.5" size={14} />
            甘特图
          </button>
        </div>

        {/* 添加任务按钮*/}
        <button
          onClick={onAddTask}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center transition-all shadow-sm"
        >
          <FiPlus className="mr-1.5" size={16} />
          添加任务
        </button>
      </div>

      {/* 中间部分 - 任务统计和过滤器 */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {/* 任务统计卡片*/}
        <div className="flex items-center p-3 bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
          <div className="mr-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">任务完成度</div>
            <div className="flex items-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white mr-2">
                {completionPercentage}%
              </div>
              <div className="w-32 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="border-l border-gray-100 dark:border-gray-700 pl-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">总任务</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{totalTasks}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">已完成</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{completedTasks}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 保存和导出按钮组 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSaveView(true)}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 flex items-center"
          >
            <FiSave size={16} />
            <span className="ml-1.5 text-sm hidden sm:inline">保存视图</span>
          </button>
          <button
            onClick={onExport}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 flex items-center"
          >
            <FiDownload size={16} />
            <span className="ml-1.5 text-sm hidden sm:inline">导出</span>
          </button>
          <button
            onClick={onImport}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 flex items-center"
          >
            <FiUpload size={16} />
            <span className="ml-1.5 text-sm hidden sm:inline">导入</span>
          </button>
        </div>
      </div>

      {/* 高级筛选区域 */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-xl mt-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <FiSliders className="mr-2" size={14} /> 高级筛选
                </h4>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowAdvancedFilters(false)}
                >
                  <span className="text-xs">收起</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 状态筛选 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    状态
                  </label>
                  <select className="w-full bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
                    <option value="">全部</option>
                    <option value="未开始">未开始</option>
                    <option value="进行中">进行中</option>
                    <option value="已完成">已完成</option>
                    <option value="已暂停">已暂停</option>
                  </select>
                </div>

                {/* 优先级筛选 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    优先级
                  </label>
                  <select className="w-full bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
                    <option value="">全部</option>
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                  </select>
                </div>

                {/* 负责人筛选 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    负责人
                  </label>
                  <select className="w-full bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
                    <option value="">全部</option>
                    <option value="me">我的任务</option>
                    <option value="unassigned">未分配</option>
                  </select>
                </div>

                {/* 日期筛选 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    截止日期
                  </label>
                  <select className="w-full bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
                    <option value="">全部</option>
                    <option value="today">今天</option>
                    <option value="tomorrow">明天</option>
                    <option value="this_week">本周</option>
                    <option value="this_month">本月</option>
                    <option value="overdue">已逾期</option>
                    <option value="no_date">无日期</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm mr-2"
                  onClick={() => {
                    // 重置筛选器逻辑
                  }}
                >
                  重置
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                  onClick={() => {
                    // 应用筛选器逻辑
                    setShowAdvancedFilters(false);
                  }}
                >
                  应用筛选
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 保存视图对话框 */}
      <AnimatePresence>
        {showSaveView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowSaveView(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">保存当前视图</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                保存当前的筛选条件和视图设置，方便下次快速访问。
              </p>
              <div className="mb-4">
                <label htmlFor="viewName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  视图名称
                </label>
                <input
                  type="text"
                  id="viewName"
                  value={savedViewName}
                  onChange={(e) => setSavedViewName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  placeholder="例如：高优先级未完成任务"
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm mr-2"
                  onClick={() => setShowSaveView(false)}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                  onClick={() => {
                    if (savedViewName.trim()) {
                      onSaveView && onSaveView(savedViewName);
                      setShowSaveView(false);
                      setSavedViewName('');
                    }
                  }}
                  disabled={!savedViewName.trim()}
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskListToolbar;
