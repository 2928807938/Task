'use client';

import React, {useState} from 'react';
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    parseISO,
    startOfMonth,
    subMonths
} from 'date-fns';
import {zhCN} from 'date-fns/locale';
import {TodoTask} from './MyTasksPanel';

type TaskCalendarProps = {
  tasks: TodoTask[];
};

export function TaskCalendarPanel({ tasks }: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const dateFormat = "yyyy年MM月";
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 计算某一天的任务数量
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const taskDate = parseISO(task.dueDate);
      return isSameDay(taskDate, day);
    });
  };

  // 渲染日历头部
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>任务日历</h2>
          <p className="text-xs mt-0.5 opacity-80" style={{ color: 'var(--theme-neutral-500)' }}>按日期查看即将到期的任务</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-1 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--theme-card-hover)' }}
            aria-label="上个月"
          >
            <FiChevronLeft className="h-4 w-4" style={{ color: 'var(--theme-neutral-500)' }} />
          </button>

          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            {format(currentMonth, dateFormat, { locale: zhCN })}
          </span>

          <button
            onClick={nextMonth}
            className="p-1 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--theme-card-hover)' }}
            aria-label="下个月"
          >
            <FiChevronRight className="h-4 w-4" style={{ color: 'var(--theme-neutral-500)' }} />
          </button>
        </div>
      </div>
    );
  };

  // 渲染日历
  const renderCalendar = () => {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
      <div className="rounded-md overflow-hidden" style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}>
        {/* 星期标题 */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--theme-card-border)', backgroundColor: 'var(--theme-neutral-100)' }}>
          {weekdays.map((day, index) => (
            <div key={index} className="text-center py-2 text-xs font-medium" style={{ color: 'var(--theme-neutral-500)' }}>
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={i}
                className={`
                  min-h-[60px] p-1
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                `}
                style={{
                  borderBottom: '1px solid var(--theme-card-border)',
                  borderRight: '1px solid var(--theme-card-border)',
                  backgroundColor: isCurrentDay ? 'rgba(var(--theme-primary-500-rgb), 0.1)' : 'transparent'
                }}
              >
                <div className="flex flex-col h-full">
                  <div 
                    className="text-xs self-center leading-5 w-5 h-5 rounded-full text-center"
                    style={{
                      backgroundColor: isCurrentDay ? 'var(--theme-primary-500)' : 'transparent',
                      color: isCurrentDay ? 'white' : 'var(--theme-neutral-700)'
                    }}
                  >
                    {format(day, 'd')}
                  </div>

                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayTasks.length > 0 && (
                      <div className="flex flex-col space-y-1">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className="text-[9px] px-1 py-0.5 rounded truncate"
                            style={{
                              backgroundColor: 'rgba(var(--theme-primary-500-rgb), 0.1)',
                              color: 'var(--theme-primary-600)',
                              border: '1px solid rgba(var(--theme-primary-500-rgb), 0.2)'
                            }}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}

                        {dayTasks.length > 2 && (
                          <div className="text-[9px] pl-1" style={{ color: 'var(--theme-neutral-500)' }}>
                            +{dayTasks.length - 2} 项
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="rounded-lg pt-5 px-5 pb-6"
      style={{ 
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-card-border)',
        boxShadow: 'var(--theme-shadow-sm)'
      }}
    >
      {renderHeader()}
      {renderCalendar()}
    </div>
  );
}

export default TaskCalendarPanel;
