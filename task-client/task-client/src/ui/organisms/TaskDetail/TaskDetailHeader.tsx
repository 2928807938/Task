import React from 'react';
import {FiEdit, FiX} from 'react-icons/fi';
import {motion} from 'framer-motion';

interface TaskDetailHeaderProps {
  title: string;
  id?: string;
  onClose: () => void;
  onEdit?: () => void;
  showEditButton?: boolean;
}

/**
 * 任务详情头部组件，遵循苹果设计规范
 */
const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({
  title,
  id,
  onClose,
  onEdit,
  showEditButton = true
}) => {
  return (
    <motion.div
      className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/30 backdrop-blur-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
    >
      <div className="flex items-center">
        {id && (
          <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium px-2 py-1 rounded-md mr-2">
            #{id}
          </span>
        )}
        <h2 className="text-lg font-medium text-gray-900 dark:text-white truncate max-w-sm">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {showEditButton && onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-gray-400 dark:hover:text-blue-400 rounded transition-colors"
            aria-label="编辑任务"
          >
            <FiEdit size={18} />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="关闭"
        >
          <FiX size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskDetailHeader;
