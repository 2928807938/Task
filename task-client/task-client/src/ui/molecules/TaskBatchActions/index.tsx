'use client';

import React from 'react';
import {FiCalendar, FiCheck, FiEdit, FiTrash2, FiUser, FiX} from 'react-icons/fi';
import {motion} from 'framer-motion';
import {ProjectTask} from '@/types/api-types';

interface TaskBatchActionsProps {
  selectedTasks: ProjectTask[];
  onClearSelection: () => void;
  onChangeStatus: (status: string) => void;
  onAssignTask: () => void;
  onSetDueDate: () => void;
  onDelete: () => void;
}

/**
 * 任务批量操作工具栏 -
 * 当选择多个任务时显示的浮动工具栏
 */
const TaskBatchActions: React.FC<TaskBatchActionsProps> = ({
  selectedTasks,
  onClearSelection,
  onChangeStatus,
  onAssignTask,
  onSetDueDate,
  onDelete
}) => {
  if (selectedTasks.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 px-4 py-2.5 flex items-center space-x-1 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <div className="pr-3 border-r border-gray-200 dark:border-gray-700 flex items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            已选 {selectedTasks.length} 项
          </span>
          <button
            onClick={onClearSelection}
            className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="flex items-center space-x-1">
          {/* 设为已完成 */}
          <button
            onClick={() => onChangeStatus('已完成')}
            className="group p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
            title="设为已完成"
          >
            <div className="w-7 h-7 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-800/30">
              <FiCheck size={14} className="text-green-600 dark:text-green-400" />
            </div>
          </button>

          {/* 设为进行中 */}
          <button
            onClick={() => onChangeStatus('进行中')}
            className="group p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
            title="设为进行中"
          >
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30">
              <FiEdit size={14} className="text-blue-600 dark:text-blue-400" />
            </div>
          </button>

          {/* 指派任务 */}
          <button
            onClick={onAssignTask}
            className="group p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
            title="指派负责人"
          >
            <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-800/30">
              <FiUser size={14} className="text-purple-600 dark:text-purple-400" />
            </div>
          </button>

          {/* 设置截止日期 */}
          <button
            onClick={onSetDueDate}
            className="group p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
            title="设置截止日期"
          >
            <div className="w-7 h-7 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-800/30">
              <FiCalendar size={14} className="text-orange-600 dark:text-orange-400" />
            </div>
          </button>

          {/* 删除任务 */}
          <button
            onClick={onDelete}
            className="group p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
            title="删除任务"
          >
            <div className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-800/30">
              <FiTrash2 size={14} className="text-red-600 dark:text-red-400" />
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskBatchActions;
