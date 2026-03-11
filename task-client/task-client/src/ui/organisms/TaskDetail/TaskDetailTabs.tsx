import React from 'react';
import {motion} from 'framer-motion';

interface TaskDetailTabsProps {
  activeTab: 'details' | 'subtasks' | 'comments';
  onTabChange: (tab: 'details' | 'subtasks' | 'comments') => void;
  subtasksCount?: number;
  commentsCount?: number;
}

/**
 * 任务详情标签页组件，遵循苹果设计规范
 */
const TaskDetailTabs: React.FC<TaskDetailTabsProps> = ({
  activeTab,
  onTabChange,
  subtasksCount = 0,
  commentsCount = 0
}) => {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 backdrop-filter backdrop-blur-sm">
      <div className="flex space-x-6 px-6">
        <button
          className={`py-3.5 px-1 relative transition-all duration-200 ${
            activeTab === 'details'
              ? 'text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => onTabChange('details')}
        >
          <span className="relative z-10">详情</span>
          {activeTab === 'details' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full"
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            />
          )}
        </button>

        <button
          className={`py-3.5 px-1 relative flex items-center transition-all duration-200 ${
            activeTab === 'subtasks'
              ? 'text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => onTabChange('subtasks')}
        >
          <span className="relative z-10 flex items-center">
            子任务
            {subtasksCount > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === 'subtasks'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {subtasksCount}
              </span>
            )}
          </span>
          {activeTab === 'subtasks' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full"
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            />
          )}
        </button>

        <button
          className={`py-3.5 px-1 relative flex items-center transition-all duration-200 ${
            activeTab === 'comments'
              ? 'text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => onTabChange('comments')}
        >
          <span className="relative z-10 flex items-center">
            讨论
            {commentsCount > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === 'comments'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {commentsCount}
              </span>
            )}
          </span>
          {activeTab === 'comments' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full"
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskDetailTabs;
