'use client';

import React, {useMemo, useState} from 'react';
import {Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {FiBarChart2, FiTrendingUp} from 'react-icons/fi';

// 任务趋势数据类型
export type TaskTrendData = {
  date: string;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  total: number;
};

// 时间范围选项
export type TimeRange = 'LAST_MONTH' | 'LAST_3_MONTHS' | 'LAST_6_MONTHS' | 'THIS_YEAR' | 'LAST_YEAR';

// 任务趋势图表面板组件
export function TaskTrendsPanel({
  trendData,
  timeRange,
  onTimeRangeChange
}: {
  trendData: TaskTrendData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  // 图表数据处理
  const chartData = useMemo(() => {
    return trendData.map(item => ({
      ...item,
      date: item.date.substring(5), // 去掉年份，只保留月日
    }));
  }, [trendData]);

  // 切换图表类型
  const toggleChartType = () => {
    setChartType(prev => prev === 'bar' ? 'line' : 'bar');
  };

  // 切换时间范围
  const handleTimeRangeChange = (range: TimeRange) => {
    onTimeRangeChange(range);
  };

  // 切换数据系列显示/隐藏
  const toggleSeries = (dataKey: string) => {
    setHiddenSeries(prev =>
      prev.includes(dataKey)
        ? prev.filter(item => item !== dataKey)
        : [...prev, dataKey]
    );
  };

  // 自定义图例组件
  const CustomLegend = () => {
    const items = [
      { dataKey: 'todo', name: '待办', color: '#8E8E93' },
      { dataKey: 'inProgress', name: '进行中', color: '#007AFF' },
      { dataKey: 'review', name: '审核中', color: '#FF9500' },
      { dataKey: 'done', name: '已完成', color: '#34C759' },
      ...(chartType === 'line' ? [{ dataKey: 'total', name: '总数', color: '#5856D6' }] : [])
    ];

    return (
      <div className="flex justify-center flex-wrap gap-3 mt-2">
        {items.map(item => (
          <div
            key={item.dataKey}
            className={`flex items-center text-[10px] cursor-pointer transition-opacity ${hiddenSeries.includes(item.dataKey) ? 'opacity-40' : 'opacity-100'}`}
            onClick={() => toggleSeries(item.dataKey)}
          >
            <div
              className="w-2.5 h-2.5 rounded-sm mr-1"
              style={{
                backgroundColor: item.color,
                border: hiddenSeries.includes(item.dataKey) ? '1px dashed #ccc' : 'none'
              }}
            />
            <span className="font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    );
  };

  // 柱状图组件
  const BarChartComponent = () => (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} barGap={2} barSize={16}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} width={25} />
        <Tooltip
          formatter={(value, name) => {
            const nameMap: Record<string, string> = {
              todo: '待办',
              inProgress: '进行中',
              review: '审核中',
              done: '已完成',
              total: '总数'
            };
            return [value, nameMap[name] || name];
          }}
          labelFormatter={(label) => `日期: ${label}`}
        />

        <Bar
          dataKey="todo"
          name="待办"
          fill="#8E8E93"
          radius={[4, 4, 0, 0]}
          opacity={hiddenSeries.includes('todo') ? 0.25 : 1}
          stroke={hiddenSeries.includes('todo') ? '#8E8E93' : 'none'}
          strokeDasharray={hiddenSeries.includes('todo') ? '3 3' : 'none'}
          strokeWidth={hiddenSeries.includes('todo') ? 1 : 0}
        />
        <Bar
          dataKey="inProgress"
          name="进行中"
          fill="#007AFF"
          radius={[4, 4, 0, 0]}
          opacity={hiddenSeries.includes('inProgress') ? 0.25 : 1}
          stroke={hiddenSeries.includes('inProgress') ? '#007AFF' : 'none'}
          strokeDasharray={hiddenSeries.includes('inProgress') ? '3 3' : 'none'}
          strokeWidth={hiddenSeries.includes('inProgress') ? 1 : 0}
        />
        <Bar
          dataKey="review"
          name="审核中"
          fill="#FF9500"
          radius={[4, 4, 0, 0]}
          opacity={hiddenSeries.includes('review') ? 0.25 : 1}
          stroke={hiddenSeries.includes('review') ? '#FF9500' : 'none'}
          strokeDasharray={hiddenSeries.includes('review') ? '3 3' : 'none'}
          strokeWidth={hiddenSeries.includes('review') ? 1 : 0}
        />
        <Bar
          dataKey="done"
          name="已完成"
          fill="#34C759"
          radius={[4, 4, 0, 0]}
          opacity={hiddenSeries.includes('done') ? 0.25 : 1}
          stroke={hiddenSeries.includes('done') ? '#34C759' : 'none'}
          strokeDasharray={hiddenSeries.includes('done') ? '3 3' : 'none'}
          strokeWidth={hiddenSeries.includes('done') ? 1 : 0}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // 折线图组件
  const LineChartComponent = () => (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} width={25} />
        <Tooltip
          formatter={(value, name) => {
            const nameMap: Record<string, string> = {
              todo: '待办',
              inProgress: '进行中',
              review: '审核中',
              done: '已完成',
              total: '总数'
            };
            return [value, nameMap[name] || name];
          }}
          labelFormatter={(label) => `日期: ${label}`}
        />

        <Line
          type="monotone"
          dataKey="todo"
          name="待办"
          stroke="#8E8E93"
          dot={!hiddenSeries.includes('todo')}
          opacity={hiddenSeries.includes('todo') ? 0.5 : 1}
          strokeDasharray={hiddenSeries.includes('todo') ? '5 5' : '0'}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="inProgress"
          name="进行中"
          stroke="#007AFF"
          dot={!hiddenSeries.includes('inProgress')}
          opacity={hiddenSeries.includes('inProgress') ? 0.5 : 1}
          strokeDasharray={hiddenSeries.includes('inProgress') ? '5 5' : '0'}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="review"
          name="审核中"
          stroke="#FF9500"
          dot={!hiddenSeries.includes('review')}
          opacity={hiddenSeries.includes('review') ? 0.5 : 1}
          strokeDasharray={hiddenSeries.includes('review') ? '5 5' : '0'}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="done"
          name="已完成"
          stroke="#34C759"
          dot={!hiddenSeries.includes('done')}
          opacity={hiddenSeries.includes('done') ? 0.5 : 1}
          strokeDasharray={hiddenSeries.includes('done') ? '5 5' : '0'}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="总数"
          stroke="#5856D6"
          dot={!hiddenSeries.includes('total')}
          opacity={hiddenSeries.includes('total') ? 0.5 : 1}
          strokeDasharray={hiddenSeries.includes('total') ? '5 5' : '0'}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  // 时间范围选项
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'LAST_MONTH', label: '最近一个月' },
    { value: 'LAST_3_MONTHS', label: '最近三个月' },
    { value: 'LAST_6_MONTHS', label: '最近六个月' },
    { value: 'THIS_YEAR', label: '今年' },
    { value: 'LAST_YEAR', label: '去年' }
  ];

  return (
    <div className="rounded-lg shadow-sm border p-5" 
      style={{ 
        backgroundColor: 'var(--theme-card-bg)', 
        borderColor: 'var(--theme-card-border)',
        boxShadow: 'var(--theme-shadow-sm)'
      }}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>任务趋势</h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleChartType}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--theme-neutral-500)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theme-primary-500)';
              e.currentTarget.style.backgroundColor = 'var(--theme-primary-50)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theme-neutral-500)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={`切换为${chartType === 'bar' ? '折线图' : '柱状图'}`}
            aria-label={`切换为${chartType === 'bar' ? '折线图' : '柱状图'}`}
          >
            {chartType === 'bar' ? <FiTrendingUp className="h-4 w-4" /> : <FiBarChart2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center mb-3 gap-1.5">
        {timeRangeOptions.map(option => (
          <button
            key={option.value}
            onClick={() => handleTimeRangeChange(option.value)}
            className="px-2.5 py-1 text-xs rounded-full transition-all"
            style={timeRange === option.value ? {
              backgroundColor: 'var(--theme-primary-500)',
              color: '#FFFFFF'
            } : {
              backgroundColor: 'var(--theme-neutral-100)',
              color: 'var(--theme-neutral-600)'
            }}
            onMouseEnter={(e) => {
              if (timeRange !== option.value) {
                e.currentTarget.style.backgroundColor = 'var(--theme-neutral-200)';
              }
            }}
            onMouseLeave={(e) => {
              if (timeRange !== option.value) {
                e.currentTarget.style.backgroundColor = 'var(--theme-neutral-100)';
              }
            }}
            aria-label={`选择时间范围: ${option.label}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {chartType === 'bar' ? <BarChartComponent /> : <LineChartComponent />}

      <CustomLegend />
    </div>
  );
}

export default TaskTrendsPanel;
