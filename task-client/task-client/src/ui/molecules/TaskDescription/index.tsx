'use client';

import React from 'react';
import {FiList, FiTarget} from 'react-icons/fi';

interface TaskDescriptionProps {
  goal: string;
  requirements: string[];
}

export const TaskDescription: React.FC<TaskDescriptionProps> = ({
  goal,
  requirements
}) => {
  return (
    <div>
      <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">任务详情</h2>

      {/* 任务目标 */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FiTarget className="text-blue-500 mr-2" />
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">目标</h3>
        </div>
        <p className="pl-6 text-gray-600 dark:text-gray-400">{goal}</p>
      </div>

      {/* 任务要求 */}
      <div>
        <div className="flex items-center mb-2">
          <FiList className="text-blue-500 mr-2" />
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">要求</h3>
        </div>
        <ul className="pl-6 space-y-2">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2"></span>
              <span className="text-gray-600 dark:text-gray-400">{req}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskDescription;
