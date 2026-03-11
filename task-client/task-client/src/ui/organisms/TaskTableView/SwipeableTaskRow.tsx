import React from 'react';
import {ProjectTask} from '@/types/api-types';
import SwipeableTaskItem from '@/ui/molecules/SwipeableTaskItem';
import {FiCheck, FiTrash2} from 'react-icons/fi';
import {Avatar} from '@/ui/atoms/Avatar';

interface SwipeableTaskRowProps {
  task: ProjectTask;
  tasks: ProjectTask[]; // 所有任务列表，用于查找父任务
  onTaskClick?: (task: ProjectTask) => void;
  onTaskComplete?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
}

/**
 * 可滑动的任务行组件，支持滑动操作
 */
const SwipeableTaskRow: React.FC<SwipeableTaskRowProps> = ({
  task,
  tasks,
  onTaskClick,
  onTaskComplete,
  onTaskDelete
}) => {
  // 处理完成任务操作
  const handleCompleteTask = () => {
    if (onTaskComplete && task.status !== 'COMPLETED') {
      onTaskComplete(task.id);
    }
  };

  // 处理删除任务操作
  const handleDeleteTask = () => {
    if (onTaskDelete) {
      onTaskDelete(task.id);
    }
  };

  return (
    <tr
      className={`h-16 border-b border-gray-200 ${task.status === 'COMPLETED' ? 'bg-green-50/20 dark:bg-green-900/5' : ''}`}
    >
      {/* 任务标题列 */}
      <td className="w-[40%] px-4 py-3">
        <SwipeableTaskItem
          onSwipeRight={handleCompleteTask}
          onSwipeLeft={handleDeleteTask}
          isCompleted={task.status === 'COMPLETED'}
          rightActionText={task.status === 'COMPLETED' ? '已完成' : '完成'}
          leftActionText="删除"
          rightActionIcon={<FiCheck size={18} />}
          leftActionIcon={<FiTrash2 size={18} />}
          rightActionColor="#10b981" // 绿色
          leftActionColor="#ef4444" // 红色
        >
          <div
            className="flex items-center w-full h-full cursor-pointer"
            onClick={() => onTaskClick && onTaskClick(task)}
          >
            <div className="min-w-0">
              <div className="font-medium text-gray-900 dark:text-gray-200 truncate">{task.title}</div>
              {task.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{task.description}</div>
              )}
              {/* 如果是子任务，显示父任务信息 */}
              {task.parentTaskId && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  父任务: {tasks.find(t => t.id === task.parentTaskId)?.title || '未知'}
                </div>
              )}
            </div>
          </div>
        </SwipeableTaskItem>
      </td>

      {/* 任务类型列 */}
      <td className="w-[10%] px-4 py-3 text-sm text-center">
        {!task.parentTaskId ? (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
            主任务
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40">
            子任务
          </span>
        )}
      </td>

      {/* 优先级列 */}
      <td className="w-[10%] px-4 py-3 text-sm text-center">
        {task.priorityColor ? (
          <span
            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
            style={{
              backgroundColor: `${task.priorityColor}15`,
              color: task.priorityColor,
              borderColor: `${task.priorityColor}40`
            }}
          >
            {task.priority || '无'}
          </span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )}
      </td>

      {/* 负责人列 */}
      <td className="w-[12%] px-4 py-3 text-sm text-center">
        {task.assignee ? (
          <div className="flex items-center justify-center">
            <Avatar name={task.assignee} size="xs" className="mr-2 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[90px]">{task.assignee}</span>
          </div>
        ) : (
          <span className="text-gray-400">未分配</span>
        )}
      </td>

      {/* 开始时间列 */}
      <td className="w-[10%] px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-center">
        {task.startTime && !isNaN(new Date(task.startTime).getTime())
          ? new Date(task.startTime).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })
          : '-'}
      </td>

      {/* 截止日期列 -  */}
      <td className="w-[10%] px-4 py-3 text-sm text-center">
        {task.dueDate && !isNaN(new Date(task.dueDate).getTime())
          ? (() => {
              const dueDate = new Date(task.dueDate);
              const now = new Date();
              const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              // 苹果系统颜色
              let dotColor = '';
              let textColor = 'text-gray-700 dark:text-gray-300';

              if (task.status === 'COMPLETED') {
                // 已完成任务 - 苹果绿色
                dotColor = 'bg-[#34c759] dark:bg-[#30d158]';
                textColor = 'text-gray-500 dark:text-gray-400';
              } else if (diffDays < 0) {
                // 已过期 - 苹果红色
                dotColor = 'bg-[#ff3b30] dark:bg-[#ff453a]';
                textColor = 'text-[#ff3b30] dark:text-[#ff453a]';
              } else if (diffDays === 0) {
                // 今天到期 - 苹果橙色
                dotColor = 'bg-[#ff9500] dark:bg-[#ff9f0a]';
                textColor = 'text-[#ff9500] dark:text-[#ff9f0a]';
              } else if (diffDays <= 2) {
                // 即将到期 - 苹果黄色
                dotColor = 'bg-[#ffcc00] dark:bg-[#ffd60a]';
              }

              // 格式化日期
              const formattedDate = dueDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\//g, '-');

              // 格式化时间
              const formattedTime = dueDate.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });

              return (
                <div className="group relative">
                  {/* 状态点标记 */}
                  {dotColor && (
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 -translate-x-1">
                      <div className={`${dotColor} w-2 h-2 rounded-full shadow-sm`}></div>
                    </div>
                  )}

                  {/* 日期时间容器 */}
                  <div className={`flex flex-col items-center ${textColor}`}>
                    <div className="font-medium tracking-tight">
                      {formattedDate}
                    </div>
                    <div className="text-xs font-light mt-0.5 opacity-80">
                      {formattedTime}
                    </div>
                  </div>

                  {/* 悬停提示 - 小提示气泡风格 */}
                  {diffDays < 3 && diffDays > -2 && task.status !== 'COMPLETED' && (
                    <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                      <div className="bg-gray-800/90 dark:bg-gray-700/90 backdrop-blur-sm text-white text-xs rounded-lg px-2 py-1 mt-1 shadow-sm whitespace-nowrap">
                        {diffDays < 0 ? '已过期' : diffDays === 0 ? '今天到期' : `${diffDays}天后到期`}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          : <span className="text-gray-400 dark:text-gray-500">—</span>}
      </td>

      {/* 进度列 */}
      <td className="w-[8%] px-4 py-3 text-sm text-center">
        <div className="group relative w-full px-1 py-1">
          {/* 更加符合进度条 */}
          <div
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 relative overflow-hidden"
            style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}
          >
            {/* 更新进度条填充部分为苹果系统色 */}
            <div
              className="absolute inset-y-0 left-0 transition-all duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)]"
              style={{
                width: `${task.progress || 0}%`,
                background: '#007aff',
                borderTopRightRadius: '9999px',
                borderBottomRightRadius: '9999px'
              }}
            >
              {/* 微妙的亮度效果 */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
            </div>
          </div>

          {/* 进度文本放在进度条下方 */}
          <div className="absolute text-center w-full mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            {task.progress || 0}%
          </div>

          {/* 鼠标悬停效果 */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
            <div className="mt-4 bg-gray-900/80 dark:bg-gray-700/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap backdrop-blur-sm">
              进度: {task.progress || 0}%
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default SwipeableTaskRow;
