'use client';

import React from 'react';
import {motion} from 'framer-motion';
import {FiArrowUpRight, FiExternalLink} from 'react-icons/fi';
import {useTheme} from '@/ui/theme';
import useTaskHook from '@/hooks/use-task-hook';
import TaskStatusBadge from '@/ui/atoms/TaskStatusBadge';
import {Avatar} from '@/ui/atoms/Avatar';

interface ParentTaskInfoProps {
  parentTaskId: string;
  projectId?: string;
  onParentTaskClick?: (taskId: string) => void;
}

/**
 * 父任务信息组件 - 苹果风格设计
 * 
 * 显示当前子任务所属的父任务信息
 * 提供导航到父任务的功能
 */
const ParentTaskInfo: React.FC<ParentTaskInfoProps> = ({
  parentTaskId,
  projectId,
  onParentTaskClick
}) => {
  const { isDark } = useTheme();
  const { useGetTaskWithSubtasks } = useTaskHook();

  // 获取父任务信息
  const {
    data: parentTaskData,
    isLoading,
    error
  } = useGetTaskWithSubtasks(parentTaskId, {
    enabled: !!parentTaskId,
    staleTime: 60000 // 父任务信息缓存1分钟
  });

  const parentTask = parentTaskData?.mainTask;

  // 处理点击父任务
  const handleParentTaskClick = () => {
    if (onParentTaskClick && parentTask) {
      onParentTaskClick(parentTask.id);
    }
  };

  if (isLoading) {
    return (
      <div className={`
        p-4 rounded-2xl animate-pulse
        ${isDark 
          ? 'bg-blue-950/20 border border-blue-800/30' 
          : 'bg-blue-50/50 border border-blue-200/50'
        }
      `}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !parentTask) {
    return (
      <div className={`
        p-4 rounded-2xl
        ${isDark 
          ? 'bg-red-950/20 border border-red-800/30' 
          : 'bg-red-50/50 border border-red-200/50'
        }
      `}>
        <p className="text-sm text-red-600 dark:text-red-400">
          无法加载父任务信息
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        p-4 rounded-2xl border-2 border-dashed transition-all duration-200 shadow-sm
        ${isDark 
          ? 'bg-gradient-to-br from-indigo-950/30 to-blue-950/20 border-indigo-700/50 hover:from-indigo-950/40 hover:to-blue-950/30 hover:border-indigo-600/70' 
          : 'bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border-indigo-300/60 hover:from-indigo-50/90 hover:to-blue-50/80 hover:border-indigo-400/80'
        }
        ${onParentTaskClick ? 'cursor-pointer' : ''}
      `}
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={onParentTaskClick ? handleParentTaskClick : undefined}
    >
      {/* 标签 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`
            text-xs font-medium px-3 py-1.5 rounded-full shadow-sm
            ${isDark 
              ? 'bg-gradient-to-r from-indigo-600/30 to-blue-600/30 text-indigo-300 border border-indigo-500/30' 
              : 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border border-indigo-200'
            }
          `}>
            🔗 父任务
          </span>
          
          {onParentTaskClick && (
            <FiExternalLink className={`
              w-4 h-4 
              ${isDark ? 'text-blue-400' : 'text-blue-600'}
            `} />
          )}
        </div>
      </div>

      {/* 父任务信息 */}
      <div className="flex items-start space-x-3">
        {/* 负责人头像 */}
        {parentTask.assigneeAvatar && (
          <Avatar 
            name={parentTask.assignee || '未分配'} 
            src={parentTask.assigneeAvatar}
            size="md" 
          />
        )}

        {/* 任务详情 */}
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold text-lg leading-tight mb-1 
            ${isDark ? 'text-white' : 'text-gray-900'}
            ${onParentTaskClick ? 'hover:text-blue-600 dark:hover:text-blue-400' : ''}
            transition-colors
          `}>
            {parentTask.title}
          </h3>
          
          {parentTask.description && (
            <p className={`
              text-sm leading-relaxed mb-3 line-clamp-2
              ${isDark ? 'text-gray-300' : 'text-gray-600'}
            `}>
              {parentTask.description}
            </p>
          )}

          {/* 状态和进度 */}
          <div className="flex items-center space-x-3">
            <TaskStatusBadge 
              status={parentTask.status}
              statusColor={parentTask.statusColor}
            />
            
            <div className="flex items-center space-x-2">
              <div className={`
                w-16 h-1.5 rounded-full overflow-hidden
                ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
              `}>
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${parentTask.progress || 0}%` }}
                />
              </div>
              <span className={`
                text-xs font-medium
                ${isDark ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {parentTask.progress || 0}%
              </span>
            </div>
          </div>

          {/* 负责人和截止时间 */}
          <div className={`
            flex items-center justify-between mt-3 text-xs
            ${isDark ? 'text-gray-400' : 'text-gray-500'}
          `}>
            <span>负责人: {parentTask.assignee || '未分配'}</span>
            {parentTask.dueDate && (
              <span>
                截止: {new Date(parentTask.dueDate).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>

        {/* 导航箭头 */}
        {onParentTaskClick && (
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200
            ${isDark 
              ? 'bg-gradient-to-br from-indigo-600/30 to-blue-600/30 text-indigo-400 hover:from-indigo-600/40 hover:to-blue-600/40' 
              : 'bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 hover:from-indigo-200 hover:to-blue-200'
            }
          `}>
            <FiArrowUpRight className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* 点击提示 */}
      {onParentTaskClick && (
        <div className={`
          mt-3 pt-3 border-t border-dashed text-center text-xs
          ${isDark 
            ? 'border-blue-800/40 text-blue-400' 
            : 'border-blue-200/60 text-blue-600'
          }
        `}>
          点击查看父任务详情
        </div>
      )}
    </motion.div>
  );
};

export default ParentTaskInfo;