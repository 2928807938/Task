'use client';

import React from 'react';
import StatCard from '../../atoms/StatCard';
import TaskTrendChart from '../../molecules/TaskTrendChart';
import TaskOverview from '../../molecules/TaskOverview';
import TaskList from '../../organisms/TaskList';
import {useRouter} from 'next/navigation';
import {FiPlus} from 'react-icons/fi';

const DashboardTemplate: React.FC = () => {
  const router = useRouter();

  const handleCreateTask = () => {
    // 导航到AI分析页面
    router.push('/ai-analysis');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 统计卡片区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="进行中的任务"
          value="24"
          trend="up"
          trendValue="+12.5%"
          bgColor="bg-blue-500"
        />
        <StatCard
          title="任务完成率"
          value="85%"
          bgColor="bg-green-500"
        />
        <StatCard
          title="特殊需求"
          value="8"
          bgColor="bg-red-500"
        />
        <StatCard
          title="团队成员数"
          value="16"
          bgColor="bg-purple-500"
        />
      </div>

      {/* 图表和概览区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <TaskTrendChart
            completedTasks={[]}
            createdTasks={[]}
            period="week"
          />
        </div>
        <div>
          <TaskOverview
            completed={65}
            inProgress={25}
            overdue={10}
          />
        </div>
      </div>

      {/* 任务列表区域 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">任务列表</h2>
          <button
            onClick={handleCreateTask}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <FiPlus className="mr-1" />
            创建需求分析
          </button>
        </div>
        <TaskList
          tasks={[]}
          onEdit={(id) => console.log(`Edit task ${id}`)}
          onDelete={(id) => console.log(`Delete task ${id}`)}
        />
      </div>
    </div>
  );
};

export default DashboardTemplate;
