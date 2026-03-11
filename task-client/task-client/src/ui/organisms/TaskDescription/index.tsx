'use client';

import React from 'react';
import {FiCheckSquare, FiTarget} from 'react-icons/fi';

interface TaskDescriptionProps {
  goal: string;
  requirements: string[];
}

export const TaskDescription: React.FC<TaskDescriptionProps> = ({
  goal,
  requirements
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <FiTarget className="mr-2 text-blue-500" />
          目标
        </h3>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{goal}</p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <FiCheckSquare className="mr-2 text-blue-500" />
          要求
        </h3>
        <ul className="mt-2 space-y-2">
          {requirements.map((requirement, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2">•</span>
              <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
