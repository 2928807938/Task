'use client';

import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiChevronDown, FiChevronRight, FiList, FiPlus, FiSearch} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
import { useTheme } from '@/ui/theme';

interface TaskHierarchyListProps {
  tasks: ProjectTask[];
  onTaskClick?: (task: ProjectTask) => void;
  onAddTask?: () => void;
}

export function TaskHierarchyList({ tasks, onTaskClick, onAddTask }: TaskHierarchyListProps) {
  // 使用主题系统
  const { theme, isDark } = useTheme();
  
  const [searchText, setSearchText] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');

  // 过滤出主任务（没有父任务的任务）
  const mainTasks = tasks.filter(task => !task.parentId);

  // 根据筛选条件过滤任务
  const filteredTasks = mainTasks.filter(task => {
    // 搜索条件过滤
    const matchesSearch = searchText === '' ||
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchText.toLowerCase()));

    // 状态过滤
    const matchesStatus =
      filterStatus === 'all' ||
      filterStatus === task.status;

    return matchesSearch && matchesStatus;
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
        'HIGH': 3,
        'MEDIUM': 2,
        'LOW': 1
      };
      return priorityMap[b.priority] - priorityMap[a.priority];
    }
    return 0;
  });

  // 切换任务的展开/折叠状态
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // 获取任务状态显示信息
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return theme.colors.success[500];
      case 'IN_PROGRESS':
        return theme.colors.primary[500];
      case 'OVERDUE':
        return theme.colors.error[500];
      case 'WAITING':
        return theme.colors.warning[500];
      default:
        return theme.colors.neutral[500];
    }
  };

  // 获取任务状态文本
  const getStatusText = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return '已完成';
      case 'IN_PROGRESS':
        return '进行中';
      case 'OVERDUE':
        return '已逾期';
      case 'WAITING':
        return '等待中';
      default:
        return '未知';
    }
  };

  // 获取任务优先级显示信息
  const getPriorityInfo = (priority: string) => {
    switch(priority) {
      case 'HIGH':
        return { 
          text: '高', 
          color: isDark ? 'text-red-300 bg-red-900/20' : 'text-red-700 bg-red-100'
        };
      case 'MEDIUM':
        return { 
          text: '中', 
          color: isDark ? 'text-yellow-300 bg-yellow-900/20' : 'text-yellow-700 bg-yellow-100'
        };
      case 'LOW':
        return { 
          text: '低', 
          color: isDark ? 'text-green-300 bg-green-900/20' : 'text-green-700 bg-green-100'
        };
      default:
        return { 
          text: '中', 
          color: isDark ? 'text-blue-300 bg-blue-900/20' : 'text-blue-700 bg-blue-100'
        };
    }
  };

  // 渲染子任务
  const renderSubTasks = (parentTask: ProjectTask) => {
    if (!parentTask.subTasks || parentTask.subTasks.length === 0) {
      return null;
    }

    // 添加子任务标题
    const subTasksCount = parentTask.subTasks.length;
    const completedCount = parentTask.subTasks.filter(task => task.status === 'COMPLETED').length;

    return (
      <AnimatePresence>
        {expandedTasks[parentTask.id] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`pl-8 mt-3 mb-2 space-y-3 relative border-l-2 ${isDark ? 'border-blue-500/20' : 'border-blue-200'}`}
          >
            {/* 添加子任务标题和进度 */}
            <div className="mb-2 pl-2 flex items-center justify-between">
              <div className={`text-xs flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-medium">子任务</span>
                <span className="ml-1">{completedCount}/{subTasksCount} 完成</span>
              </div>
              <div className={`w-24 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-full rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-500'}`}
                  style={{ width: `${subTasksCount > 0 ? (completedCount / subTasksCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* 添加左侧连接线的装饰元素 */}
            <div className="absolute -left-1 top-0 bottom-0 w-2">
              <div className={`absolute left-0 top-0 w-2 h-2 rounded-full ${isDark ? 'bg-blue-500/40' : 'bg-blue-300'}`}></div>
              <div className={`absolute left-0 bottom-0 w-2 h-2 rounded-full ${isDark ? 'bg-blue-500/40' : 'bg-blue-300'}`}></div>
            </div>
            {parentTask.subTasks.map(subTask => (
              <div key={subTask.id}>
                <TaskRow
                  task={subTask}
                  isExpanded={expandedTasks[subTask.id]}
                  onToggleExpand={toggleTaskExpanded}
                  onTaskClick={onTaskClick}
                />
                {subTask.subTasks && subTask.subTasks.length > 0 && expandedTasks[subTask.id] && renderSubTasks(subTask)}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // 任务行组件
  const TaskRow = ({
    task,
    isExpanded,
    onToggleExpand,
    onTaskClick
  }: {
    task: ProjectTask;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    onTaskClick?: (task: ProjectTask) => void;
  }) => {
    const hasSubTasks = task.subTasks && task.subTasks.length > 0;
    const statusColor = getStatusColor(task.status);
    const priorityInfo = getPriorityInfo(task.priority);

    // 处理点击任务
    const handleTaskClick = () => {
      if (onTaskClick) {
        onTaskClick(task);
      }
    };

    // 处理展开/折叠
    const handleToggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(task.id);
    };

    return (
      <div
        className={`cursor-pointer rounded-lg p-4 mb-3 transition-all hover:shadow-md border ${
          isDark 
            ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800/80' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
        onClick={handleTaskClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {/* 展开/折叠按钮 */}
              {hasSubTasks && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex items-center justify-center w-5 h-5 rounded-full mr-2 transition-colors ${
                    isDark 
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                  onClick={handleToggleExpand}
                  aria-label={isExpanded ? '折叠子任务' : '展开子任务'}
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiChevronRight size={12} />
                  </motion.div>
                </motion.button>
              )}

              {/* 如果有子任务，显示子任务数量标记 */}
              {hasSubTasks && (
                <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                  isDark 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {task.subTasks?.length || 0}
                </div>
              )}

              {/* 任务标题 */}
              <h3 className={`font-medium text-sm flex-1 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                {task.title}
              </h3>

              {/* 优先级标签 */}
              <div className={`px-2 py-0.5 rounded text-xs font-medium ${priorityInfo.color}`}>
                {priorityInfo.text}
              </div>
            </div>

            {/* 任务描述 */}
            {task.description && (
              <p className={`text-sm mb-2 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className={`flex items-center justify-between pt-3 mt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* 负责人 */}
          <div className="flex items-center gap-2">
            {task.assignee && (
              <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>负责人: {task.assignee}</span>
              </div>
            )}

            {/* 子任务数量 */}
            {hasSubTasks && (
              <div className={`flex items-center text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>子任务: {task.subTasks?.length ?? 0}</span>
              </div>
            )}
          </div>

          {/* 进度指示器 */}
          <div className="flex items-center">
            <span className={`text-xs mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {task.progress}%
            </span>
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColor }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // 空状态展示
  if (tasks.length === 0) {
    return (
      <div className="mt-4">
        <div className={`col-span-full rounded-lg p-8 text-center shadow-sm ${
          isDark ? 'bg-gray-800/60' : 'bg-white'
        }`}>
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FiList className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-100' : 'text-gray-700'}`}>
              暂无任务
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              当前项目还没有任何任务，点击下方按钮创建第一个任务
            </p>
            {onAddTask && (
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                onClick={onAddTask}
              >
                <FiPlus className="w-4 h-4" />
                添加新任务
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* 搜索和筛选栏 */}
      <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-gray-800/60' : 'bg-white'}`}>
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="搜索任务..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* 状态筛选 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-gray-100' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">全部状态</option>
            <option value="IN_PROGRESS">进行中</option>
            <option value="COMPLETED">已完成</option>
            <option value="OVERDUE">已逾期</option>
            <option value="WAITING">等待中</option>
          </select>

          {/* 排序方式 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-gray-100' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="created_at">创建时间</option>
            <option value="due_date">截止日期</option>
            <option value="priority">优先级</option>
          </select>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-0">
        {sortedTasks.map((task) => (
          <div key={task.id}>
            <TaskRow
              task={task}
              isExpanded={expandedTasks[task.id]}
              onToggleExpand={toggleTaskExpanded}
              onTaskClick={onTaskClick}
            />
            {/* 渲染子任务 */}
            {renderSubTasks(task)}
          </div>
        ))}
      </div>
    </div>
  );
}
