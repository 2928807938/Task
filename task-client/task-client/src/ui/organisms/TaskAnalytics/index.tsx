'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Task, TaskPriority, TaskStatus} from '@/core/domain/entities/task';
import {FiCalendar, FiCheckCircle, FiClock, FiFilter, FiUsers} from 'react-icons/fi';
import TaskMetricCard from '../../molecules/TaskMetricCard';
import ChartCard from '../../molecules/ChartCard';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {Bar, Line, Pie} from 'react-chartjs-2';

// 注册 ChartJS 组件
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
  ChartDataLabels
);

// 新拟态设计风格样式工具
const neumorphicStyles = {
  container: "bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-700",
  transition: "transition-all duration-200"
};

interface TaskAnalyticsProps {
  tasks: Task[];
}

// 获取头像颜色函数
const getAvatarColor = (index: number) => {
  const colors = [
    'bg-gradient-to-br from-primary-500 to-primary-400',
    'bg-gradient-to-br from-info-500 to-info-400',
    'bg-gradient-to-br from-success-500 to-success-400',
    'bg-gradient-to-br from-warning-500 to-warning-400',
    'bg-gradient-to-br from-error-500 to-error-400',
    'bg-gradient-to-br from-purple-500 to-purple-400',
    'bg-gradient-to-br from-pink-500 to-pink-400'
  ];
  return colors[index % colors.length];
};

const TaskAnalyticsRefactored: React.FC<TaskAnalyticsProps> = ({ tasks = [] }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showFilters, setShowFilters] = useState(false);

  // 自定义颜色列表 - 不会变化，所以不需要useMemo
  const colorPalette = {
    blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'],
    indigo: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff'],
    purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'],
    green: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'],
    amber: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#fffbeb'],
    red: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#fef2f2'],
  };

  // 使用useMemo缓存任务统计结果，只有当tasks变化时才重新计算
  const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);

  // 使用useCallback优化时间范围切换函数
  const handleTimeRangeChange = useCallback((range: 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  }, []);

  // 使用useCallback优化筛选器切换函数
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // 计算任务统计数据
  function calculateTaskStats(taskList: Task[]) {
    const total = taskList.length;

    // 优化：只遍历任务列表一次，计算所有状态和优先级计数
    const statuses = {
      completed: 0,
      inProgress: 0,
      waiting: 0,
      overdue: 0
    };

    const priorities = {
      high: 0,
      medium: 0,
      low: 0
    };

    // 一次遍历计算所有统计值
    taskList.forEach(task => {
      // 更新状态计数
      if (task.status === TaskStatus.COMPLETED) statuses.completed++;
      else if (task.status === TaskStatus.IN_PROGRESS) statuses.inProgress++;
      else if (task.status === TaskStatus.WAITING) statuses.waiting++;
      else if (task.status === TaskStatus.OVERDUE) statuses.overdue++;

      // 更新优先级计数
      if (task.priority === TaskPriority.HIGH) priorities.high++;
      else if (task.priority === TaskPriority.MEDIUM) priorities.medium++;
      else if (task.priority === TaskPriority.LOW) priorities.low++;
    });

    // 统计有多少不同的负责人
    // 处理User类型的assignee，转换为字符串，使用Set来跟踪唯一值
    const assigneeMap = new Map<string, number>();
    const assigneeNames: string[] = [];

    // 优化：一次性处理assignee相关信息
    taskList.forEach(task => {
      let assigneeName = '未分配';
      if (task.assignee) {
        // 如果assignee是User对象，返回其名称；如果是字符串，直接返回
        assigneeName = typeof task.assignee === 'string' ? task.assignee : task.assignee.name || '未知用户';
      }

      assigneeNames.push(assigneeName);

      // 更新assignee计数
      assigneeMap.set(assigneeName, (assigneeMap.get(assigneeName) || 0) + 1);
    });

    // 使用Map直接获取唯一assignee和计数
    const uniqueAssigneeNames = Array.from(assigneeMap.keys());
    const uniqueAssignees = uniqueAssigneeNames.length;

    // 高效创建并排序assigneeTaskCounts
    const assigneeTaskCounts = Array.from(assigneeMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      statuses,
      priorities,
      uniqueAssignees,
      assigneeTaskCounts,
      completionRate: total > 0 ? (statuses.completed / total) * 100 : 0,
      highPriorityRate: total > 0 ? (priorities.high / total) * 100 : 0,
    };
  }

  // 使用useMemo缓存状态统计图表数据
  const statusStats = useMemo((): ChartData<'pie'> => {
    return {
      labels: ['完成', '进行中', '等待中', '已逾期'],
      datasets: [
        {
          data: [
            stats.statuses.completed,
            stats.statuses.inProgress,
            stats.statuses.waiting,
            stats.statuses.overdue
          ],
          backgroundColor: [
            colorPalette.green[0],
            colorPalette.blue[0],
            colorPalette.amber[0],
            colorPalette.red[0]
          ],
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.5)'
        }
      ]
    };
  }, [stats.total, stats.statuses]);

  // 使用useMemo缓存优先级统计图表数据
  const priorityStats = useMemo((): ChartData<'pie'> => {
    return {
      labels: ['高优先级', '中优先级', '低优先级'],
      datasets: [
        {
          data: [
            stats.priorities.high,
            stats.priorities.medium,
            stats.priorities.low
          ],
          backgroundColor: [
            colorPalette.red[0],
            colorPalette.amber[0],
            colorPalette.green[0]
          ],
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.5)'
        }
      ]
    };
  }, [stats.total, stats.priorities]);

  // 使用useMemo缓存负责人统计图表数据
  const assigneeStats = useMemo((): ChartData<'bar'> => {
    // 只显示前5个负责人
    const topAssignees = stats.assigneeTaskCounts.slice(0, 5);

    return {
      labels: topAssignees.map(assignee => assignee.name),
      datasets: [
        {
          label: '任务数量',
          data: topAssignees.map(assignee => assignee.count),
          backgroundColor: colorPalette.blue[0],
          borderColor: colorPalette.blue[2],
          borderWidth: 1,
          borderRadius: 4,
        }
      ]
    };
  }, [stats.assigneeTaskCounts]);

  // 使用useMemo缓存趋势图表数据
  const completionTrendStats = useMemo((): ChartData<'line'> => {
    // 示例数据，实际应计算时间序列
    const dates = ['1日', '5日', '10日', '15日', '20日', '25日', '30日'];
    const completedSeries = [2, 5, 8, 12, 15, 18, 20];
    const createdSeries = [3, 7, 10, 15, 18, 22, 25];

    return {
      labels: dates,
      datasets: [
        {
          label: '新建任务',
          data: createdSeries,
          borderColor: colorPalette.blue[1],
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: '完成任务',
          data: completedSeries,
          borderColor: colorPalette.green[1],
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        }
      ]
    };
  }, [timeRange]);

  // 使用useMemo缓存图表配置
  const pieOptions = useMemo((): ChartOptions<'pie'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#334155',
        bodyColor: '#64748b',
        borderColor: 'rgba(226, 232, 240, 1)',
        borderWidth: 1,
        padding: 10,
        usePointStyle: true,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.formattedValue} (${Math.round((Number(context.raw) / stats.total) * 100)}%)`
        }
      },
      datalabels: {
        formatter: (value, ctx) => {
          return value > 0 ? `${Math.round((value / stats.total) * 100)}%` : '';
        },
        color: '#fff',
        font: {
          weight: 'bold',
          size: 10,
        }
      }
    }
  }), [stats.total]);

  const barOptions = useMemo((): ChartOptions<'bar'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#334155',
        bodyColor: '#64748b',
        borderColor: 'rgba(226, 232, 240, 1)',
        borderWidth: 1,
        padding: 10,
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#64748b',
        font: {
          size: 10,
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        }
      }
    }
  }), []);

  const lineOptions = useMemo((): ChartOptions<'line'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#334155',
        bodyColor: '#64748b',
        borderColor: 'rgba(226, 232, 240, 1)',
        borderWidth: 1,
        padding: 10,
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        }
      }
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 5,
      }
    }
  }), []);

  return (
    <div className={`${neumorphicStyles.container} ${neumorphicStyles.transition} w-full`}>
      {/* 筛选器部分 */}
      <div className="p-4 border-b border-gray-100 dark:border-neutral-700">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">任务统计分析</h2>
          <div className="flex items-center gap-2">
            <div className="border border-gray-200 dark:border-neutral-700 rounded-md flex overflow-hidden">
              <button
                onClick={() => handleTimeRangeChange('week')}
                className={`px-3 py-1.5 text-xs ${timeRange === 'week' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700'}`}
              >
                本周
              </button>
              <button
                onClick={() => handleTimeRangeChange('month')}
                className={`px-3 py-1.5 text-xs ${timeRange === 'month' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700'}`}
              >
                本月
              </button>
              <button
                onClick={() => handleTimeRangeChange('quarter')}
                className={`px-3 py-1.5 text-xs ${timeRange === 'quarter' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700'}`}
              >
                本季度
              </button>
              <button
                onClick={() => handleTimeRangeChange('year')}
                className={`px-3 py-1.5 text-xs ${timeRange === 'year' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700'}`}
              >
                今年
              </button>
            </div>
            <button
              onClick={toggleFilters}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
            >
              <FiFilter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 筛选选项 - 当showFilters为true时显示 */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px]">优先级:</label>
                <select className="flex-1 text-xs p-1.5 rounded border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200">
                  <option value="">全部</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px]">状态:</label>
                <select className="flex-1 text-xs p-1.5 rounded border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200">
                  <option value="">全部</option>
                  <option value="completed">已完成</option>
                  <option value="in_progress">进行中</option>
                  <option value="waiting">等待中</option>
                  <option value="overdue">已逾期</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px]">负责人:</label>
                <select className="flex-1 text-xs p-1.5 rounded border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200">
                  <option value="">全部</option>
                  {stats.assigneeTaskCounts.map((assignee, index) => (
                    <option key={index} value={assignee.name}>{assignee.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 任务统计卡片部分 - 仅放入第一行卡片，后续我们逐步完善 */}
      <div className="p-4">
        {/* 任务统计卡片 - 第一行 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* 任务完成情况卡片 */}
          <TaskMetricCard
            title="任务完成情况"
            subtitle="所有任务的完成状态分布"
            progressValue={stats.statuses.completed}
            progressMax={stats.total}
            progressLabel={`${stats.statuses.completed}/${stats.total}`}
            progressColor="bg-green-500"
            badge={{
              text: `${Math.round(stats.completionRate)}%`,
              color: stats.completionRate >= 70
                ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : stats.completionRate >= 40
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            }}
            icon={<FiCheckCircle className="h-4 w-4 text-green-500" />}
            taskCount={stats.total}
          />

          {/* 优先级分布卡片 */}
          <TaskMetricCard
            title="优先级分布"
            subtitle="高中低优先级任务占比"
            progressValue={stats.priorities.high}
            progressMax={stats.total}
            progressLabel={`高优先级: ${stats.priorities.high}/${stats.total}`}
            progressColor="bg-red-500"
            badge={{
              text: `${Math.round(stats.highPriorityRate)}%`,
              color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            }}
            taskCount={stats.total}
          />

          {/* 任务进行状态卡片 */}
          <TaskMetricCard
            title="任务进行状态"
            subtitle="当前进行中和等待中的任务"
            progressValue={stats.statuses.inProgress}
            progressMax={stats.statuses.inProgress + stats.statuses.waiting}
            progressLabel={`进行中: ${stats.statuses.inProgress} | 等待中: ${stats.statuses.waiting}`}
            progressColor="bg-blue-500"
            badge={{
              text: `${stats.statuses.inProgress}个`,
              color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }}
            icon={<FiClock className="h-4 w-4 text-blue-500" />}
            taskCount={stats.statuses.inProgress + stats.statuses.waiting}
          />

          {/* 团队成员任务卡片 */}
          <TaskMetricCard
            title="团队成员与任务"
            subtitle="任务分配到的团队成员"
            progressValue={stats.uniqueAssignees}
            progressMax={Math.max(10, stats.uniqueAssignees)}
            progressLabel={`${stats.uniqueAssignees}位成员参与任务`}
            progressColor="bg-purple-500"
            badge={{
              text: `${stats.uniqueAssignees}人`,
              color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
            }}
            icon={<FiUsers className="h-4 w-4 text-purple-500" />}
            taskCount={stats.total}
          />
        </div>

        {/* 任务统计卡片 - 第二行 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 逾期任务卡片 */}
          <TaskMetricCard
            title="逾期任务情况"
            subtitle="已超过截止日期的任务"
            progressValue={stats.statuses.overdue}
            progressMax={stats.total}
            progressLabel={`逾期: ${stats.statuses.overdue}/${stats.total}`}
            progressColor="bg-red-500"
            badge={{
              text: `${stats.statuses.overdue}个`,
              color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            }}
            taskCount={stats.statuses.overdue}
          />

          {/* 本周任务卡片 */}
          <TaskMetricCard
            title="本周任务"
            subtitle="本周需要完成的任务"
            progressValue={8} // 这里使用示例数据，实际应计算本周任务
            progressMax={12} // 示例数据
            progressLabel="8/12 已完成"
            progressColor="bg-blue-500"
            badge={{
              text: "本周",
              color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }}
            icon={<FiCalendar className="h-4 w-4 text-blue-500" />}
            taskCount={12} // 示例数据
          />

          {/* 中优先级任务卡片 */}
          <TaskMetricCard
            title="中优先级任务"
            subtitle="中等优先级任务分布"
            progressValue={stats.priorities.medium}
            progressMax={stats.total}
            progressLabel={`${stats.priorities.medium}/${stats.total}`}
            progressColor="bg-amber-500"
            badge={{
              text: `${Math.round((stats.priorities.medium / stats.total) * 100)}%`,
              color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
            }}
            taskCount={stats.priorities.medium}
          />

          {/* 低优先级任务卡片 */}
          <TaskMetricCard
            title="低优先级任务"
            subtitle="低优先级任务分布"
            progressValue={stats.priorities.low}
            progressMax={stats.total}
            progressLabel={`${stats.priorities.low}/${stats.total}`}
            progressColor="bg-green-500"
            badge={{
              text: `${Math.round((stats.priorities.low / stats.total) * 100)}%`,
              color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            }}
            taskCount={stats.priorities.low}
          />
        </div>

        {/* 底部图表部分 */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* 状态分布图表 */}
          <ChartCard
            title="任务状态分布"
            badge={{
              text: `${stats.total}个任务`,
              color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }}
            className="lg:col-span-2"
          >
            <Pie data={statusStats} options={pieOptions} />
          </ChartCard>

          {/* 优先级分布图表 */}
          <ChartCard
            title="任务优先级分布"
            badge={{
              text: `${Math.round(stats.highPriorityRate)}%高优先级`,
              color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            }}
            className="lg:col-span-2"
          >
            <Pie data={priorityStats} options={pieOptions} />
          </ChartCard>

          {/* 时间趋势图表 */}
          <ChartCard
            title="任务完成趋势"
            subtitle="新建与完成任务数量趋势"
            className="lg:col-span-2"
          >
            <Line data={completionTrendStats} options={lineOptions} />
          </ChartCard>

          {/* 负责人分布图表 */}
          <ChartCard
            title="任务分配情况"
            badge={{
              text: `${stats.uniqueAssignees}位成员`,
              color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
            }}
            className="lg:col-span-2"
          >
            <Bar data={assigneeStats} options={barOptions} />
          </ChartCard>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="border-t border-gray-100 dark:border-neutral-700 mt-2 p-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <UpdateTimeText />
        <div>共 {tasks.length} 个任务</div>
      </div>
    </div>
  );
};

// 客户端组件，负责显示更新时间，避免服务端和客户端时间不匹配
const UpdateTimeText: React.FC = () => {
  const [timeString, setTimeString] = useState<string>('加载中...');

  useEffect(() => {
    // 只在客户端执行
    setTimeString(new Date().toLocaleString('zh-CN'));
  }, []);

  return <div>数据更新时间: {timeString}</div>;
};

export default TaskAnalyticsRefactored;
