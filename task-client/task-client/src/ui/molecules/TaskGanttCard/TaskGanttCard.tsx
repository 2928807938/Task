'use client';

import React from 'react';
import {ProjectTask} from '@/types/api-types';
import {motion} from 'framer-motion';
import {getPriorityStyle, getStatusStyle} from '@/utils/style-utils';

export interface TaskGanttCardProps {
  task: ProjectTask & { start: Date; end: Date };
  style: React.CSSProperties;
  onClick?: () => void;
}

/**
 * 符合苹果设计风格的甘特图任务卡片组件
 * 以简洁、半透明和轻量级的视觉效果呈现任务信息
 */
export const TaskGanttCard: React.FC<TaskGanttCardProps> = ({ task, style, onClick }) => {
  // 获取任务优先级和状态样式
  const priorityStyle = getPriorityStyle(task.priority || '');
  const statusStyle = getStatusStyle(task.status);

  // 转换颜色为rgba格式用于背景透明度效果
  const hexToRgba = (hex: string, alpha = 0.2): string => {
    // 处理短格式的颜色代码
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    // 解析颜色代码获取RGB值
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    if (!result) return `rgba(156, 163, 175, ${alpha})`;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 直接使用后端提供的颜色值
  const priorityColor = task.priorityColor || '#8E8E93'; // 如果后端未提供，使用灰色作为默认值
  const statusColor = task.statusColor || '#8E8E93'; // 如果后端未提供，使用灰色作为默认值

  return (
    <motion.div
      className="absolute rounded-lg overflow-hidden backdrop-blur-sm"
      style={{
        ...style,
        backgroundColor: hexToRgba(statusColor, 0.08), // u8d85u6de1u72b6u6001u8272u80ccu666f
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderLeft: `3px solid ${priorityColor}`, // u5de6u4fa7u8fb9u6846u4f7fu7528u4f18u5148u7ea7u989cu8272
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClick}
      whileHover={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="h-full flex flex-col p-2">
        {/* 任务标题区域 */}
        <div className="flex items-center mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-sm font-medium truncate">
            {task.title}
          </span>
        </div>

        {/* 任务时间信息 - 开始时间和截止时间 */}
        <div className="flex items-center text-xs text-gray-500 mb-1.5">
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
            </svg>
            {task.startTime ? new Date(task.startTime).toLocaleDateString() : '无开始时间'}
            {task.dueDate &&
              <span className="mx-1">-</span>
            }
            {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>

        {/* 负责人信息 - 底部单独一行 */}
        <div className="mt-auto">
          {task.assignee && (
            <div className="text-xs text-gray-500 truncate">
              {task.assignee}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskGanttCard;
