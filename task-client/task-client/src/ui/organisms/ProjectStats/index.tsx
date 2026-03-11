"use client";

import React from 'react';
import StatCard from '@/ui/molecules/StatCard';
import ProgressBar from '@/ui/atoms/ProgressBar';

interface ProjectStatsProps {
  taskCount?: number;
  completedTaskCount?: number;
  memberCount?: number;
  progress?: number;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({
  taskCount = 0,
  completedTaskCount = 0,
  memberCount = 0,
  progress = 0
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard 
        title="总任务数" 
        value={taskCount} 
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">完成进度</p>
          <ProgressBar 
            percentage={progress} 
            colors={{
              low: 'bg-green-500',
              medium: 'bg-blue-500',
              high: 'bg-purple-500'
            }}
          />
        </div>
      </StatCard>
      
      <StatCard 
        title="当前进行任务" 
        value={taskCount - completedTaskCount} 
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">完成率</p>
          <ProgressBar 
            percentage={taskCount > 0 ? (completedTaskCount / taskCount) * 100 : 0} 
            colors={{
              low: 'bg-blue-500',
              medium: 'bg-blue-400',
              high: 'bg-blue-300'
            }}
            label={`${taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0}%`}
            labelPosition="right"
          />
        </div>
      </StatCard>
      
      <StatCard 
        title="团队成员" 
        value={memberCount} 
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">人均任务数</p>
          <ProgressBar 
            percentage={memberCount > 0 ? Math.min((taskCount / memberCount) * 20, 100) : 0} 
            colors={{
              low: 'bg-blue-500',
              medium: 'bg-blue-400',
              high: 'bg-blue-300'
            }}
            label={memberCount > 0 ? `${Math.round(taskCount / memberCount)}个` : "0个"}
            labelPosition="right"
          />
        </div>
      </StatCard>
    </div>
  );
};

export default ProjectStats;
