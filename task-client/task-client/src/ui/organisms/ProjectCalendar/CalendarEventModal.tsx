"use client";

import React, {useEffect, useState} from 'react';
import {FiTrash2, FiUsers, FiX} from 'react-icons/fi';
import Button from '@/ui/atoms/Button';
import {Avatar} from '@/ui/atoms/Avatar';
import {CalendarEvent, CalendarEventType} from '@/types/calendar-types';
import {TaskPriority, TaskStatus} from '@/core/domain/entities/task';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  projectId: string;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  projectId
}) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    type: CalendarEventType.OTHER,
    isAllDay: false
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
      });
    } else {
      // 设置默认值
      const now = new Date();
      const endTime = new Date();
      endTime.setHours(now.getHours() + 1);

      setFormData({
        title: '',
        description: '',
        startTime: now,
        endTime: endTime,
        type: CalendarEventType.OTHER,
        isAllDay: false
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: new Date(value) }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 根据事件类型设置颜色
    const eventTypeColors = {
      [CalendarEventType.TASK]: '#3B82F6', // 蓝色
      [CalendarEventType.MEETING]: '#10B981', // 绿色
      [CalendarEventType.MILESTONE]: '#8B5CF6', // 紫色
      [CalendarEventType.DEADLINE]: '#EF4444', // 红色
      [CalendarEventType.OTHER]: '#F59E0B', // 黄色
    };

    const taskStatusColors = {
      [TaskStatus.COMPLETED]: '#10B981', // 绿色
      [TaskStatus.IN_PROGRESS]: '#3B82F6', // 蓝色
      [TaskStatus.WAITING]: '#F59E0B', // 黄色
      [TaskStatus.OVERDUE]: '#EF4444', // 红色
    };

    const color = formData.type === CalendarEventType.TASK && formData.status
      ? taskStatusColors[formData.status]
      : eventTypeColors[formData.type as CalendarEventType];

    onSave({
      id: event?.id || Date.now().toString(),
      title: formData.title || '无标题事件',
      description: formData.description,
      startTime: formData.startTime || new Date(),
      endTime: formData.endTime || new Date(),
      type: formData.type as CalendarEventType,
      status: formData.status,
      priority: formData.priority,
      assignees: formData.assignees || [],
      relatedTaskId: formData.relatedTaskId,
      color,
      isAllDay: formData.isAllDay
    });
  };

  const handleDelete = () => {
    if (event && event.id) {
      onDelete(event.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">
            {event ? '编辑事件' : '添加事件'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              事件标题
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入事件标题"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              事件类型
            </label>
            <select
              name="type"
              value={formData.type || CalendarEventType.OTHER}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={CalendarEventType.TASK}>任务</option>
              <option value={CalendarEventType.MEETING}>会议</option>
              <option value={CalendarEventType.MILESTONE}>里程碑</option>
              <option value={CalendarEventType.DEADLINE}>截止日期</option>
              <option value={CalendarEventType.OTHER}>其他</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isAllDay"
                checked={formData.isAllDay || false}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">全天事件</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始时间
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
                onChange={handleDateChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束时间
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ''}
                onChange={handleDateChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {formData.type === CalendarEventType.TASK && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  任务状态
                </label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={TaskStatus.WAITING}>等待中</option>
                  <option value={TaskStatus.IN_PROGRESS}>进行中</option>
                  <option value={TaskStatus.COMPLETED}>已完成</option>
                  <option value={TaskStatus.OVERDUE}>已逾期</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  优先级
                </label>
                <select
                  name="priority"
                  value={formData.priority || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={TaskPriority.LOW}>低</option>
                  <option value={TaskPriority.MEDIUM}>中</option>
                  <option value={TaskPriority.HIGH}>高</option>
                </select>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="输入事件描述"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiUsers className="mr-1" size={16} />
              负责人
            </label>
            <div className="flex items-center">
              {formData.assignees && formData.assignees.length > 0 ? (
                <div className="flex -space-x-2 mr-2">
                  {formData.assignees.map(assignee => (
                    <Avatar
                      key={assignee.id}
                      name={assignee.name}
                      src={assignee.avatar}
                      size="sm"
                      className="border-2 border-white"
                    />
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-500">未分配</span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                选择负责人
              </Button>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            {event && (
              <Button
                variant="danger"
                size="sm"
                type="button"
                onClick={handleDelete}
                className="flex items-center"
              >
                <FiTrash2 className="mr-1.5" size={14} />
                删除
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={onClose}
              >
                取消
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
              >
                保存
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarEventModal;
