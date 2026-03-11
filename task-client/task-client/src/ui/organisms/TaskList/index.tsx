'use client';

import React, {useState} from 'react';
import {Task, TaskPriority, TaskStatus} from '@/core/domain/entities/task';
import {FiCalendar, FiChevronDown, FiChevronUp, FiClock, FiEdit2, FiFlag, FiSearch, FiTrash2} from 'react-icons/fi';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onAddTask?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onAddTask }) => {
  // 移除了重复的筛选状态变量，因为筛选功能已经在TaskToolbar中实现
  const [sortField, setSortField] = useState<keyof Task | ''>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 获取优先级标签样式
  const getPriorityBadge = (priority: TaskPriority) => {
    const classes = {
      [TaskPriority.HIGH]: 'bg-red-50 text-red-700 border-red-200',
      [TaskPriority.MEDIUM]: 'bg-amber-50 text-amber-700 border-amber-200',
      [TaskPriority.LOW]: 'bg-green-50 text-green-700 border-green-200',
      [TaskPriority.CUSTOM]: 'bg-purple-50 text-purple-700 border-purple-200',
    };

    const labels = {
      [TaskPriority.HIGH]: '高',
      [TaskPriority.MEDIUM]: '中',
      [TaskPriority.LOW]: '低',
      [TaskPriority.CUSTOM]: '自定义',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center ${classes[priority]}`}>
        <FiFlag className="w-3 h-3 mr-1" />
        {labels[priority]}
      </span>
    );
  };

  // 获取状态标签样式
  const getStatusBadge = (status: TaskStatus) => {
    const classes = {
      [TaskStatus.IN_PROGRESS]: 'bg-blue-50 text-blue-700 border-blue-200',
      [TaskStatus.COMPLETED]: 'bg-green-50 text-green-700 border-green-200',
      [TaskStatus.OVERDUE]: 'bg-red-50 text-red-700 border-red-200',
      [TaskStatus.WAITING]: 'bg-amber-50 text-amber-700 border-amber-200',
    };

    const labels = {
      [TaskStatus.IN_PROGRESS]: '进行中',
      [TaskStatus.COMPLETED]: '已完成',
      [TaskStatus.OVERDUE]: '已逾期',
      [TaskStatus.WAITING]: '待处理',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center ${classes[status]}`}>
        <FiClock className="w-3 h-3 mr-1" />
        {labels[status]}
      </span>
    );
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 处理排序
  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 获取排序图标
  const getSortIcon = (field: keyof Task) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ?
      <FiChevronUp className="w-4 h-4 ml-1" /> :
      <FiChevronDown className="w-4 h-4 ml-1" />;
  };

  // 只进行排序，不再进行筛选，因为筛选已经在TaskManagementTemplate中完成
  const filteredAndSortedTasks = tasks
    // 排序
    .sort((a, b) => {
      if (!sortField) return 0;

      // 处理不同字段类型的排序
      if (sortField === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (sortField === 'title') {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }

      if (sortField === 'priority') {
        const priorityOrder = {
          [TaskPriority.HIGH]: 3,
          [TaskPriority.MEDIUM]: 2,
          [TaskPriority.LOW]: 1,
          [TaskPriority.CUSTOM]: 0
        };
        return sortDirection === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      if (sortField === 'status') {
        const statusOrder = {
          [TaskStatus.OVERDUE]: 4,
          [TaskStatus.IN_PROGRESS]: 3,
          [TaskStatus.WAITING]: 2,
          [TaskStatus.COMPLETED]: 1
        };
        return sortDirection === 'asc'
          ? statusOrder[a.status] - statusOrder[b.status]
          : statusOrder[b.status] - statusOrder[a.status];
      }

      if (sortField === 'progress') {
        const progressA = a.progress || 0;
        const progressB = b.progress || 0;
        return sortDirection === 'asc' ? progressA - progressB : progressB - progressA;
      }

      return 0;
    });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {/* 删除了重复的搜索栏、筛选按钮和新增任务按钮，这些功能已经在TaskToolbar中提供 */}

      {/* 任务列表 */}
      <div className="overflow-x-auto">
        {filteredAndSortedTasks.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    任务名称
                    {getSortIcon('title')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center">
                    优先级
                    {getSortIcon('priority')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  负责人
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center">
                    截止日期
                    {getSortIcon('dueDate')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort('progress')}
                >
                  <div className="flex items-center">
                    进度
                    {getSortIcon('progress')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    状态
                    {getSortIcon('status')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredAndSortedTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(task.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.assignee && (
                      <div className="flex items-center">
                        {task.assignee.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full mr-2 border-2 border-white shadow-sm"
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-2 text-white shadow-sm">
                            <span className="text-xs font-medium">
                              {task.assignee.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="text-sm text-gray-900">{task.assignee.name}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.dueDate ? (
                      <div className="text-sm text-gray-600 flex items-center">
                        <FiCalendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {formatDate(task.dueDate)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner mr-2">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-indigo-500 to-indigo-400"
                          style={{ width: `${task.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{task.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(task.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => onEdit && onEdit(task.id)}
                        className="text-indigo-500 hover:text-indigo-700 transition-colors duration-200 p-1.5 hover:bg-indigo-50 rounded-full"
                        title="编辑"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(task.id)}
                        className="text-red-400 hover:text-red-600 transition-colors duration-200 p-1.5 hover:bg-red-50 rounded-full"
                        title="删除"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FiSearch className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">没有找到匹配的任务</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              没有找到符合条件的任务
            </p>
          </div>
        )}
      </div>

      {/* 分页信息 */}
      {filteredAndSortedTasks.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <div>显示 {filteredAndSortedTasks.length} 个任务（共 {tasks.length} 个）</div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
