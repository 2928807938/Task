'use client';

import React from 'react';

interface TaskOverviewProps {
  completed: number;
  inProgress: number;
  overdue: number;
}

const TaskOverview: React.FC<TaskOverviewProps> = ({ completed, inProgress, overdue }) => {
  const total = completed + inProgress + overdue;
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const inProgressPercent = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const overduePercent = total > 0 ? Math.round((overdue / total) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
      <h3 className="text-lg font-medium mb-6 text-gray-700">本月任务概览</h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">已完成</span>
            <span className="text-sm font-medium">{completedPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-green-400 h-3 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${completedPercent}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">进行中</span>
            <span className="text-sm font-medium">{inProgressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${inProgressPercent}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">已逾期</span>
            <span className="text-sm font-medium">{overduePercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-red-400 h-3 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${overduePercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskOverview;
