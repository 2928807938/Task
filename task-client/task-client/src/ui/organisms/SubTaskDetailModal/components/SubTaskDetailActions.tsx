'use client';

import React, {useState} from 'react';
import {motion} from 'framer-motion';
import {
  FiEdit3, 
  FiCheck, 
  FiPlay, 
  FiPause, 
  FiTrash2, 
  FiShare2,
  FiCopy,
  FiMoreHorizontal
} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
import {useTheme} from '@/ui/theme';
import {taskApi} from '@/adapters/api/task-api';

interface SubTaskDetailActionsProps {
  task: ProjectTask;
  onEdit?: () => void;
  onTaskUpdate?: (updatedTask: ProjectTask) => void;
  projectId?: string;
}

/**
 * 子任务操作按钮组件 - 苹果风格设计
 * 
 * 功能：
 * - 任务状态切换
 * - 编辑、删除等操作
 * - 分享和复制功能
 */
const SubTaskDetailActions: React.FC<SubTaskDetailActionsProps> = ({
  task,
  onEdit,
  onTaskUpdate,
  projectId
}) => {
  const { isDark } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // 处理任务状态更新
  const handleStatusUpdate = async (newStatus: string) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const result = await taskApi.updateTaskStatus(task.id, newStatus);
      
      if (result.success) {
        const updatedTask = { ...task, status: newStatus as any };
        onTaskUpdate?.(updatedTask);
      }
    } catch (error) {
      console.error('更新任务状态失败:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 处理任务删除
  const handleDelete = async () => {
    if (!window.confirm('确定要删除这个任务吗？此操作无法撤销。')) {
      return;
    }

    try {
      setIsUpdating(true);
      // 这里应该调用删除API
      // await taskApi.deleteTask(task.id);
      console.log('删除任务:', task.id);
    } catch (error) {
      console.error('删除任务失败:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 处理复制任务链接
  const handleCopyLink = () => {
    const taskUrl = `${window.location.origin}/tasks/${task.id}`;
    navigator.clipboard.writeText(taskUrl);
    // 这里可以添加一个 toast 提示
  };

  // 主要操作按钮
  const renderPrimaryActions = () => {
    const actions = [];

    // 根据任务状态显示不同的操作按钮
    switch (task.status) {
      case 'WAITING':
        actions.push(
          <motion.button
            key="start"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStatusUpdate('IN_PROGRESS')}
            disabled={isUpdating}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all
              ${isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <FiPlay className="w-5 h-5" />
            <span>开始任务</span>
          </motion.button>
        );
        break;

      case 'IN_PROGRESS':
        actions.push(
          <motion.button
            key="complete"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStatusUpdate('COMPLETED')}
            disabled={isUpdating}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all
              ${isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <FiCheck className="w-5 h-5" />
            <span>完成任务</span>
          </motion.button>
        );
        
        actions.push(
          <motion.button
            key="pause"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStatusUpdate('WAITING')}
            disabled={isUpdating}
            className={`
              flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all
              ${isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <FiPause className="w-5 h-5" />
            <span>暂停</span>
          </motion.button>
        );
        break;

      case 'COMPLETED':
        actions.push(
          <motion.button
            key="reopen"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStatusUpdate('IN_PROGRESS')}
            disabled={isUpdating}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all
              ${isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <FiPlay className="w-5 h-5" />
            <span>重新开始</span>
          </motion.button>
        );
        break;
    }

    return actions;
  };

  // 次要操作按钮
  const renderSecondaryActions = () => (
    <div className="flex items-center space-x-2">
      {/* 编辑按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEdit}
        className={`
          p-3 rounded-xl transition-all
          ${isDark 
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }
        `}
        aria-label="编辑任务"
      >
        <FiEdit3 className="w-5 h-5" />
      </motion.button>

      {/* 分享按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopyLink}
        className={`
          p-3 rounded-xl transition-all
          ${isDark 
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }
        `}
        aria-label="复制链接"
      >
        <FiCopy className="w-5 h-5" />
      </motion.button>

      {/* 更多操作 */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMoreActions(!showMoreActions)}
          className={`
            p-3 rounded-xl transition-all
            ${isDark 
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }
          `}
          aria-label="更多操作"
        >
          <FiMoreHorizontal className="w-5 h-5" />
        </motion.button>

        {/* 更多操作菜单 */}
        {showMoreActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={`
              absolute right-0 bottom-full mb-2 w-48 py-2 rounded-2xl shadow-xl border z-10
              ${isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
              }
            `}
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            <button
              onClick={() => {
                setShowMoreActions(false);
                // 处理分享功能
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors
                ${isDark 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <FiShare2 className="w-4 h-4" />
              <span>分享任务</span>
            </button>

            <div className={`my-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

            <button
              onClick={() => {
                setShowMoreActions(false);
                handleDelete();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>删除任务</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="space-y-4"
    >
      {/* 主要操作按钮区域 */}
      <div className="flex items-center space-x-3">
        {renderPrimaryActions()}
      </div>

      {/* 分隔线 */}
      <div className={`h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

      {/* 次要操作按钮区域 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          任务 ID: {task.id.slice(0, 8)}...
        </div>
        
        {renderSecondaryActions()}
      </div>

      {/* 加载状态覆盖 */}
      {isUpdating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/20 dark:bg-black/40 rounded-2xl flex items-center justify-center"
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        >
          <div className="flex items-center space-x-2 text-white">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>更新中...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SubTaskDetailActions;