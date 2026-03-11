'use client';

import React from 'react';
import {Avatar} from '@/ui/atoms/Avatar';
import {FiCalendar} from 'react-icons/fi';

interface TaskHeaderProps {
  title: string;
  status: '进行中' | '已完成' | '待开始' | '已逾期';
  assignee: string;
  dueDate: string;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  title,
  status,
  assignee,
  dueDate
}) => {
  const getStatusColor = () => {
    switch (status) {
      case '进行中': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case '已完成': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case '待开始': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case '已逾期': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <div className="mt-2 md:mt-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center mr-6">
          <span className="mr-2">负责人:</span>
          <div className="flex items-center">
            <Avatar name={assignee} size="sm" className="mr-2" />
            <span>{assignee}</span>
          </div>
        </div>

        <div className="flex items-center mt-2 sm:mt-0">
          <span className="mr-2">截止日:</span>
          <div className="flex items-center">
            <FiCalendar className="mr-1" />
            <span>{dueDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
