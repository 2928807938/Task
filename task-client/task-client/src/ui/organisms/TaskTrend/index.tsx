"use client";

import React, {useEffect, useMemo, useState} from 'react';
import {Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {FiCalendar} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
import {TaskStatusTrend} from '@/types/task-status-trend';
import {getAuthToken} from '@/utils/auth-utils';
import { API_BASE_URL, createUrl } from '@/infrastructure/http/http-client-impl';
import {useTheme} from '@/ui/theme';

// 时间选项配置 - 使用后端定义的枚举值
const timeOptions = [
  { label: '近3个月', value: 'LAST_3_MONTHS' },
  { label: '近6个月', value: 'LAST_6_MONTHS' },
  { label: '今年', value: 'THIS_YEAR' },
  { label: '去年', value: 'LAST_YEAR' },
];

interface TaskTrendProps {
  tasks?: ProjectTask[];
  projectId?: string;
  taskStatusTrend?: TaskStatusTrend;
  hideTitle?: boolean;
}

const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    const total = payload[0].payload.total;
    return (
      <div className={`p-4 shadow-lg rounded-2xl border backdrop-blur-md transition-all duration-200 transform scale-100 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] ${
        isDarkMode 
          ? 'bg-gray-800/95 border-gray-700' 
          : 'bg-white/95 border-gray-100'
      }`}>
        <p className={`font-semibold text-base tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{label}</p>
        <div className="mt-3 space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center">
              <div
                className="w-3 h-3 mr-2 rounded-sm"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{entry.name}: </span>
              <span className={`text-sm font-medium ml-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{entry.value}</span>
              <span className={`text-xs ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {total > 0 ? `(${Math.round(entry.value / total * 100)}%)` : '(0%)'}
              </span>
            </div>
          ))}
          <div className={`pt-2 mt-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>总计: </span>
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const TaskTrend: React.FC<TaskTrendProps> = ({ tasks = [], projectId, taskStatusTrend: initialTaskStatusTrend, hideTitle = false }) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;
  const [timeRange, setTimeRange] = useState('近6个月');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar'); // 控制图表类型
  const [isLoading, setIsLoading] = useState(false); // 加载状态
  const [localTaskStatusTrend, setLocalTaskStatusTrend] = useState<TaskStatusTrend | undefined>(initialTaskStatusTrend);

  // 状态映射对象，存储每个状态ID对应的名称和颜色
  const [statusMap, setStatusMap] = useState<Record<string, { name: string, color: string }>>({});

  // 控制各数据系列的显示/隐藏状态
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({});

  // 存储所有可用的数据系列名称
  const [allSeries, setAllSeries] = useState<string[]>([]);

  // 当初始 props 变化时更新本地状态
  useEffect(() => {
    setLocalTaskStatusTrend(initialTaskStatusTrend);
  }, [initialTaskStatusTrend]);

  // 初始化状态映射和可见性状态
  useEffect(() => {
    if (localTaskStatusTrend?.statusList && Array.isArray(localTaskStatusTrend.statusList)) {
      const newStatusMap: Record<string, { name: string, color: string }> = {};
      const newVisibleSeries: Record<string, boolean> = {};
      const seriesNames: string[] = [];

      localTaskStatusTrend.statusList.forEach(item => {
        // 确保每个状态都有名称和颜色
        const name = item.name || `状态_${item.id}`;
        const color = item.color || `#${Math.floor(Math.random()*16777215).toString(16)}`;
        newStatusMap[item.id] = { name, color };

        // 初始化所有系列为可见
        newVisibleSeries[name] = true;
        seriesNames.push(name);
      });

      // 添加总数系列
      newVisibleSeries['总数'] = true;
      seriesNames.push('总数');

      setStatusMap(newStatusMap);
      setVisibleSeries(newVisibleSeries);
      setAllSeries(seriesNames);
    } else if (tasks.length > 0) {
      // 如果使用本地任务数据，初始化默认状态系列
      const defaultSeries = ['已完成', '进行中', '待处理', '已逾期', '总数'];
      const newVisibleSeries: Record<string, boolean> = {};

      defaultSeries.forEach(name => {
        newVisibleSeries[name] = true;
      });

      setVisibleSeries(newVisibleSeries);
      setAllSeries(defaultSeries);
    }
  }, [localTaskStatusTrend, tasks]);

  // 根据后端返回的趋势数据或本地任务数据生成趋势图数据
  const trendData = useMemo(() => {
    // 如果有后端返回的趋势数据，优先使用
    if (localTaskStatusTrend?.timeLabels && Array.isArray(localTaskStatusTrend.statusList) && localTaskStatusTrend.statusTrends) {
      // 确保我们有状态映射
      if (Object.keys(statusMap).length === 0 && localTaskStatusTrend.statusList.length > 0) {
        // 如果状态映射还没有准备好，创建一个临时映射
        const tempStatusMap: Record<string, { name: string, color: string }> = {};
        localTaskStatusTrend.statusList.forEach(item => {
          tempStatusMap[item.id] = { name: item.name, color: item.color };
        });

        // 转换后端数据为图表格式
        return localTaskStatusTrend.timeLabels.map((label, index) => {
          const dataPoint: Record<string, any> = {
            name: label
          };

          // 遍历每个状态的趋势数据
          Object.entries(localTaskStatusTrend.statusTrends).forEach(([statusId, values]) => {
            // 从临时映射中获取状态名称
            const statusInfo = tempStatusMap[statusId] || { name: `状态_${statusId}`, color: '#cccccc' };
            // 添加到数据点
            dataPoint[statusInfo.name] = values[index] || 0;
          });

          // 计算总数
          dataPoint.total = Object.keys(dataPoint)
            .filter(key => key !== 'name')
            .reduce((sum, key) => sum + (typeof dataPoint[key] === 'number' ? dataPoint[key] : 0), 0);

          return dataPoint;
        });
      }

      // 转换后端数据为图表格式
      return localTaskStatusTrend.timeLabels.map((label, index) => {
        const dataPoint: Record<string, any> = {
          name: label
        };

        // 遍历每个状态的趋势数据
        Object.entries(localTaskStatusTrend.statusTrends).forEach(([statusId, values]) => {
          // 从映射中获取状态名称，或使用ID作为名称
          const statusInfo = statusMap[statusId] || { name: `状态_${statusId}`, color: '#cccccc' };
          // 添加到数据点
          dataPoint[statusInfo.name] = values[index] || 0;
        });

        // 计算总数
        dataPoint.total = Object.keys(dataPoint)
          .filter(key => key !== 'name')
          .reduce((sum, key) => sum + (typeof dataPoint[key] === 'number' ? dataPoint[key] : 0), 0);

        return dataPoint;
      });
    }

    // 如果没有后端趋势数据，则使用任务数据生成
    // 如果没有任务数据，返回默认的空数据
    if (!tasks || tasks.length === 0) {
      return Array(6).fill(0).map((_, index) => {
        const month = new Date();
        month.setMonth(month.getMonth() - 5 + index);
        return {
          name: `${month.getMonth() + 1}月`,
          已完成: 0,
          进行中: 0,
          待处理: 0,
          已逾期: 0,
          total: 0
        };
      });
    }

    // 根据时间范围筛选任务
    let startDate = new Date();
    let monthsToShow = 6;

    if (timeRange === '近3个月') {
      monthsToShow = 3;
    } else if (timeRange === '今年') {
      startDate = new Date(startDate.getFullYear(), 0, 1);
      monthsToShow = 12;
    } else if (timeRange === '去年') {
      startDate = new Date(startDate.getFullYear() - 1, 0, 1);
      monthsToShow = 12;
    }

    // 初始化月份数据结构
    const monthlyData: Record<string, {已完成: number, 进行中: number, 待处理: number, 已逾期: number, total: number}> = {};

    // 生成月份键
    for (let i = 0; i < monthsToShow; i++) {
      const month = new Date(startDate);
      month.setMonth(month.getMonth() - (monthsToShow - 1) + i);
      const monthKey = `${month.getMonth() + 1}月`;
      monthlyData[monthKey] = { 已完成: 0, 进行中: 0, 待处理: 0, 已逾期: 0, total: 0 };
    }

    // 统计任务数据
    tasks.forEach(task => {
      // 获取任务的月份
      const taskDate = new Date(task.createdAt);
      const monthKey = `${taskDate.getMonth() + 1}月`;

      // 如果这个月不在我们的范围内，跳过
      if (!monthlyData[monthKey]) return;

      // 获取当前日期和任务截止日期
      const now = new Date();
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;

      // 根据任务状态分类计数
      if (task.status === 'COMPLETED') {
        monthlyData[monthKey].已完成 += 1;
      } else if (task.status === 'OVERDUE' || (dueDate && dueDate < now && task.status !== 'COMPLETED' as any)) {
        // 明确标记为逾期或截止日期已过但未完成
        monthlyData[monthKey].已逾期 += 1;
      } else if (task.status === 'IN_PROGRESS') {
        monthlyData[monthKey].进行中 += 1;
      } else {
        // WAITING 或其他状态
        monthlyData[monthKey].待处理 += 1;
      }

      // 更新总数
      monthlyData[monthKey].total += 1;
    });

    // 转换为数组格式
    return Object.entries(monthlyData).map(([name, data]) => ({
      name,
      ...data
    }));
  }, [tasks, timeRange, localTaskStatusTrend, statusMap]);

  return (
    <div className="p-0 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* 顶部区域：标题和时间选择器 */}
      <div className={`flex justify-between items-center flex-nowrap min-w-0 w-full ${hideTitle ? 'mb-4' : 'mb-6'}`}>
        {!hideTitle && (
          <h3 className={`text-base font-medium tracking-tight whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>任务状态分布趋势</h3>
        )}
        <div className="flex items-center space-x-3 flex-nowrap">
          {/* 图表类型切换按钮 */}
          <div className={`flex rounded-full p-0.5 flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <button
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                chartType === 'bar' 
                  ? isDarkMode 
                    ? 'bg-gray-600 shadow-sm text-gray-100' 
                    : 'bg-white shadow-sm text-gray-800'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setChartType('bar')}
            >
              柱状图
            </button>
            <button
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                chartType === 'line' 
                  ? isDarkMode 
                    ? 'bg-gray-600 shadow-sm text-gray-100' 
                    : 'bg-white shadow-sm text-gray-800'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setChartType('line')}
            >
              折线图
            </button>
          </div>

          {/* 时间范围选择器 - 使用按钮组而不是下拉框 */}
          <div className="flex items-center flex-shrink-0">
            <div className={`flex rounded-full border overflow-hidden ${
              isDarkMode 
                ? 'border-gray-600' 
                : 'border-blue-100'
            }`}>
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`px-3 py-1.5 text-xs font-medium transition-all flex items-center whitespace-nowrap ${
                    timeRange === option.label 
                      ? isDarkMode
                        ? 'bg-blue-600 text-blue-100'
                        : 'bg-blue-50 text-blue-600'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    const newTimeRange = option.label;
                    setTimeRange(newTimeRange);

                    // 如果有项目 ID，调用 API 获取新的时间范围数据
                    if (projectId) {
                      setIsLoading(true);

                      // 将时间范围标签转换为 API 参数
                      const timeRangeValue = option.value;

                      // 构建 API URL
                      const endpoint = `/api/client/project/task-status-trend?projectId=${projectId}&timeRange=${timeRangeValue}`;
                      const apiUrl = createUrl(endpoint);

                      // 获取认证令牌
                      const token = getAuthToken();

                      // 调用 API
                      fetch(apiUrl, {
                        headers: {
                          'Authorization': token ? `Bearer ${token}` : ''
                        }
                      })
                        .then(response => {
                          if (!response.ok) {
                            throw new Error('Network response was not ok');
                          }
                          return response.json();
                        })
                        .then(data => {

                          // 检查数据格式
                          if (data && data.data && data.data.statusList && data.data.timeLabels && data.data.statusTrends) {
                            // 更新本地状态
                            setLocalTaskStatusTrend(data.data);
                          }
                        })
                        .catch(error => {
                          console.error('获取任务趋势数据失败:', error);
                        })
                        .finally(() => {
                          setIsLoading(false);
                        });
                    }
                  }}
                >
                  {option.label === '近3个月' && (
                    <span className="mr-1.5">
                      <FiCalendar size={12} className="stroke-[1.5px]" />
                    </span>
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 图表容器 */}
      <div className={`h-80 mt-4 rounded-2xl backdrop-blur-[2px] p-4 border shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative ${
        isDarkMode 
          ? 'bg-gray-800/40 border-gray-700/60' 
          : 'bg-white/40 border-gray-100/60'
      }`}>
        <div className="w-full h-full overflow-hidden">
        {/* 加载指示器 */}
        {isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-[1px] z-10 rounded-2xl ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
          }`}>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>加载中...</span>
            </div>
          </div>
        )}
        <ResponsiveContainer width="99%" height="99%" minWidth={300}>
          <ComposedChart
            data={trendData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            barSize={36}
            barGap={2}
            barCategoryGap={16}
            className="font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]"
          >
            <CartesianGrid
              strokeDasharray="2 4"
              vertical={false}
              stroke={isDarkMode ? '#4B5563' : '#f3f4f6'}
              strokeOpacity={0.8}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDarkMode ? '#9CA3AF' : '#6b7280', fontSize: 12, fontWeight: 500 }}
              dy={8}
              tickMargin={8}
              minTickGap={5}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDarkMode ? '#9CA3AF' : '#6b7280', fontSize: 12 }}
              dx={-8}
              tickFormatter={(value) => value === 0 ? '0' : value}
              width={30}
            />
            <Tooltip
              content={<CustomTooltip isDarkMode={isDarkMode} />}
              cursor={{ fill: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.5)' }}
              animationDuration={200}
              wrapperStyle={{ outline: 'none' }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingBottom: '10px',
                fontSize: '12px',
                fontWeight: 500,
                opacity: 0.85,
                width: '95%',
                maxWidth: '100%',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}
              formatter={(value) => (
                <span
                  className={`text-gray-700 cursor-pointer ${!visibleSeries[value] ? 'opacity-50' : ''}`}
                  onClick={() => {
                    setVisibleSeries(prev => ({
                      ...prev,
                      [value]: !prev[value]
                    }));
                  }}
                >
                  {value}
                </span>
              )}
            />
            {/* 根据选择的图表类型显示柱状图或折线图 */}
            {chartType === 'bar' && localTaskStatusTrend?.statusList && localTaskStatusTrend.statusList.length > 0 ? (
              // 柱状图 - 后端数据
              localTaskStatusTrend.statusList.map((statusItem: any, index: number) => {
                const statusId = statusItem.id;
                const statusInfo = { name: statusItem.name, color: statusItem.color };
                const isHidden = !visibleSeries[statusInfo.name];

                // 如果隐藏，使用半透明样式
                const fillColor = isHidden
                  ? `${statusInfo.color}40` // 40 = 25% 透明度
                  : statusInfo.color;

                return (
                  <Bar
                    key={`bar-${statusId}`}
                    dataKey={statusInfo.name}
                    name={statusInfo.name}
                    stackId="a"
                    fill={fillColor}
                    radius={[0, 0, 0, 0]}
                    // 隐藏时使用虚线边框
                    stroke={isHidden ? statusInfo.color : undefined}
                    strokeDasharray={isHidden ? "3 3" : undefined}
                    strokeWidth={isHidden ? 1 : 0}
                  />
                );
              })
            ) : chartType === 'bar' ? (
              // 柱状图 - 默认数据
              <>
                <Bar
                  dataKey="已完成"
                  name="已完成"
                  stackId="a"
                  fill={!visibleSeries['已完成'] ? "#4ade8040" : "#4ade80"}
                  radius={[0, 0, 0, 0]}
                  stroke={!visibleSeries['已完成'] ? "#4ade80" : undefined}
                  strokeDasharray={!visibleSeries['已完成'] ? "3 3" : undefined}
                  strokeWidth={!visibleSeries['已完成'] ? 1 : 0}
                />
                <Bar
                  dataKey="进行中"
                  name="进行中"
                  stackId="a"
                  fill={!visibleSeries['进行中'] ? "#60a5fa40" : "#60a5fa"}
                  radius={[0, 0, 0, 0]}
                  stroke={!visibleSeries['进行中'] ? "#60a5fa" : undefined}
                  strokeDasharray={!visibleSeries['进行中'] ? "3 3" : undefined}
                  strokeWidth={!visibleSeries['进行中'] ? 1 : 0}
                />
                <Bar
                  dataKey="待处理"
                  name="待处理"
                  stackId="a"
                  fill={!visibleSeries['待处理'] ? "#f9731640" : "#f97316"}
                  radius={[0, 0, 0, 0]}
                  stroke={!visibleSeries['待处理'] ? "#f97316" : undefined}
                  strokeDasharray={!visibleSeries['待处理'] ? "3 3" : undefined}
                  strokeWidth={!visibleSeries['待处理'] ? 1 : 0}
                />
                <Bar
                  dataKey="已逾期"
                  name="已逾期"
                  stackId="a"
                  fill={!visibleSeries['已逾期'] ? "#ef444440" : "#ef4444"}
                  radius={[0, 0, 0, 0]}
                  stroke={!visibleSeries['已逾期'] ? "#ef4444" : undefined}
                  strokeDasharray={!visibleSeries['已逾期'] ? "3 3" : undefined}
                  strokeWidth={!visibleSeries['已逾期'] ? 1 : 0}
                />
              </>
            ) : chartType === 'line' && localTaskStatusTrend?.statusList && localTaskStatusTrend.statusList.length > 0 ? (
              // 折线图 - 后端数据
              localTaskStatusTrend.statusList.map((statusItem: any) => {
                const statusId = statusItem.id;
                const statusInfo = { name: statusItem.name, color: statusItem.color };
                const isHidden = !visibleSeries[statusInfo.name];

                return (
                  <Line
                    key={`line-${statusId}`}
                    type="monotone"
                    dataKey={statusInfo.name}
                    name={statusInfo.name}
                    stroke={isHidden ? `${statusInfo.color}80` : statusInfo.color} // 80 = 50% 透明度
                    strokeWidth={isHidden ? 1 : 2}
                    strokeDasharray={isHidden ? "3 3" : undefined}
                    dot={isHidden ? false : { r: 3, strokeWidth: 1, fill: "white" }}
                    activeDot={isHidden ? { r: 3, strokeWidth: 0, fill: `${statusInfo.color}80` } : { r: 5, strokeWidth: 0, fill: statusInfo.color }}
                  />
                );
              })
            ) : (
              // 折线图 - 默认数据
              <>
                <Line
                  type="monotone"
                  dataKey="已完成"
                  name="已完成"
                  stroke={!visibleSeries['已完成'] ? "#4ade8080" : "#4ade80"}
                  strokeWidth={!visibleSeries['已完成'] ? 1 : 2}
                  strokeDasharray={!visibleSeries['已完成'] ? "3 3" : undefined}
                  dot={!visibleSeries['已完成'] ? false : { r: 3, strokeWidth: 1, fill: "white" }}
                  activeDot={!visibleSeries['已完成'] ? { r: 3, strokeWidth: 0, fill: "#4ade8080" } : { r: 5, strokeWidth: 0, fill: "#4ade80" }}
                />
                <Line
                  type="monotone"
                  dataKey="进行中"
                  name="进行中"
                  stroke={!visibleSeries['进行中'] ? "#60a5fa80" : "#60a5fa"}
                  strokeWidth={!visibleSeries['进行中'] ? 1 : 2}
                  strokeDasharray={!visibleSeries['进行中'] ? "3 3" : undefined}
                  dot={!visibleSeries['进行中'] ? false : { r: 3, strokeWidth: 1, fill: "white" }}
                  activeDot={!visibleSeries['进行中'] ? { r: 3, strokeWidth: 0, fill: "#60a5fa80" } : { r: 5, strokeWidth: 0, fill: "#60a5fa" }}
                />
                <Line
                  type="monotone"
                  dataKey="待处理"
                  name="待处理"
                  stroke={!visibleSeries['待处理'] ? "#f9731680" : "#f97316"}
                  strokeWidth={!visibleSeries['待处理'] ? 1 : 2}
                  strokeDasharray={!visibleSeries['待处理'] ? "3 3" : undefined}
                  dot={!visibleSeries['待处理'] ? false : { r: 3, strokeWidth: 1, fill: "white" }}
                  activeDot={!visibleSeries['待处理'] ? { r: 3, strokeWidth: 0, fill: "#f9731680" } : { r: 5, strokeWidth: 0, fill: "#f97316" }}
                />
                <Line
                  type="monotone"
                  dataKey="已逾期"
                  name="已逾期"
                  stroke={!visibleSeries['已逾期'] ? "#ef444480" : "#ef4444"}
                  strokeWidth={!visibleSeries['已逾期'] ? 1 : 2}
                  strokeDasharray={!visibleSeries['已逾期'] ? "3 3" : undefined}
                  dot={!visibleSeries['已逾期'] ? false : { r: 3, strokeWidth: 1, fill: "white" }}
                  activeDot={!visibleSeries['已逾期'] ? { r: 3, strokeWidth: 0, fill: "#ef444480" } : { r: 5, strokeWidth: 0, fill: "#ef4444" }}
                />
              </>
            )}

            {/* 总数折线图 - 仅在折线图模式下显示 */}
            {chartType === 'line' && (
              <Line
                type="monotone"
                dataKey="total"
                name="总数"
                stroke={!visibleSeries['总数'] ? "#8884d880" : "#8884d8"}
                strokeWidth={!visibleSeries['总数'] ? 1 : 2}
                strokeDasharray={!visibleSeries['总数'] ? "3 3" : undefined}
                dot={!visibleSeries['总数'] ? false : { r: 4, strokeWidth: 2, fill: "white" }}
                activeDot={!visibleSeries['总数'] ? { r: 4, strokeWidth: 0, fill: "#8884d880" } : { r: 6, strokeWidth: 0, fill: "#8884d8" }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TaskTrend;
