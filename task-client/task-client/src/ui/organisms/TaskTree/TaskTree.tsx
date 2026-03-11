import React, {useState} from 'react';
import {ProjectTask} from '@/types/api-types';
import TaskStatusBadge from '@/ui/atoms/TaskStatusBadge';
import TaskPriorityBadge from '@/ui/atoms/TaskPriorityBadge';
import {TaskPriority, TaskStatus} from '@/core/domain/entities/task';

interface TaskTreeProps {
  tasks: ProjectTask[];
  onTaskClick?: (task: ProjectTask) => void;
}

interface TaskNodeProps {
  task: ProjectTask;
  level: number;
  onTaskClick?: (task: ProjectTask) => void;
}

const TaskNode: React.FC<TaskNodeProps> = ({ task, level, onTaskClick }) => {
  // 默认展开第一层任务，方便查看
  const [expanded, setExpanded] = useState(level === 0);
  const hasSubTasks = task.subTasks && task.subTasks.length > 0;

  // 处理手动展开/折叠
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };

  // 处理点击整个任务区域
  const handleClick = () => {

    // 如果有子任务，则切换展开/折叠状态
    if (hasSubTasks) {
      setExpanded(prev => !prev);
    }

    // 同时触发任务点击回调
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  return (
    <div className="mb-2">
      <div
        className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${level === 0 ? 'bg-white shadow-sm' : ''}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div className="flex items-center" style={{ marginLeft: `${level * 20}px` }}>
          {hasSubTasks ? (
            <button
              onClick={handleToggle}
              className="mr-2 text-gray-500 hover:bg-gray-100 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={expanded ? '折叠' : '展开'}
            >
              {expanded ?
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg> :
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            </button>
          ) : (
            <div className="w-6 h-6 mr-2"></div>
          )}
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
              <div className="ml-2 flex space-x-1">
                <TaskStatusBadge status={task.status as TaskStatus} />
                <TaskPriorityBadge priority={task.priority as TaskPriority} />
              </div>
            </div>
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <span>负责人: {task.assignee}</span>
              <span className="mx-2">•</span>
              <span>进度: {task.progress}%</span>
              <span className="mx-2">•</span>
              <span>截止日期: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {expanded && hasSubTasks && (
        <div className="mt-1">
          {task.subTasks!.map((subTask) => (
            <TaskNode
              key={subTask.id}
              task={subTask}
              level={level + 1}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TaskTree: React.FC<TaskTreeProps> = ({ tasks, onTaskClick }) => {
  // 过滤出主任务（没有父任务的任务）
  const mainTasks = tasks.filter(task => !task.parentId);

  return (
    <div className="space-y-2">
      {mainTasks.map((task) => (
        <TaskNode
          key={task.id}
          task={task}
          level={0}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
};
