'use client';

import React from 'react';
import {Task} from '@/core/domain/entities/task';
import {FiCalendar} from 'react-icons/fi';
import {avatarGradients} from '@/ui/theme/styleUtils';
import TaskStatusBadge from '@/ui/atoms/TaskStatusBadge';
import TaskPriorityBadge from '@/ui/atoms/TaskPriorityBadge';
import ProgressBar from '@/ui/atoms/ProgressBar';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, className = '', compact = false }) => {
  // 获取卡片颜色（根据任务类型）
  const getCardColor = () => {
    // 使用全局定义的渐变变量
    // 将字符串ID转换为数字，取其字符串的数字和或长度
    const hashCode = task.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hashCode % avatarGradients.length;
    return avatarGradients[index];
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div
      className={`bg-card-bg rounded-xl shadow-sm overflow-hidden transition-all duration-normal hover:shadow-md cursor-pointer group border border-card-border dark:border-neutral-700 ${className}`}
      onClick={onClick}
    >
      {/* 卡片顶部颜色条 */}
      <div className={`h-1 bg-gradient-to-r ${getCardColor()}`}></div>

      <div className={compact ? 'p-2 flex items-center' : 'p-1.5'}>
        {compact ? (
          // 列表模式布局
          <div className="flex-1 flex items-center gap-2">
            {/* 任务状态和优先级 */}
            <div className="flex gap-1">
              <TaskStatusBadge status={task.status} size="sm" />
              <TaskPriorityBadge priority={task.priority} size="sm" />
            </div>

            {/* 任务标题和描述 */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-normal">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">{task.description}</p>
              )}
            </div>

            {/* 进度信息 */}
            <div className="w-24">
              <ProgressBar
                value={task.progress ?? 0}
                max={100}
                color={`bg-gradient-to-r ${getCardColor()}`}
                height="xs"
                showPercentage
              />
            </div>

            {/* 负责人 */}
            {task.assignee && (
              <div className="flex items-center">
                {task.assignee.avatar ? (
                  <img
                    className="h-6 w-6 rounded-full border border-white dark:border-neutral-800 shadow-sm"
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                    <span className="text-xs font-medium">
                      {task.assignee.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 截止日期 */}
            {task.dueDate && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center whitespace-nowrap">
                <FiCalendar className="w-3 h-3 mr-1" />
                {formatDate(task.dueDate)}
              </div>
            )}
          </div>
        ) : (
          // 卡片模式布局
          <>
            {/* 任务标题 */}
            <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 mb-0.5 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-normal">
              {task.title}
            </h3>

            {/* 任务描述 */}
            {task.description && (
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mb-1 line-clamp-1">{task.description}</p>
            )}

            {/* 进度信息 */}
            <div className="mb-1">
              <ProgressBar
                value={task.progress ?? 0}
                max={100}
                color={`bg-gradient-to-r ${getCardColor()}`}
                height="xs"
                showPercentage
                showText
                text="完成进度"
              />
            </div>

            {/* 任务状态和优先级 */}
            <div className="flex flex-wrap gap-0.5 mb-1">
              {/* 使用任务状态标签组件 */}
              <TaskStatusBadge status={task.status} size="sm" />

              {/* 使用任务优先级标签组件 */}
              <TaskPriorityBadge priority={task.priority} size="sm" />
            </div>

            {/* 底部信息 */}
            <div className="flex justify-between items-center pt-1 border-t border-neutral-200 dark:border-neutral-700">

          {/* 负责人 */}
          <div className="flex items-center">
            {task.assignee && (
              <div className="flex items-center">
                {task.assignee.avatar ? (
                  <img
                    className="h-5 w-5 rounded-full mr-1.5 border border-white dark:border-neutral-800 shadow-sm"
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mr-1.5 text-white shadow-sm">
                    <span className="text-[10px] font-medium">
                      {task.assignee.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-medium">{task.assignee.name}</span>
              </div>
            )}
          </div>

          {/* 截止日期 */}
          {task.dueDate && (
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center">
              <FiCalendar className="w-3 h-3 mr-1" />
              {formatDate(task.dueDate)}
            </div>
          )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
