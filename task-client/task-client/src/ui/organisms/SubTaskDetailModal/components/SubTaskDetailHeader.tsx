'use client';

import React from 'react';
import {motion} from 'framer-motion';
import {FiCalendar, FiClock, FiFlag, FiUser} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
import {useTheme} from '@/ui/theme';
import {Avatar} from '@/ui/atoms/Avatar';
import TaskStatusBadge from '@/ui/atoms/TaskStatusBadge';
import TaskPriorityBadge from '@/ui/atoms/TaskPriorityBadge';
import TaskDueDateBadge from '@/ui/atoms/DueDateBadge';

interface SubTaskDetailHeaderProps {
  task: ProjectTask;
  isSubTask: boolean;
  isSubTaskFocused?: boolean;
}

/**
 * 子任务详情头部组件 - 苹果风格设计
 * 
 * 特点：
 * - 清晰的信息层级
 * - 优雅的状态展示
 * - 响应式布局
 */
const SubTaskDetailHeader: React.FC<SubTaskDetailHeaderProps> = ({
  task,
  isSubTask,
  isSubTaskFocused = false
}) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* 任务类型标识 */}
      {isSubTaskFocused && isSubTask && (
        <div className="flex items-center space-x-2">
          <div className={`
            inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium shadow-sm
            ${isDark 
              ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-purple-300 border border-purple-600/30' 
              : 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200'
            }
          `}>
            <span className="mr-2 text-lg">🔗</span>
            子任务
          </div>
        </div>
      )}

      {/* 任务标题 */}
      <div>
        <h1 className={`
          text-2xl font-bold leading-tight
          ${isDark ? 'text-white' : 'text-gray-900'}
        `}>
          {task.title}
        </h1>
        
      </div>

      {/* 任务状态和优先级 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <TaskStatusBadge 
            status={task.status} 
            statusColor={task.statusColor}
          />
          
          <TaskPriorityBadge 
            priority={task.priority}
            priorityColor={task.priorityColor}
          />
          
          {task.dueDate && (
            <TaskDueDateBadge dueDate={task.dueDate} />
          )}
        </div>

        {/* 时间戳信息 - 简洁版 */}
        <div className={`
          text-xs hidden sm:flex items-center space-x-4
          ${isDark ? 'text-gray-500' : 'text-gray-400'}
        `}>
          <span>
            创建 {new Date(task.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          </span>
          {task.completedAt && (
            <span>
              完成 {new Date(task.completedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SubTaskDetailHeader;