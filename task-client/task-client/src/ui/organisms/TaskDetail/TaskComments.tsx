import React from 'react';
import {motion} from 'framer-motion';
import {Avatar} from '@/ui/atoms/Avatar';
import {formatDate} from './TaskInfoCard';

interface TaskComment {
  id: string;
  content: string;
  author?: string;
  avatarUrl?: string;
  createdAt?: string;
}

interface TaskCommentsProps {
  comments?: TaskComment[];
  onViewAllComments?: () => void;
  maxDisplay?: number;
}

/**
 * 任务注释组件，遵循苹果设计规范
 */
const TaskComments: React.FC<TaskCommentsProps> = ({
  comments = [],
  onViewAllComments,
  maxDisplay = 2
}) => {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="space-y-2 mt-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">讨论 ({comments.length})</h3>
        {comments.length > maxDisplay && (
          <button
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={onViewAllComments}
          >
            查看全部
          </button>
        )}
      </div>
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 space-y-3">
        {comments.slice(0, maxDisplay).map((comment, idx) => (
          <div
            key={comment.id || idx}
            className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
          >
            <div className="flex-shrink-0">
              <Avatar
                name={comment.author || '用户'}
                src={comment.avatarUrl}
                size="sm"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className="font-medium text-gray-800 dark:text-gray-200 mr-2 truncate">
                  {comment.author || '用户'}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {formatDate(comment.createdAt || '', { format: 'short', showTime: true })}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

        {comments.length > maxDisplay && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-1">
            还有 {comments.length - maxDisplay} 条讨论...
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskComments;
