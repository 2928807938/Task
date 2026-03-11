import React from 'react';
import {FiCalendar, FiMoreHorizontal, FiTag, FiUser} from 'react-icons/fi';
import {Task, TaskStatus} from '@/core/domain/entities/task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskItem({ task, onToggle, onRemove }: TaskItemProps) {
  // 获取任务状态显示信息
  const getStatusColor = () => {
    switch(task.status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-500';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-500';
      case TaskStatus.OVERDUE:
        return 'bg-orange-500';
      case TaskStatus.WAITING:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 格式化优先级显示
  const getPriorityLabel = () => {
    switch(task.priority) {
      case 'high':
        return { text: '高', color: 'text-red-500 bg-red-50' };
      case 'medium':
        return { text: '中', color: 'text-yellow-500 bg-yellow-50' };
      case 'low':
        return { text: '低', color: 'text-green-500 bg-green-50' };
      default:
        return { text: '中', color: 'text-blue-500 bg-blue-50' };
    }
  };

  const priorityInfo = getPriorityLabel();
  const statusColor = getStatusColor();

  // 计算进度百分比
  const progress = task.progress || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* 任务头部 - 状态指示器 */}
      <div className="relative h-1.5 w-full bg-gray-100">
        <div
          className={`absolute top-0 left-0 h-full ${statusColor} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* 任务内容 */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* 标题和状态 */}
          <div className="flex-1">
            <h3
              className={`font-medium mb-1.5 ${task.status === TaskStatus.COMPLETED ? 'text-gray-400 line-through' : 'text-gray-700'}`}
              onClick={() => onToggle(task.id)}
            >
              {task.title}
            </h3>

            {/* 任务元数据 */}
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {/* 优先级 */}
              <div className={`text-xs px-2 py-0.5 rounded-full ${priorityInfo.color}`}>
                {priorityInfo.text}优先级
              </div>

              {/* 截止日期 */}
              {task.dueDate && (
                <div className="flex items-center text-xs text-gray-500 px-2 py-0.5 rounded-full bg-gray-50">
                  <FiCalendar className="w-3 h-3 mr-1" />
                  <span>{task.dueDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* 任务详情 - 限制显示长度 */}
            {task.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* 更多操作按钮 */}
          <button
            onClick={() => onRemove(task.id)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <FiMoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
          {/* 任务状态、标签等 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-gray-500">
              <FiTag className="w-3 h-3 mr-1" />
              <span>任务</span>
            </div>

            {task.assignee && (
              <div className="flex items-center text-xs text-gray-500">
                <FiUser className="w-3 h-3 mr-1" />
                <span>{task.assignee.name}</span>
              </div>
            )}
          </div>

          {/* 状态指示器 */}
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">{progress}%</span>
            <div
              className={`w-2 h-2 rounded-full ${statusColor}`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
