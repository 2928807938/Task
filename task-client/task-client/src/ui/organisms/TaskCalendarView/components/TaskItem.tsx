'use client';

import React from 'react';
import {motion} from 'framer-motion';
import {ProjectTask} from '@/types/api-types';

// 工具函数：将十六进制颜色转换为RGB格式
const hexToRgb = (hex: string): string => {
  // 移除可能存在的 # 前缀
  const cleanHex = hex.charAt(0) === '#' ? hex.substring(1) : hex;

  // 转换为RGB值
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // 返回RGB字符串
  return `${r}, ${g}, ${b}`;
};

// 工具函数：获取优先级对应的颜色十六进制值
const getPriorityColorHex = (priority: string): string => {
  switch (priority.toUpperCase()) {
    case 'HIGH':
      return '#D70015'; // 红色
    case 'MEDIUM':
      return '#FF9500'; // 橙色
    case 'LOW':
      return '#34C759'; // 绿色
    default:
      return '#8E8E93'; // 灰色
  }
};

// 工具函数：获取状态对应的颜色十六进制值
const getStatusColorHex = (status?: string): string => {
  if (!status) return '#8E8E93';

  const s = status.toLowerCase();
  switch (s) {
    case 'not_started':
    case 'waiting':
      return '#9C27B0'; // 紫色
    case 'in_progress':
      return '#00C853'; // 绿色
    case 'paused':
      return '#FFD600'; // 黄色
    case 'completed':
      return '#03A9F4'; // 蓝色
    case 'overdue':
      return '#FF9500'; // 橙色
    case 'cancelled':
      return '#FF3D00'; // 橙红色
    default:
      return '#8E8E93'; // 灰色
  }
};

interface TaskItemProps {
  taskItem: {
    task: ProjectTask;
    status: 'start' | 'middle' | 'end' | 'single';
  };
  onClick: (e: React.MouseEvent) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ taskItem, onClick }) => {
  const { task, status } = taskItem;
  const isPriorityHigh = task.priority?.toUpperCase() === 'HIGH';

  // 根据任务在当前日期的状态设置不同的样式
  let continuationStyle = {};
  let taskInfo = null;

  if (status === 'start') {
    // 任务的开始日
    continuationStyle = {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRight: 'none',
      paddingRight: '0.25rem',
    };
    const startDate = task.startTime ? new Date(task.startTime) : null;
    const endDate = task.dueDate ? new Date(task.dueDate) : null;
    const days = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    taskInfo = (
      <div className="flex items-center text-xs text-gray-500 mt-1">
        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
        </svg>
        {startDate?.getDate()}日开始 {days > 0 ? `(共${days}天)` : ''}
        <span className="ml-1">→</span>
      </div>
    );
  } else if (status === 'end') {
    // 任务的结束日
    continuationStyle = {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderLeft: 'none',
      paddingLeft: '0.25rem',
    };
    const endDate = task.dueDate ? new Date(task.dueDate) : null;
    taskInfo = (
      <div className="flex items-center text-xs text-gray-500 mt-1">
        <span className="mr-1">←</span>
        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
        </svg>
        {endDate?.getDate()}日截止
      </div>
    );
  } else if (status === 'middle') {
    // 任务的中间日期
    continuationStyle = {
      borderRadius: 0,
      borderLeft: 'none',
      borderRight: 'none',
      paddingLeft: '0.25rem',
      paddingRight: '0.25rem',
    };
    taskInfo = (
      <div className="flex items-center text-xs text-gray-500 justify-center mt-1">
        <span>←</span>
        <span className="mx-1">持续进行中</span>
        <span>→</span>
      </div>
    );
  }

  return (
    <motion.div
      className={`p-2 mb-1.5 text-xs rounded-lg shadow-sm hover:shadow cursor-pointer backdrop-blur-sm overflow-hidden relative
        ${isPriorityHigh ? 'z-10' : 'z-0'}
      `}
      style={{
        ...continuationStyle,
        // 使用状态颜色作为淡色背景（透明度）
        backgroundColor: `rgba(${hexToRgb(task.statusColor || getStatusColorHex(task.status))}, ${status === 'middle' ? 0.05 : 0.08})`,
        // 使用优先级颜色作为左侧边框
        borderLeft: status !== 'end' ? `3px solid ${task.priorityColor || getPriorityColorHex(task.priority || '')}` : 'none',
        // 结束日期使用右侧边框
        borderRight: status !== 'start' ? `3px solid ${task.statusColor || getStatusColorHex(task.status)}` : 'none',
        // 单日任务正常显示边框
        ...(status === 'single' ? {
          borderLeft: `3px solid ${task.priorityColor || getPriorityColorHex(task.priority || '')}`,
          borderRight: 'none'
        } : {}),
        // 高优先级任务的阴影更明显
        boxShadow: isPriorityHigh ? '0 2px 5px rgba(0,0,0,0.08)' : ''
      }}
      whileHover={{ transition: { duration: 0.1 } }}
      whileTap={{ y: 0, scale: 0.98, transition: { duration: 0.1 } }}
      onClick={onClick}
    >
      <div className="flex items-center">
        {/* 状态指示器 */}
        <span
          className="w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0"
          style={{ backgroundColor: task.statusColor || getStatusColorHex(task.status) }}
        />

        {/* 在在日期状态图标 */}
        {status !== 'single' && (
          <span className="flex-shrink-0 w-5 h-5 mr-2 flex items-center justify-center">
            {status === 'start' ? (
              <svg className="w-4 h-4 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="5 9 9 13 19 3"></polyline>
              </svg>
            ) : status === 'end' ? (
              <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-yellow-500 dark:text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
            )}
          </span>
        )}

        {/* 任务标题 */}
        <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{task.title}</div>

        {/* 高优先级标记 */}
        {isPriorityHigh && (
          <span className="ml-1 text-red-500 dark:text-red-400">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2L1,21H23M12,6L19.53,19H4.47" />
            </svg>
          </span>
        )}
      </div>

      {/* 时间信息 - 根据任务状态显示不同信息 */}
      {taskInfo}

      {/* 单日任务显示负责人 */}
      {status === 'single' && task.assignee && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate flex items-center">
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
          </svg>
          {task.assignee}
        </div>
      )}
    </motion.div>
  );
};

export default TaskItem;
