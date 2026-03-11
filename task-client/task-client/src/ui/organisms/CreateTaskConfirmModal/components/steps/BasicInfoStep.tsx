"use client";

import React from 'react';
import {FiAlertCircle, FiEdit, FiUser} from 'react-icons/fi';
import UserDisplay from '@/ui/molecules/UserDisplay';

interface BasicInfoStepProps {
  taskName: string;
  setTaskName: (value: string) => void;
  taskDescription: string;
  setTaskDescription: (value: string) => void;
  assigneeId?: string;
  setAssigneeId: (value: string | undefined) => void;  // 保留接口兼容性，但实际上不会被使用
  errors: {
    taskName?: string;
    taskDescription?: string;
  };
  projectId?: string;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  taskName,
  setTaskName,
  taskDescription,
  setTaskDescription,
  assigneeId,
  setAssigneeId,
  errors,
  projectId
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">基本信息</h3>

      {/* 任务名称 */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span className="mr-1.5 text-blue-500">•</span>
          任务名称
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
            <FiEdit size={16} />
          </div>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
              errors.taskName ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all text-gray-800 dark:text-gray-200 dark:bg-gray-800/70 placeholder-gray-400`}
            placeholder="输入任务名称"
          />
        </div>
        {errors.taskName && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center">
            <FiAlertCircle className="mr-1.5" size={14} />
            {errors.taskName}
          </p>
        )}
      </div>

      {/* 任务描述 */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span className="mr-1.5 text-blue-500">•</span>
          任务描述
        </label>
        <textarea
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.taskDescription ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all min-h-[150px] text-gray-800 dark:text-gray-200 dark:bg-gray-800/70 placeholder-gray-400 resize-none`}
          placeholder="描述任务细节和目标..."
        />
        {errors.taskDescription && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center">
            <FiAlertCircle className="mr-1.5" size={14} />
            {errors.taskDescription}
          </p>
        )}
      </div>

      {/* 责任人（只读显示） */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <FiUser className="mr-1.5 text-indigo-500" size={15} />
          责任人
        </label>
        <UserDisplay
          userId={assigneeId}
          projectId={projectId}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;
