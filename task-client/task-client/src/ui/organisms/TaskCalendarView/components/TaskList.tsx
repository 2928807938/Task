'use client';

import React, {useState} from 'react';
import {format} from 'date-fns';
import {zhCN} from 'date-fns/locale';
import {AnimatePresence, motion} from 'framer-motion';
import {ProjectTask} from '@/types/api-types';

interface TaskItemData {
  task: ProjectTask;
  status: 'start' | 'middle' | 'end' | 'single';
}

interface TaskListProps {
  tasks: TaskItemData[];
  selectedDate: Date;
  onClose: () => void;
  onTaskClick?: (task: ProjectTask) => void;
}

type TaskStatus = 'start' | 'middle' | 'end' | 'single' | 'all';

const TaskList: React.FC<TaskListProps> = ({
  selectedDate,
  tasks,
  onClose,
  onTaskClick
}) => {
  // 状态变量
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [visibleStatuses, setVisibleStatuses] = useState<TaskStatus[]>(['all']);

  // 切换状态显示/隐藏
  const toggleStatus = (status: TaskStatus) => {
    setVisibleStatuses(prev => {
      // 如果当前是'all'状态，切换到只显示选中的状态
      if (prev.includes('all')) {
        return [status];
      }

      // 如果状态已经在列表中，则移除它
      if (prev.includes(status)) {
        const newStatuses = prev.filter(s => s !== status);
        // 如果移除后没有任何状态，则显示全部
        return newStatuses.length === 0 ? ['all'] : newStatuses;
      }

      // 否则添加状态到列表中
      return [...prev, status];
    });
  };

  // 过滤任务
  const filteredTasks = tasks.filter(taskItem => {
    if (visibleStatuses.includes('all')) return true;
    return visibleStatuses.includes(taskItem.status);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">
          {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 active:scale-95 transition-transform"
          aria-label="关闭"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {tasks.length} 个任务
        </div>
        <button
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center"
          onClick={() => setShowLegend(prev => !prev)}
        >
          <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          图标说明
        </button>
      </div>

      {/* 图标说明区域 */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-xs overflow-hidden"
          >
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">状态图标说明</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 9 9 13 19 3"></polyline>
                </svg>
                <span className="text-gray-600 dark:text-gray-400">开始日期</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                <span className="text-gray-600 dark:text-gray-400">进行中</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span className="text-gray-600 dark:text-gray-400">结束日期</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 状态筛选 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setVisibleStatuses(prev =>
            prev.includes('all') ? ['start', 'middle', 'end', 'single'] : ['all']
          )}
          className={`text-xs px-2 py-1 rounded-full transition-colors ${
            visibleStatuses.includes('all') 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => toggleStatus('start')}
          className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center ${
            visibleStatuses.includes('start') && !visibleStatuses.includes('all')
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5 9 9 13 19 3"></polyline>
          </svg>
          开始
        </button>
        <button
          onClick={() => toggleStatus('middle')}
          className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center ${
            visibleStatuses.includes('middle') && !visibleStatuses.includes('all')
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
          进行中
        </button>
        <button
          onClick={() => toggleStatus('end')}
          className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center ${
            visibleStatuses.includes('end') && !visibleStatuses.includes('all')
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          结束
        </button>
        <button
          onClick={() => toggleStatus('single')}
          className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center ${
            visibleStatuses.includes('single') && !visibleStatuses.includes('all')
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          单日任务
        </button>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(taskItem => {
              const { task, status } = taskItem;
              const isPriorityHigh = task.priority?.toUpperCase() === 'HIGH';

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
                  className={`p-3 mb-2 rounded-xl transition-all cursor-pointer
                    ${isPriorityHigh 
                      ? 'bg-gradient-to-r from-red-50/90 to-red-50/70 dark:from-red-900/20 dark:to-red-900/10' 
                      : 'bg-gradient-to-r from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-800/85'}
                    backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50
                  `}
                  style={{
                    boxShadow: isPriorityHigh
                      ? '0 4px 12px rgba(239, 68, 68, 0.08)'
                      : '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  onClick={() => onTaskClick && onTaskClick(task)}
                  whileHover={{ y: -2, boxShadow: isPriorityHigh
                    ? '0 6px 16px rgba(239, 68, 68, 0.12)'
                    : '0 4px 12px rgba(0, 0, 0, 0.06)' }}
                  whileTap={{ y: 0, scale: 0.98 }}
                >
                  <div className="flex items-center">
                    {/* 任务状态 */}
                    <span
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: task.statusColor || getStatusColorHex(task.status) }}
                    />

                    {/* 在在日期状态图标 */}
                    {status !== 'single' && (
                      <span className="flex-shrink-0 w-5 h-5 mr-2 flex items-center justify-center">
                        {status === 'start' ? (
                          <svg className="w-4 h-4 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="5 9 9 13 19 3"></polyline>
                          </svg>
                        ) : status === 'end' ? (
                          <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-yellow-500 dark:text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                          </svg>
                        )}
                      </span>
                    )}

                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{task.title}</h4>

                    {/* 高优先级标记 */}
                    {isPriorityHigh && (
                      <span className="ml-1.5 text-red-500 dark:text-red-400">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,2L1,21H23M12,6L19.53,19H4.47" />
                        </svg>
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-5 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex items-center mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {/* 时间信息 */}
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                      </svg>
                      {task.startTime && <span className="mr-1">{format(new Date(task.startTime), 'MM/dd')} 开始</span>}
                      {task.startTime && task.dueDate && <span className="mx-1">-</span>}
                      {task.dueDate && <span>{format(new Date(task.dueDate), 'MM/dd')} 截止</span>}
                    </div>

                    {/* 负责人信息 */}
                    {task.assignee && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                        </svg>
                        {task.assignee}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl backdrop-blur-sm">
              <svg className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
              </svg>
              <p>该日期没有任务</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// 工具函数：获取状态对应的颜色十六进制值
const getStatusColorHex = (status?: string): string => {
  if (!status) return '#8E8E93';

  const s = status.toLowerCase();
  switch (s) {
    case 'not_started':
    case 'waiting':
      return '#9C27B0'; // 紫色
    case 'in_progress':
      return '#00C853'; // 绿色
    case 'paused':
      return '#FFD600'; // 黄色
    case 'completed':
      return '#03A9F4'; // 蓝色
    case 'overdue':
    case 'cancelled':
      return '#FF3D00'; // 橙红色
    default:
      return '#8E8E93'; // 灰色
  }
};

export default TaskList;
