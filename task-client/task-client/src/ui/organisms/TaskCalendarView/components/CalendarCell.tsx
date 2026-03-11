'use client';

import React from 'react';
import {ProjectTask} from '@/types/api-types';
import {isToday} from 'date-fns';
import TaskItem from './TaskItem';

interface TaskItemData {
  task: ProjectTask;
  status: 'start' | 'middle' | 'end' | 'single';
}

interface CalendarCellProps {
  date: Date | null;
  tasks: TaskItemData[];
  isSelected: boolean;
  onDateClick: (date: Date) => void;
  onTaskClick: (task: ProjectTask) => void;
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  date,
  tasks,
  isSelected,
  onDateClick,
  onTaskClick
}) => {
  // 判断是否是今天
  const isTodayDate = date ? isToday(date) : false;

  // 最多显示3个任务，其余显示数量
  const visibleTasks = tasks.slice(0, 3);
  const hasMoreTasks = tasks.length > 3;

  return (
    <div
      className={`relative border border-gray-200/50 dark:border-gray-800/50 p-2 transition-all min-h-[140px] 
        ${date ? 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm' : 'bg-gray-50/30 dark:bg-gray-900/30 opacity-50'} 
        ${isSelected ? 'ring-2 ring-blue-400 dark:ring-blue-600 ring-offset-1 ring-offset-white dark:ring-offset-gray-900' : ''}
        ${!date ? 'cursor-default' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'}`}
      onClick={() => date && onDateClick(date)}
    >
      {/* 日期 */}
      {date && (
        <div className="flex justify-end mb-2">
          <div className={`
            ${isTodayDate 
              ? 'bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-full font-medium' 
              : 'text-gray-700 dark:text-gray-300 font-medium'}
          `}>
            {date.getDate()}
          </div>
        </div>
      )}

      {/* 任务列表 */}
      <div className="overflow-y-auto" style={{ maxHeight: '90px' }}>
        {visibleTasks.map(taskItem => (
          <TaskItem
            key={`${taskItem.task.id}-${taskItem.status}`}
            taskItem={taskItem}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onTaskClick(taskItem.task);
            }}
          />
        ))}

        {hasMoreTasks && (
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
            +{tasks.length - 3} 项任务
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarCell;
