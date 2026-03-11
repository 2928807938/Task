'use client';

import React, {useCallback, useMemo, useRef, useState} from 'react';
import {ProjectTask} from '@/types/api-types';
import {addMonths, endOfMonth, getDay, startOfMonth} from 'date-fns';
import {useTheme} from 'next-themes';

// 导入子组件
import CalendarHeader from './components/CalendarHeader';
import CalendarGrid from './components/CalendarGrid';
import TaskList from './components/TaskList';

interface TaskItem {
  task: ProjectTask;
  status: 'start' | 'middle' | 'end' | 'single';
}

interface TaskCalendarViewProps {
  /** 任务列表数据 */
  tasks: ProjectTask[];
  /** 点击任务时的回调函数 */
  onTaskClick?: (task: ProjectTask) => void;
  /** 添加任务按钮点击回调 */
  onAddTask?: () => void;
  /** 视图切换回调 */
  onViewChange?: (view: 'day' | 'week' | 'month') => void;
}

export function TaskCalendarView({ tasks, onTaskClick, onAddTask }: TaskCalendarViewProps) {
  // 日历状态
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // 获取当前年月
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 获取当月第一天和最后一天
  const firstDayOfMonth = startOfMonth(new Date(currentYear, currentMonth));
  const lastDayOfMonth = endOfMonth(new Date(currentYear, currentMonth));

  // 获取当月第一天是星期几 (0-6, 0是星期日)
  const firstDayOfWeek = getDay(firstDayOfMonth);

  // 日历单元格总数 (前一个月的天数 + 当月天数)
  const daysInCalendar = firstDayOfWeek + lastDayOfMonth.getDate();

  // 计算行数 (每行7天)
  const rows = Math.ceil(daysInCalendar / 7);

  // 月份名称
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  // 星期名称
  const weekDayNames = ['日', '一', '二', '三', '四', '五', '六'];

  // 手势相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // 手势处理函数
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragDistance(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const distance = currentX - startX;
    setDragDistance(distance);
  }, [isDragging, startX]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    // 如果拖动距离超过50px，则切换月份
    if (Math.abs(dragDistance) > 50) {
      if (dragDistance > 0) {
        // 向右拖动，切换到上一个月
        goToPreviousMonth();
      } else {
        // 向左拖动，切换到下一个月
        goToNextMonth();
      }
    }

    setIsDragging(false);
    setDragDistance(0);
  }, [isDragging, dragDistance]);

  // 切换到上一个月
  const goToPreviousMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
    setSelectedDate(null);
  };

  // 切换到下一个月
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  // 切换到今天
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // 按日期分组任务，处理跨天任务
  const tasksByDate = useMemo(() => {
    const result: Record<string, TaskItem[]> = {};

    // 处理所有任务，包括跨天任务
    tasks.forEach(task => {
      // 获取任务开始时间和结束时间
      const startDate = task.startTime ? new Date(task.startTime) : (task.createdAt ? new Date(task.createdAt) : null);
      const endDate = task.dueDate ? new Date(task.dueDate) : (startDate ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) : null);

      // 如果没有有效的日期，跳过该任务
      if (!startDate || !endDate) return;

      // 清除时间部分，只保留日期
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      // 计算任务持续的天数
      const days = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

      // 如果是单日任务
      if (days === 1 || startDate.getTime() === endDate.getTime()) {
        const dateKey = startDate.toISOString().split('T')[0];
        if (!result[dateKey]) {
          result[dateKey] = [];
        }
        result[dateKey].push({ task, status: 'single' });
        return;
      }

      // 处理跨天任务 - 遍历每一天并添加任务
      let currentDate = new Date(startDate);
      let dayCount = 0;

      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        if (!result[dateKey]) {
          result[dateKey] = [];
        }

        // 确定该日期的任务状态（开始、中间、结束）
        let status: 'start' | 'middle' | 'end';
        if (dayCount === 0) {
          status = 'start';
        } else if (currentDate.getTime() === endDate.getTime()) {
          status = 'end';
        } else {
          status = 'middle';
        }

        result[dateKey].push({ task, status });

        // 移至下一天
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        dayCount++;
      }
    });

    return result;
  }, [tasks]);

  return (
    <div className="relative flex flex-row gap-4 h-full">
      {/* 日历主区域 */}
      <div
        className="bg-white/70 dark:bg-gray-900/70 rounded-xl p-4 backdrop-blur-sm overflow-hidden flex-1"
        ref={calendarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 月份导航 */}
        <CalendarHeader
          currentMonth={currentMonth}
          currentYear={currentYear}
          monthNames={monthNames}
          isDragging={isDragging}
          dragDistance={dragDistance}
          goToPreviousMonth={goToPreviousMonth}
          goToNextMonth={goToNextMonth}
          goToToday={goToToday}
        />

        {/* 日历网格 */}
        <CalendarGrid
          currentYear={currentYear}
          currentMonth={currentMonth}
          rows={rows}
          firstDayOfWeek={firstDayOfWeek}
          lastDayOfMonth={lastDayOfMonth}
          weekDayNames={weekDayNames}
          tasksByDate={tasksByDate}
          selectedDate={selectedDate}
          onDateClick={setSelectedDate}
          onTaskClick={onTaskClick || (() => {})}
        />
      </div>

      {/* 任务列表侧边栏 - 使用动画效果弹出 */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${selectedDate ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10'}
        `}
      >
        {selectedDate && (
          <div className="bg-white/70 dark:bg-gray-900/70 rounded-xl p-4 backdrop-blur-sm h-full overflow-auto">
            <TaskList
              selectedDate={selectedDate}
              tasks={tasksByDate[selectedDate.toISOString().split('T')[0]] || []}
              onClose={() => setSelectedDate(null)}
              onTaskClick={onTaskClick || (() => {})}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCalendarView;
