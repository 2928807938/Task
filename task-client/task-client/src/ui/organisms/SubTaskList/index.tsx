'use client';

import React from 'react';
import {FiAlertTriangle, FiCheckCircle, FiCircle} from 'react-icons/fi';
import {Avatar} from '@/ui/atoms/Avatar';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assignee: string;
  isHighRisk?: boolean;
}

interface SubTaskListProps {
  subTasks: SubTask[];
  totalTasks: number;
  completedTasks: number;
}

export const SubTaskList: React.FC<SubTaskListProps> = ({
  subTasks,
  totalTasks,
  completedTasks
}) => {
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">子任务 ({completedTasks}/{totalTasks})</h3>
        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-2">
        {subTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              task.completed 
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
            } ${task.isHighRisk && !task.completed ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : ''}`}
          >
            <div className="flex items-center">
              {task.completed ? (
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-3" />
              ) : (
                <FiCircle className="h-5 w-5 text-gray-400 mr-3" />
              )}
              <span className={`font-medium ${task.completed ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {task.title}
              </span>
              {task.isHighRisk && !task.completed && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  <FiAlertTriangle className="mr-1" />
                  高风险
                </span>
              )}
            </div>

            <div className="flex items-center">
              <Avatar name={task.assignee} size="xs" className="ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
