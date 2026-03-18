'use client';

import React, {useMemo, useState} from 'react';
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import {zhCN} from 'date-fns/locale';
import {TodoTask} from '@/types/dashboard-types';

type TaskCalendarProps = {
  tasks: TodoTask[];
  compact?: boolean;
  className?: string;
};

const dateFormat = 'yyyy年MM月';

function parseTaskDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsedDate = parseISO(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getDateKey(day: Date) {
  return format(day, 'yyyy-MM-dd');
}

export function TaskCalendarPanel({tasks, compact = false, className = ''}: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const calendarDays = useMemo(() => {
    const gridStart = startOfWeek(monthStart, {weekStartsOn: 0});
    const gridEnd = endOfWeek(monthEnd, {weekStartsOn: 0});

    return eachDayOfInterval({start: gridStart, end: gridEnd});
  }, [monthEnd, monthStart]);

  const tasksByDate = useMemo(() => {
    const groupedTasks = new Map<string, TodoTask[]>();

    tasks.forEach((task) => {
      const taskDate = parseTaskDate(task.dueDate);
      if (!taskDate) {
        return;
      }

      const key = getDateKey(taskDate);
      const existingTasks = groupedTasks.get(key) ?? [];
      existingTasks.push(task);
      existingTasks.sort((a, b) => {
        const first = parseTaskDate(a.dueDate)?.getTime() ?? 0;
        const second = parseTaskDate(b.dueDate)?.getTime() ?? 0;
        return first - second;
      });
      groupedTasks.set(key, existingTasks);
    });

    return groupedTasks;
  }, [tasks]);

  const selectedDateTasks = useMemo(() => {
    return tasksByDate.get(getDateKey(selectedDate)) ?? [];
  }, [selectedDate, tasksByDate]);

  const currentMonthTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const taskDate = parseTaskDate(task.dueDate);
        return taskDate ? isSameMonth(taskDate, currentMonth) : false;
      })
      .sort((a, b) => {
        const first = parseTaskDate(a.dueDate)?.getTime() ?? 0;
        const second = parseTaskDate(b.dueDate)?.getTime() ?? 0;
        return first - second;
      });
  }, [currentMonth, tasks]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);

    if (!isSameMonth(day, currentMonth)) {
      setCurrentMonth(startOfMonth(day));
    }
  };

  const renderHeader = () => {
    return (
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium" style={{color: 'var(--foreground)'}}>任务日历</h2>
          {!compact && (
            <p className="mt-0.5 text-xs opacity-80" style={{color: 'var(--theme-neutral-500)'}}>
              按日期查看即将到期的任务
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-full p-1 transition-colors"
            style={{backgroundColor: 'var(--theme-card-hover)'}}
            aria-label="上个月"
          >
            <FiChevronLeft className="h-4 w-4" style={{color: 'var(--theme-neutral-500)'}} />
          </button>

          <span className="text-sm font-medium" style={{color: 'var(--foreground)'}}>
            {format(currentMonth, dateFormat, {locale: zhCN})}
          </span>

          <button
            type="button"
            onClick={nextMonth}
            className="rounded-full p-1 transition-colors"
            style={{backgroundColor: 'var(--theme-card-hover)'}}
            aria-label="下个月"
          >
            <FiChevronRight className="h-4 w-4" style={{color: 'var(--theme-neutral-500)'}} />
          </button>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
      <div
        className="overflow-hidden rounded-[24px] p-px"
        style={{backgroundColor: 'var(--theme-card-border)'}}
      >
        <div className="grid grid-cols-7 gap-px" style={{backgroundColor: 'var(--theme-card-border)'}}>
          {weekdays.map((day) => (
            <div
              key={day}
              className="flex h-8 items-center justify-center text-xs font-medium"
              style={{backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-neutral-500)'}}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px" style={{backgroundColor: 'var(--theme-card-border)'}}>
          {calendarDays.map((day) => {
            const dayTasks = tasksByDate.get(getDateKey(day)) ?? [];
            const isCurrentDay = isToday(day);
            const isCurrentMonthDay = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const visibleDots = Math.min(dayTasks.length, compact ? 2 : 3);

            return (
              <button
                key={getDateKey(day)}
                type="button"
                onClick={() => handleDayClick(day)}
                className="group relative aspect-square min-h-[52px] p-2 text-left transition-all"
                style={{
                  backgroundColor: isSelected
                    ? 'rgba(var(--theme-primary-500-rgb), 0.12)'
                    : 'var(--theme-card-bg)',
                  opacity: isCurrentMonthDay ? 1 : 0.42,
                  boxShadow: isSelected ? 'inset 0 0 0 1px rgba(var(--theme-primary-500-rgb), 0.28)' : 'none',
                }}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-1">
                    <div
                      className="flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-semibold leading-none"
                      style={{
                        backgroundColor: isCurrentDay ? 'var(--theme-primary-500)' : isSelected ? 'rgba(var(--theme-primary-500-rgb), 0.12)' : 'transparent',
                        color: isCurrentDay ? '#fff' : isSelected ? 'var(--theme-primary-700)' : 'var(--theme-neutral-700)',
                      }}
                    >
                      {format(day, 'd')}
                    </div>

                    {dayTasks.length > 0 && (
                      <div
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none"
                        style={{
                          backgroundColor: 'rgba(var(--theme-primary-500-rgb), 0.12)',
                          color: 'var(--theme-primary-700)',
                        }}
                      >
                        {dayTasks.length}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {Array.from({length: visibleDots}).map((_, index) => (
                        <span
                          key={index}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{backgroundColor: index === 0 ? 'var(--theme-primary-500)' : 'rgba(var(--theme-primary-500-rgb), 0.45)'}}
                        />
                      ))}
                    </div>

                    {!compact && dayTasks[0] && (
                      <div
                        className="max-w-[72%] truncate text-[10px] font-medium"
                        style={{color: 'var(--theme-neutral-500)'}}
                        title={dayTasks[0].title}
                      >
                        {dayTasks[0].title}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAgenda = () => {
    if (compact) {
      return null;
    }

    const agendaTasks = selectedDateTasks.length > 0 ? selectedDateTasks : currentMonthTasks.slice(0, 6);
    const agendaTitle = selectedDateTasks.length > 0
      ? `${format(selectedDate, 'M月d日', {locale: zhCN})} 的任务`
      : `${format(currentMonth, 'M月', {locale: zhCN})} 即将到期`;
    const agendaHint = selectedDateTasks.length > 0
      ? `共 ${selectedDateTasks.length} 项，点击其他日期可切换`
      : '当前选中日期暂无任务，展示本月最近任务';

    return (
      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border px-4 py-4" style={{borderColor: 'var(--theme-card-border)', backgroundColor: 'color-mix(in srgb, var(--theme-card-bg) 92%, transparent)'}}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold" style={{color: 'var(--foreground)'}}>{agendaTitle}</div>
            <div className="mt-1 text-xs" style={{color: 'var(--theme-neutral-500)'}}>{agendaHint}</div>
          </div>
          <div className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{backgroundColor: 'rgba(var(--theme-primary-500-rgb), 0.1)', color: 'var(--theme-primary-700)'}}>
            {agendaTasks.length} 项
          </div>
        </div>

        {agendaTasks.length > 0 ? (
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {agendaTasks.map((task) => {
              const taskDate = parseTaskDate(task.dueDate);

              return (
                <div
                  key={task.id}
                  className="rounded-[18px] border px-3 py-3"
                  style={{borderColor: 'color-mix(in srgb, var(--theme-card-border) 78%, transparent)', backgroundColor: 'color-mix(in srgb, var(--theme-card-bg) 88%, transparent)'}}
                >
                  <div className="text-sm font-medium leading-5" style={{color: 'var(--foreground)'}}>{task.title}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]" style={{color: 'var(--theme-neutral-500)'}}>
                    <span>{task.projectName || '未归属项目'}</span>
                    <span>·</span>
                    <span>{task.priorityName || '普通优先级'}</span>
                    {taskDate && (
                      <>
                        <span>·</span>
                        <span>{format(taskDate, 'M/d', {locale: zhCN})}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-[20px] border border-dashed text-sm" style={{borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)'}}>
            本月暂无待展示任务
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex min-h-0 flex-col rounded-[28px] px-5 pb-5 pt-5 ${className}`}
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-card-border)',
        boxShadow: '0 18px 42px rgba(15, 23, 42, 0.06)',
      }}
    >
      {renderHeader()}
      {renderCalendar()}
      {renderAgenda()}
    </div>
  );
}

export default TaskCalendarPanel;
