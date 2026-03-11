import React from 'react';
import {FiCalendar, FiCheck, FiEdit, FiPlay} from 'react-icons/fi';
import {motion} from 'framer-motion';
import {ProjectTask} from '@/types/api-types';
import {formatDate, PriorityBadge, StatusBadge} from './TaskInfoCard';

interface SubtasksListProps {
  subtasks: ProjectTask[];
  onToggleStatus?: (taskId: string, status: string) => void;
  onViewSubtask?: (task: ProjectTask) => void;
  onEditSubtask?: (task: ProjectTask) => void;
}

/**
 * 子任务列表组件，遵循苹果设计规范
 */
const SubtasksList: React.FC<SubtasksListProps> = ({
  subtasks,
  onToggleStatus,
  onViewSubtask,
  onEditSubtask
}) => {
  if (!subtasks || subtasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-8 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400"
      >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center mb-4">
          <FiCheck className="text-gray-400 dark:text-gray-500" size={24} />
        </div>
        <p className="text-sm">该任务没有子任务</p>
        <p className="text-xs mt-1 max-w-xs text-gray-400 dark:text-gray-500">
          子任务可以帮助您将大型任务分解为可管理的小步骤
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >

      {/* 子任务列表 */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {subtasks.map((subtask, index) => (
          <div
            key={subtask.id}
            className="hover:bg-gray-50/80 dark:hover:bg-gray-800/20 transition-colors duration-200 group"
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      <span className="mr-2">{subtask.title}</span>
                      {subtask.status === 'COMPLETED' && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{
                            color: subtask.statusColor || '#10b981',
                            backgroundColor: `${subtask.statusColor || '#10b981'}15`,
                          }}
                        >已完成</motion.span>
                      )}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={subtask.status} statusColor={subtask.statusColor} />
                      {/* 编辑按钮 */}
                      {onEditSubtask && (
                        <button
                          className="p-1.5 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          aria-label="编辑子任务"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditSubtask(subtask);
                          }}
                        >
                          <FiEdit size={16} />
                        </button>
                      )}

                    </div>
                  </div>

                  {/* 子任务序号和创建时间 */}
                  <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-1 mb-2">
                    <span className="mr-2">子任务 #{index + 1}</span>
                    <span>创建于 {formatDate(subtask.createdAt || '', { format: 'short', showTime: true })}</span>
                  </div>

                  {/* 子任务描述 */}
                  {subtask.description && (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
                      {subtask.description}
                    </div>
                  )}

                  {/* 子任务元数据行 */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {/* 优先级 */}
                    <PriorityBadge priority={subtask.priority} color={subtask.priorityColor} />

                    {/* 开始时间 */}
                    {subtask.startTime && (
                      <div className="flex items-center bg-gray-50 dark:bg-gray-800/30 px-2 py-1 rounded-md">
                        <FiPlay className="mr-1" size={12} />
                        <span>
                          {formatDate(subtask.startTime, { format: 'short', showTime: true })}
                        </span>
                      </div>
                    )}

                    {/* 截止日期 */}
                    {subtask.dueDate && (
                      <div className="flex items-center bg-gray-50 dark:bg-gray-800/30 px-2 py-1 rounded-md">
                        <FiCalendar className="mr-1" size={12} />
                        <span>
                          {formatDate(subtask.dueDate, { format: 'short', showTime: true })}
                          {new Date(subtask.dueDate) < new Date() && subtask.status !== 'COMPLETED' && (
                            <span className="ml-1 text-red-500 bg-red-50 dark:bg-red-900/20 px-1 py-0.5 rounded-full">已逾期</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SubtasksList;
