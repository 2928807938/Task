"use client";

import React from "react";
import {motion} from 'framer-motion';
import {FiX} from "react-icons/fi";
import {RiTaskLine} from "react-icons/ri";
import {HiOutlineDocumentDuplicate} from "react-icons/hi";

interface TaskFormHeaderProps {
  title: string;
  onClose: () => void;
  subTasksCount?: number;
  includeSubTasks?: boolean;
}

/**
 * 任务表单头部组件 -
 *
 * 遵循苹果设计规范的模态框头部
 */
const TaskFormHeader: React.FC<TaskFormHeaderProps> = ({
  title,
  onClose,
  subTasksCount = 0,
  includeSubTasks = false
}) => {
  return (
    <div className="py-4 px-5 border-b border-gray-100 dark:border-gray-800/70 flex justify-between items-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
          <RiTaskLine size={16} />
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{title}</h3>

        {subTasksCount > 0 && (
          <div className="flex items-center ml-2 rounded-full bg-blue-50 dark:bg-blue-900/20 py-0.5 px-2 text-xs text-blue-600 dark:text-blue-300">
            <HiOutlineDocumentDuplicate className="mr-1" size={12} />
            <span>{subTasksCount}个子任务</span>
          </div>
        )}
      </div>
      <motion.button
        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          // 直接触发关闭事件
          window.dispatchEvent(new CustomEvent('forceCloseModal'));
          onClose();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiX size={18} />
      </motion.button>
    </div>
  );
};

export default TaskFormHeader;
