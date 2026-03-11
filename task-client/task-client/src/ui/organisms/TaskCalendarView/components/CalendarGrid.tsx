'use client';

import React from 'react';
import CalendarCell from './CalendarCell';
import {ProjectTask} from '@/types/api-types';

interface TaskItemData {
  task: ProjectTask;
  status: 'start' | 'middle' | 'end' | 'single';
}

interface CalendarGridProps {
  currentYear: number;
  currentMonth: number;
  rows: number;
  firstDayOfWeek: number;
  lastDayOfMonth: Date;
  weekDayNames: string[];
  tasksByDate: Record<string, TaskItemData[]>;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onTaskClick: (task: ProjectTask) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentYear,
  currentMonth,
  rows,
  firstDayOfWeek,
  lastDayOfMonth,
  weekDayNames,
  tasksByDate,
  selectedDate,
  onDateClick,
  onTaskClick
}) => {
  // 生成日历单元格
  const generateCalendarCells = () => {
    const cells = [];
    let day = 1;

    // 添加星期头部
    cells.push(
      <div key="weekdays" className="grid grid-cols-7 gap-0.5 mb-0.5">
        {weekDayNames.map((name, index) => (
          <div
            key={`weekday-${index}`}
            className="text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-800/80"
          >
            {name}
          </div>
        ))}
      </div>
    );

    // 每一行
    for (let row = 0; row < rows; row++) {
      const rowCells = [];

      // 每一列 (星期)
      for (let col = 0; col < 7; col++) {
        // 计算该单元格对应的日期
        let cellDate: Date | null = null;

        // 第一行中前几个单元格可能是上个月的日期
        if (row === 0 && col < firstDayOfWeek) {
          cellDate = null;
        }
        // 当月的日期
        else if (day <= lastDayOfMonth.getDate()) {
          cellDate = new Date(currentYear, currentMonth, day);
          day++;
        }
        // 下个月的日期
        else {
          cellDate = null;
        }

        // 该日期的任务
        const cellTasks = cellDate
          ? tasksByDate[cellDate.toISOString().split('T')[0]] || []
          : [];

        // 判断是否是选中的日期
        const isSelected = Boolean(cellDate && selectedDate &&
          cellDate.toDateString() === selectedDate.toDateString());

        rowCells.push(
          <CalendarCell
            key={`cell-${row}-${col}`}
            date={cellDate}
            tasks={cellTasks}
            isSelected={isSelected}
            onDateClick={onDateClick}
            onTaskClick={onTaskClick}
          />
        );
      }

      cells.push(
        <div key={`row-${row}`} className="grid grid-cols-7 gap-0.5">
          {rowCells}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-sm">
      {generateCalendarCells()}
    </div>
  );
};

export default CalendarGrid;
