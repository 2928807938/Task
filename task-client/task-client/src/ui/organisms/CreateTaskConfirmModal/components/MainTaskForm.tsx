"use client";

import React from "react";
import {FiAlertCircle, FiClock, FiFlag, FiUser} from "react-icons/fi";
import UserSearchSelect from "@/ui/molecules/UserSearchSelect";

interface MainTaskFormProps {
  taskName: string;
  setTaskName: React.Dispatch<React.SetStateAction<string>>;
  taskDescription: string;
  setTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  assigneeId?: string;
  setAssigneeId: React.Dispatch<React.SetStateAction<string | undefined>>;
  totalHours?: number;
  setTotalHours: React.Dispatch<React.SetStateAction<number>>;
  priorityScore?: number;
  setPriorityScore: React.Dispatch<React.SetStateAction<number>>;
  errors: {
    taskName?: string;
    taskDescription?: string;
  };
  projectId?: string; // 项目ID，用于获取项目成员
  isMobile?: boolean; // 响应式设计标识
}

/**
 * 主任务表单组件 -
 *
 * 遵循苹果设计规范的主任务信息编辑表单
 */
const MainTaskForm: React.FC<MainTaskFormProps> = ({
  taskName,
  setTaskName,
  taskDescription,
  setTaskDescription,
  assigneeId,
  setAssigneeId,
  totalHours,
  setTotalHours,
  priorityScore,
  setPriorityScore,
  errors,
  projectId
}) => {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">任务详情</h3>

      <div className="space-y-5">
        {/* 任务名称 - 苹果风格输入框 */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span className="mr-1.5 text-blue-500">•</span>
            任务名称
          </label>
          <div className="relative">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border ${
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

        {/* 任务描述 - 苹果风格文本区域 */}
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
            } focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all min-h-[120px] text-gray-800 dark:text-gray-200 dark:bg-gray-800/70 placeholder-gray-400 resize-none`}
            placeholder="描述任务细节和目标..."
          />
          {errors.taskDescription && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center">
              <FiAlertCircle className="mr-1.5" size={14} />
              {errors.taskDescription}
            </p>
          )}
        </div>

        {/* 任务属性分组 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 责任人 - 苹果风格下拉选择 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiUser className="mr-1.5 text-indigo-500" size={15} />
              责任人
            </label>
            <UserSearchSelect
              selectedUserId={assigneeId}
              onUserSelect={setAssigneeId}
              placeholder="选择责任人"
              className="apple-select"
              projectId={projectId}
            />
          </div>

          {/* 总工时 - 更现代的数字输入框 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiClock className="mr-1.5 text-blue-500" size={15} />
              预计工时
            </label>
            <div className="relative">
              <input
                type="number"
                value={totalHours || ''}
                onChange={(e) => setTotalHours(e.target.value ? parseFloat(e.target.value) : 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all text-gray-800 dark:text-gray-200 dark:bg-gray-800/70 placeholder-gray-400"
                placeholder="输入工时"
                step="0.5"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
                小时
              </span>
            </div>
          </div>
        </div>

        {/* 优先级分数 - 苹果风格滑块 */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FiFlag className="mr-1.5 text-orange-500" size={15} />
            优先级
          </label>
          <div className="mt-1 mb-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
              <span>低</span>
              <span>中</span>
              <span>高</span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="100"
                value={priorityScore || 50}
                onChange={(e) => setPriorityScore(parseInt(e.target.value))}
                className="flex-grow h-2 appearance-none rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none cursor-pointer"
                style={{
                  background: priorityScore
                    ? `linear-gradient(to right, ${priorityScore >= 70 ? '#ef4444' : priorityScore >= 40 ? '#f59e0b' : '#22c55e'} 0%, ${priorityScore >= 70 ? '#ef4444' : priorityScore >= 40 ? '#f59e0b' : '#22c55e'} ${priorityScore}%, #e5e7eb ${priorityScore}%, #e5e7eb 100%)`
                    : undefined
                }}
              />
              <div className="text-sm font-medium w-12 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                {priorityScore || 50}%
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priorityScore && priorityScore >= 70 ? '#ef4444' : priorityScore && priorityScore >= 40 ? '#f59e0b' : '#22c55e' }}></div>
              <span className="ml-1.5 text-sm text-gray-600 dark:text-gray-300">
                {priorityScore && priorityScore >= 70 ? '高优先级' : priorityScore && priorityScore >= 40 ? '中优先级' : '低优先级'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
