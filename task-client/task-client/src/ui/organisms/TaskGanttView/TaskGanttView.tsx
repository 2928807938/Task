'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ProjectTask} from '@/types/api-types';
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi';
import TaskGanttCard from '@/ui/molecules/TaskGanttCard';
import {useTheme} from '@/ui/theme/themeContext';

interface TaskGanttViewProps {
  tasks: ProjectTask[];
  onTaskClick?: (task: ProjectTask) => void;
  onAddTask?: () => void;
}

export function TaskGanttView({ tasks, onTaskClick, onAddTask }: TaskGanttViewProps) {
  const { theme, isDark } = useTheme();
  
  // 使用useCallback封装日期状态更新函数以确保一致性
  const updateDateState = useCallback((start: Date, end: Date) => {
    // 确保创建新的Date对象来触发React状态更新
    setStartDate(new Date(start));
    setEndDate(new Date(end));

    // 额外的延时更新强制确保渲染
    setTimeout(() => {
      setStartDate(prevDate => new Date(prevDate));
    }, 50);
  }, []);

  // 日期格式化
  const formatDate = (date: Date) => {
    // 确保创建新的日期对象，避免修改原始日期
    const localDate = new Date(date);
    // 使用简单明了的中文日期格式
    return `${localDate.getMonth() + 1}月${localDate.getDate()}日`;
  };

  // 日期范围
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [endDate, setEndDate] = useState(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 30); // 默认显示30天
    return end;
  });

  // 根据任务自动计算最佳日期范围
  useEffect(() => {
    if (tasks.length > 0) {
      // 获取所有任务的开始和结束日期
      const taskDates = tasks.map(task => {
        const start = new Date(task.startTime || task.createdAt || new Date().toISOString());
        const end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        return { start, end };
      });

      // 找出最早的开始日期和最晚的结束日期
      let earliestStart = new Date();
      let latestEnd = new Date();
      earliestStart.setHours(0, 0, 0, 0);
      latestEnd.setHours(0, 0, 0, 0);

      // 初始化为第一个任务的时间
      if (taskDates.length > 0) {
        earliestStart = new Date(taskDates[0].start);
        latestEnd = new Date(taskDates[0].end);
      }

      taskDates.forEach(({ start, end }) => {
        if (start < earliestStart) earliestStart = new Date(start);
        if (end > latestEnd) latestEnd = new Date(end);
      });

      // 检查当前正在进行的任务（跨越今天的任务）
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeTasks = taskDates.filter(
        ({ start, end }) => start <= today && end >= today
      );

      // 如果有活跃任务，确保它们都在视图范围内
      if (activeTasks.length > 0) {
        activeTasks.forEach(({ start, end }) => {
          if (start < earliestStart) earliestStart = new Date(start);
          if (end > latestEnd) latestEnd = new Date(end);
        });
      }

      // 确保日期范围至少包含今天
      if (earliestStart > today) earliestStart = today;
      if (latestEnd < today) latestEnd = today;

      // 计算天数并确保范围合理（例如，如果范围太小，扩展至少14天）
      const daysDiff = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 14) {
        latestEnd = new Date(earliestStart);
        latestEnd.setDate(latestEnd.getDate() + 14);
      }

      // 设置日期范围
      setStartDate(earliestStart);
      setEndDate(latestEnd);
    }
  }, [tasks]);

  // 计算日期范围内所有日期 - 使用字符串形式依赖触发重新计算
  const datesInRange = useMemo(() => {
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, [startDate.toISOString(), endDate.toISOString()]);

  // 处理所有任务，为每个任务计算日期范围
  const tasksWithDates = useMemo(() => {
    return tasks.map(task => {
      // 标准化日期处理函数 - 确保日期被正确解析（不受时区影响）
      const normalizeDate = (dateString: string | undefined | null): Date => {
        if (!dateString) return new Date();

        // 检查日期字符串格式，确保它包含时区信息
        // 如果是简单的日期格式（如YYYY-MM-DD），将其转换为YYYY-MM-DDT00:00:00Z格式
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return new Date(`${dateString}T00:00:00Z`);
        }

        try {
          // 使用UTC处理时间，避免时区问题
          const date = new Date(dateString);
          // 创建基于UTC的日期，只保留年月日
          return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        } catch (e) {
          console.error('无效的日期格式:', dateString);
          return new Date(); // 返回当前日期作为后备
        }
      };

      // 使用startTime字段作为任务开始时间，如果没有则回退到创建时间
      const start = normalizeDate(task.startTime || task.createdAt);
      start.setHours(0, 0, 0, 0); // 确保时间部分被重置为当天的开始

      // 如果有截止日期，使用截止日期作为结束日期；否则使用创建日期后7天作为默认结束日期
      let end;
      if (task.dueDate) {
        end = normalizeDate(task.dueDate);
        end.setHours(23, 59, 59, 999); // 设置为当天的结束时间
      } else {
        end = new Date(start);
        end.setDate(end.getDate() + 7);
        end.setHours(23, 59, 59, 999);
      }

      return {
        ...task,
        start,
        end
      };
    }).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [tasks]);

  // 计算任务在甘特图中的位置和宽度
  const getTaskPosition = (task: ProjectTask & { start: Date; end: Date }) => {
    if (!task.start || !task.end) return { display: 'none' };

    // 计算日期差函数（以天为单位，不进行四舍五入）
    const getDayDifference = (date1: Date, date2: Date): number => {
      // 转换为UTC日期，只保留日期部分，忽略时间部分
      const utcDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
      const utcDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

      // 计算天数差异（使用地板除法确保精确定位）
      return Math.floor((utcDate2 - utcDate1) / (1000 * 60 * 60 * 24));
    };

    // 处理日期边界
    const taskStart = new Date(task.start);
    const taskEnd = new Date(task.end);
    const viewStart = new Date(startDate);
    const viewEnd = new Date(endDate);

    // 设置为当天的开始和结束时间
    taskStart.setHours(0, 0, 0, 0);
    viewStart.setHours(0, 0, 0, 0);
    taskEnd.setHours(23, 59, 59, 999);
    viewEnd.setHours(23, 59, 59, 999);

    // 计算总天数（包含首尾两天）
    const totalDays = getDayDifference(viewStart, viewEnd) + 1;
    const dayWidth = 100 / totalDays; // 每天的宽度百分比

    // 计算任务开始位置（如果任务开始于视图范围之前，则从视图起始位置开始）
    const taskStartDiff = Math.max(0, getDayDifference(viewStart, taskStart));
    const leftPosition = taskStartDiff * dayWidth;

    // 计算任务宽度（确保至少占用一天的宽度）
    // 如果任务结束于视图范围之后，则截断到视图结束位置
    const visibleTaskStart = new Date(Math.max(taskStart.getTime(), viewStart.getTime()));
    const visibleTaskEnd = new Date(Math.min(taskEnd.getTime(), viewEnd.getTime()));

    // 计算可见部分的持续时间（天数）
    const taskDuration = Math.max(1, getDayDifference(visibleTaskStart, visibleTaskEnd) + 1);
    const widthPercent = taskDuration * dayWidth;

    return {
      left: `${leftPosition}%`,
      width: `${widthPercent}%`,
      display: leftPosition > 100 || leftPosition + widthPercent < 0 ? 'none' : 'block'
    };
  };

  // 所有日期控制函数重构，使用共同的updateDateState函数

  // 向前移动日期范围
  const moveDateRangeBack = useCallback(() => {
    const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() - days);

    const newEnd = new Date(endDate);
    newEnd.setDate(newEnd.getDate() - days);

    updateDateState(newStart, newEnd);
  }, [startDate, endDate, updateDateState]);

  // 向后移动日期范围
  const moveDateRangeForward = useCallback(() => {
    const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() + days);

    const newEnd = new Date(endDate);
    newEnd.setDate(newEnd.getDate() + days);

    updateDateState(newStart, newEnd);
  }, [startDate, endDate, updateDateState]);

  // 回到当前日期 - 完全重构以确保一致性
  const goToToday = useCallback(() => {
    // 首先获取今天的日期并重置时间为00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 保持原来的范围宽度
    const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // 设置开始日期为今天
    const newStart = new Date(today);

    // 设置结束日期为开始日期加上原来的范围天数
    const newEnd = new Date(today);
    newEnd.setDate(newEnd.getDate() + days);

    // 使用共同的updateDateState函数更新状态
    updateDateState(newStart, newEnd);
  }, [startDate, endDate, updateDateState]);

  // 扩大日期范围
  const expandDateRange = useCallback(() => {
    const newStart = new Date(startDate); // 保持开始日期不变
    const newEnd = new Date(endDate);
    newEnd.setDate(newEnd.getDate() + 15); // 增加15天

    updateDateState(newStart, newEnd);
  }, [startDate, endDate, updateDateState]);

  // 缩小日期范围
  const shrinkDateRange = useCallback(() => {
    const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return; // 最小显示7天

    const newStart = new Date(startDate); // 保持开始日期不变
    const newEnd = new Date(endDate);
    newEnd.setDate(newEnd.getDate() - 15); // 减少15天

    updateDateState(newStart, newEnd);
  }, [startDate, endDate, updateDateState]);

  // 获取日期单元格的样式 - 使用主题系统
  const getDateCellStyle = (date: Date) => {
    // 创建一个新的日期对象，以确保时区一致性比较
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // 使用getTime()进行比较，确保日期比较准确
    const isToday = compareDate.getTime() === today.getTime();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    return {
      backgroundColor: isToday
        ? isDark ? 'rgba(0, 122, 255, 0.25)' : 'rgba(0, 122, 255, 0.15)'
        : isWeekend
          ? isDark ? 'rgba(84, 84, 88, 0.3)' : 'rgba(0, 0, 0, 0.03)'
          : isDark ? 'rgba(44, 44, 46, 0.4)' : 'rgba(255, 255, 255, 0.8)',
      color: isToday
        ? isDark ? '#64D2FF' : '#007AFF'
        : isWeekend
          ? isDark ? '#98989D' : '#8E8E93'
          : isDark ? '#F2F2F7' : '#1D1D1F'
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* 甘特图头部 - 苹果风格设计 */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-2xl transition-all duration-300" style={{
        background: isDark 
          ? 'linear-gradient(135deg, rgba(28, 28, 30, 0.8) 0%, rgba(44, 44, 46, 0.6) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${isDark ? 'rgba(84, 84, 88, 0.3)' : 'rgba(0, 0, 0, 0.06)'}`,
        boxShadow: isDark 
          ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
      }}>
        <div className="flex items-center space-x-3">
          <button
            onClick={moveDateRangeBack}
            className="p-2.5 rounded-full transition-all duration-200 active:scale-95"
            style={{
              background: isDark 
                ? 'rgba(84, 84, 88, 0.3)'
                : 'rgba(0, 0, 0, 0.04)',
              color: isDark ? '#F2F2F7' : '#1D1D1F',
              border: `1px solid ${isDark ? 'rgba(84, 84, 88, 0.4)' : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: isDark 
                ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 3px rgba(0, 0, 0, 0.2)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(84, 84, 88, 0.5)' : 'rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(84, 84, 88, 0.3)' : 'rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            aria-label="向前移动"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-xl active:scale-95"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)'
                : 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
              color: '#FFFFFF',
              border: 'none',
              boxShadow: isDark 
                ? '0 4px 16px rgba(0, 122, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 4px 16px rgba(0, 122, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = isDark 
                ? '0 6px 20px rgba(0, 122, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 6px 20px rgba(0, 122, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDark 
                ? '0 4px 16px rgba(0, 122, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 4px 16px rgba(0, 122, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
            }}
          >
            今天
          </button>
          <h2 className="text-lg font-semibold tracking-tight" style={{
            color: isDark ? '#F2F2F7' : '#1D1D1F',
            textShadow: isDark ? 'none' : '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </h2>
          <button
            onClick={moveDateRangeForward}
            className="p-2.5 rounded-full transition-all duration-200 active:scale-95"
            style={{
              background: isDark 
                ? 'rgba(84, 84, 88, 0.3)'
                : 'rgba(0, 0, 0, 0.04)',
              color: isDark ? '#F2F2F7' : '#1D1D1F',
              border: `1px solid ${isDark ? 'rgba(84, 84, 88, 0.4)' : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: isDark 
                ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 3px rgba(0, 0, 0, 0.2)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(84, 84, 88, 0.5)' : 'rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(84, 84, 88, 0.3)' : 'rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            aria-label="向后移动"
          >
            <FiChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center bg-opacity-60 rounded-xl p-1" style={{
          background: isDark 
            ? 'rgba(84, 84, 88, 0.2)'
            : 'rgba(0, 0, 0, 0.03)',
          border: `1px solid ${isDark ? 'rgba(84, 84, 88, 0.3)' : 'rgba(0, 0, 0, 0.06)'}`,
          boxShadow: isDark 
            ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : 'inset 0 1px 0 rgba(255, 255, 255, 0.7)'
        }}>
          <button
            onClick={shrinkDateRange}
            className="px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-lg active:scale-95"
            style={{
              background: isDark 
                ? 'rgba(84, 84, 88, 0.4)'
                : 'rgba(255, 255, 255, 0.8)',
              color: isDark ? '#F2F2F7' : '#1D1D1F',
              border: `1px solid ${isDark ? 'rgba(84, 84, 88, 0.5)' : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: isDark 
                ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(84, 84, 88, 0.6)' : 'rgba(255, 255, 255, 0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(84, 84, 88, 0.4)' : 'rgba(255, 255, 255, 0.8)';
            }}
          >
            -
          </button>
          <button
            onClick={expandDateRange}
            className="px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-lg active:scale-95 ml-1"
            style={{
              background: isDark 
                ? 'rgba(84, 84, 88, 0.4)'
                : 'rgba(255, 255, 255, 0.8)',
              color: isDark ? '#F2F2F7' : '#1D1D1F',
              border: `1px solid ${isDark ? 'rgba(84, 84, 88, 0.5)' : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: isDark 
                ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(84, 84, 88, 0.6)' : 'rgba(255, 255, 255, 0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(84, 84, 88, 0.4)' : 'rgba(255, 255, 255, 0.8)';
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* 甘特图主体 - 使用主题系统 */}
      <div 
        className="rounded-2xl overflow-auto shadow-sm" 
        style={{ 
          maxHeight: '70vh',
          border: `1px solid ${isDark ? 'rgba(84, 84, 88, 0.3)' : 'rgba(0, 0, 0, 0.08)'}`,
          background: isDark 
            ? 'linear-gradient(135deg, rgba(28, 28, 30, 0.9) 0%, rgba(44, 44, 46, 0.7) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: isDark 
            ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
        }}
      >
        {/* 日期头部 - 增强吸顶效果，使用主题系统 */}
        <div className="sticky top-0 z-20 flex backdrop-blur-md border-b-2 shadow-sm" style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(28, 28, 30, 0.95) 0%, rgba(44, 44, 46, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          borderBottomColor: isDark ? 'rgba(84, 84, 88, 0.5)' : 'rgba(0, 0, 0, 0.08)',
          boxShadow: isDark 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="flex-1 flex">
            {datesInRange.map((date, index) => (
              <div
                key={date.toISOString()}
                className="flex-shrink-0 p-3 flex flex-col items-center justify-center border-r last:border-r-0 text-xs font-medium transition-all duration-200"
                style={{
                  width: `${100 / datesInRange.length}%`,
                  minWidth: '50px',
                  borderRightColor: isDark ? 'rgba(84, 84, 88, 0.3)' : 'rgba(0, 0, 0, 0.06)',
                  ...getDateCellStyle(date)
                }}
              >
                <span className="text-sm font-bold" style={{
                  color: 'inherit'
                }}>
                  {date.getDate()}
                </span>
                <span className="text-xs mt-1 opacity-75" style={{
                  color: 'inherit'
                }}>
                  {['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 任务列表 - 重构布局，删除左侧列 */}
        <div className="relative">
          {tasksWithDates.length > 0 ? (
            tasksWithDates.map((task) => (
              <div 
                key={task.id} 
                className="relative border-b last:border-b-0 transition-all duration-200" 
                style={{ 
                  height: '70px',
                  borderBottomColor: isDark ? 'rgba(84, 84, 88, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(84, 84, 88, 0.2)' : 'rgba(0, 0, 0, 0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* 使用样式工具函数获取状态样式 */}
                {(() => {
                  // 直接使用任务对象中的状态颜色和优先级颜色
                  const statusColor = task.statusColor || '#9ca3af'; // 默认灰色
                  const priorityColor = task.priorityColor || '#9ca3af'; // 默认灰色

                  // 转换颜色为rgba格式用于背景
                  const hexToRgba = (hex: string, alpha = 0.2) => {
                    // 处理简写的颜色代码
                    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

                    // 正常的颜色代码处理
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
                    if (!result) return `rgba(156, 163, 175, ${alpha})`; // 默认灰色

                    const r = parseInt(result[1], 16);
                    const g = parseInt(result[2], 16);
                    const b = parseInt(result[3], 16);

                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                  };

                  // 创建甘特图任务条的样式
                  const ganttBarStyle = {
                    ...getTaskPosition(task),
                    top: '4px',
                    bottom: '4px'
                  };

                  return (
                    <TaskGanttCard
                      task={task}
                      style={ganttBarStyle}
                      onClick={() => onTaskClick && onTaskClick(task)}
                    />
                  );
                })()}
              </div>
            ))
          ) : (
            <div className="py-8 text-center" style={{
              color: isDark ? 'rgba(242, 242, 247, 0.6)' : 'rgba(29, 29, 31, 0.6)'
            }}>
              没有任务或任务没有设置开始和结束日期
            </div>
          )}
        </div>
      </div>

      {/* 甘特图任务按钮已移除 */}
    </div>
  );
}

export default TaskGanttView;