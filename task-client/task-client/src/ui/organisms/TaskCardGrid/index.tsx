'use client';

import React from 'react';
import {Task} from '@/core/domain/entities/task';
import TaskCard from '../../molecules/TaskCard';
import {FiInbox} from 'react-icons/fi';

interface TaskCardGridProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  onAddTask?: () => void;
  viewMode?: 'grid' | 'list';
}

const TaskCardGrid: React.FC<TaskCardGridProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  viewMode = 'grid'
}) => {
  // 任务的筛选已经在TaskManagementTemplate中处理，这里直接使用传入的已筛选任务
  const filteredTasks = tasks;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {/* 删除了重复的工具栏和筛选面板，这些功能已经由TaskToolbar提供 */}

      {/* 任务卡片网格/列表 */}
      <div className={`p-6 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick && onTaskClick(task.id)}
              className={viewMode === 'list' ? 'max-w-full' : ''}
              compact={viewMode === 'list'}
            />
          ))
        ) : (
          <div className={`${viewMode === 'grid' ? 'col-span-full' : ''} text-center py-10 text-gray-500`}>
            <FiInbox className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">没有找到符合条件的任务</p>
          </div>
        )}
      </div>

      {/* 分页信息 */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
        <div>显示 {filteredTasks.length} 个任务（共 {tasks.length} 个）</div>
      </div>
    </div>
  );
};

export default TaskCardGrid;
