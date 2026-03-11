"use client";

import React, {useCallback, useEffect, useState} from 'react';
import {Calendar, momentLocalizer, Views} from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';
import {FiChevronLeft, FiChevronRight, FiFilter, FiPlus} from 'react-icons/fi';
import Button from '@/ui/atoms/Button';
import {Avatar} from '@/ui/atoms/Avatar';
import {TaskPriority, TaskStatus} from '@/core/domain/entities/task';
import CalendarEventModal from './CalendarEventModal';
import {CalendarEvent, CalendarEventType} from '@/types/calendar-types';

// 设置本地化
moment.locale('zh-cn');
const localizer = momentLocalizer(moment);

// 事件颜色映射
const eventTypeColors = {
  [CalendarEventType.TASK]: '#3B82F6', // 蓝色
  [CalendarEventType.MEETING]: '#10B981', // 绿色
  [CalendarEventType.MILESTONE]: '#8B5CF6', // 紫色
  [CalendarEventType.DEADLINE]: '#EF4444', // 红色
  [CalendarEventType.OTHER]: '#F59E0B', // 黄色
};

// 任务状态颜色映射
const taskStatusColors = {
  [TaskStatus.COMPLETED]: '#10B981', // 绿色
  [TaskStatus.IN_PROGRESS]: '#3B82F6', // 蓝色
  [TaskStatus.WAITING]: '#F59E0B', // 黄色
  [TaskStatus.OVERDUE]: '#EF4444', // 红色
};

interface ProjectCalendarProps {
  projectId: string;
  tasks: any[]; // 项目任务数据
}

const ProjectCalendar: React.FC<ProjectCalendarProps> = ({ projectId, tasks }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<CalendarEventType | 'ALL'>('ALL');

  // 将任务转换为日历事件
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const taskEvents = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        start: new Date(task.createdAt),
        end: new Date(task.dueDate || task.createdAt),
        startTime: new Date(task.createdAt),
        endTime: new Date(task.dueDate || task.createdAt),
        type: CalendarEventType.TASK,
        status: task.status === 'IN_PROGRESS' ? TaskStatus.IN_PROGRESS :
                task.status === 'COMPLETED' ? TaskStatus.COMPLETED :
                task.status === 'OVERDUE' ? TaskStatus.OVERDUE : TaskStatus.WAITING,
        priority: task.priority === 'HIGH' ? TaskPriority.HIGH :
                  task.priority === 'MEDIUM' ? TaskPriority.MEDIUM : TaskPriority.LOW,
        assignees: task.assigneeId ? [{
          id: task.assigneeId,
          name: task.assigneeName,
          avatar: task.assigneeAvatar
        }] : [],
        relatedTaskId: task.id,
        color: task.status === 'COMPLETED' ? taskStatusColors[TaskStatus.COMPLETED] :
               task.status === 'IN_PROGRESS' ? taskStatusColors[TaskStatus.IN_PROGRESS] :
               task.status === 'OVERDUE' ? taskStatusColors[TaskStatus.OVERDUE] :
               taskStatusColors[TaskStatus.WAITING],
        allDay: true,
        isAllDay: true
      }));

      // 添加一些示例会议和里程碑事件
      const exampleEvents = [
        {
          id: 'meeting-1',
          title: '项目周会',
          description: '讨论本周进度和下周计划',
          start: moment().add(1, 'days').hour(10).minute(0).second(0).toDate(),
          end: moment().add(1, 'days').hour(11).minute(30).second(0).toDate(),
          startTime: moment().add(1, 'days').hour(10).minute(0).second(0).toDate(),
          endTime: moment().add(1, 'days').hour(11).minute(30).second(0).toDate(),
          type: CalendarEventType.MEETING,
          assignees: [
            { id: '1', name: '张明' },
            { id: '2', name: '李华' }
          ],
          color: eventTypeColors[CalendarEventType.MEETING],
          allDay: false,
          isAllDay: false
        },
        {
          id: 'milestone-1',
          title: '第一阶段完成',
          description: '完成项目第一阶段的所有任务',
          start: moment().add(7, 'days').hour(0).minute(0).second(0).toDate(),
          end: moment().add(7, 'days').hour(23).minute(59).second(59).toDate(),
          startTime: moment().add(7, 'days').hour(0).minute(0).second(0).toDate(),
          endTime: moment().add(7, 'days').hour(23).minute(59).second(59).toDate(),
          type: CalendarEventType.MILESTONE,
          color: eventTypeColors[CalendarEventType.MILESTONE],
          allDay: true,
          isAllDay: true
        },
        {
          id: 'deadline-1',
          title: '提交项目报告截止日期',
          description: '需要提交项目进度报告',
          start: moment().add(14, 'days').hour(18).minute(0).second(0).toDate(),
          end: moment().add(14, 'days').hour(18).minute(0).second(0).toDate(),
          startTime: moment().add(14, 'days').hour(18).minute(0).second(0).toDate(),
          endTime: moment().add(14, 'days').hour(18).minute(0).second(0).toDate(),
          type: CalendarEventType.DEADLINE,
          color: eventTypeColors[CalendarEventType.DEADLINE],
          allDay: false,
          isAllDay: false
        }
      ];

      setEvents([...taskEvents, ...exampleEvents]);
    }
  }, [tasks]);

  // 过滤事件
  const filteredEvents = filterType === 'ALL'
    ? events
    : events.filter(event => event.type === filterType);

  // 处理事件点击
  const handleSelectEvent = useCallback((event: any, e: React.SyntheticEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  // 处理添加新事件
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  // 处理保存事件
  const handleSaveEvent = (event: CalendarEvent) => {
    if (selectedEvent) {
      // 更新现有事件
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    } else {
      // 添加新事件
      setEvents(prev => [...prev, { ...event, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  // 处理删除事件
  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setIsModalOpen(false);
  };

  // 自定义事件渲染
  const eventPropGetter = (event: any) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '4px',
        opacity: 0.8,
        color: '#fff',
        border: '0px',
        display: 'block'
      }
    };
  };

  // 自定义事件组件
  const EventComponent = ({ event, title }: { event: any; title: string }) => (
    <div className="flex items-center p-1">
      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: event.color }} />
      <span className="text-xs font-medium truncate">{event.title}</span>
      {event.assignees && event.assignees.length > 0 && (
        <Avatar
          name={event.assignees[0].name}
          src={event.assignees[0].avatar}
          size="xs"
          className="ml-auto"
        />
      )}
    </div>
  );

  return (
    <div className="h-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-2 p-1"
            onClick={() => setDate(prev => moment(prev).subtract(1, view === Views.MONTH ? 'month' : view === Views.WEEK ? 'week' : 'day').toDate())}
          >
            <FiChevronLeft size={16} />
          </Button>
          <h3 className="text-lg font-medium">
            {moment(date).format(view === Views.MONTH ? 'YYYY年MM月' : view === Views.WEEK ? 'YYYY年第ww周' : 'YYYY年MM月DD日')}
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 p-1"
            onClick={() => setDate(prev => moment(prev).add(1, view === Views.MONTH ? 'month' : view === Views.WEEK ? 'week' : 'day').toDate())}
          >
            <FiChevronRight size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-4"
            onClick={() => setDate(new Date())}
          >
            今天
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <FiFilter className="mr-1.5 text-gray-500" size={14} />
            <select
              className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as CalendarEventType | 'ALL')}
            >
              <option value="ALL">全部</option>
              <option value={CalendarEventType.TASK}>任务</option>
              <option value={CalendarEventType.MEETING}>会议</option>
              <option value={CalendarEventType.MILESTONE}>里程碑</option>
              <option value={CalendarEventType.DEADLINE}>截止日期</option>
              <option value={CalendarEventType.OTHER}>其他</option>
            </select>
          </div>

          <div className="flex items-center">
            <select
              className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={view}
              onChange={(e) => setView(e.target.value as any)}
            >
              <option value={Views.MONTH}>月视图</option>
              <option value={Views.WEEK}>周视图</option>
              <option value={Views.DAY}>日视图</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="flex items-center"
            onClick={handleAddEvent}
          >
            <FiPlus className="mr-1.5" size={14} />
            添加事件
          </Button>
        </div>
      </div>

      <div className="h-[calc(100vh-300px)] min-h-[500px] bg-white rounded-lg overflow-hidden">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          view={view as any}
          onView={(newView) => setView(newView as 'month' | 'week' | 'day')}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          components={{
            event: EventComponent
          }}
          formats={{
            monthHeaderFormat: 'YYYY年MM月',

            dayHeaderFormat: 'YYYY年MM月DD日',
            dayRangeHeaderFormat: (range: { start: Date; end: Date }) => `${moment(range.start).format('YYYY年MM月DD日')} - ${moment(range.end).format('DD日')}`
          }}
          messages={{
            today: '今天',
            previous: '上一页',
            next: '下一页',
            month: '月',
            week: '周',
            day: '日',
            agenda: '议程',
            date: '日期',
            time: '时间',
            event: '事件',
            allDay: '全天',
            work_week: '工作周',
            yesterday: '昨天',
            tomorrow: '明天',
            noEventsInRange: '此时间范围内没有事件'
          }}
          culture="zh-CN"
        />
      </div>

      {isModalOpen && (
        <CalendarEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default ProjectCalendar;
