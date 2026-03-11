'use client';

import React from 'react';

interface DataPoint {
  day: string;
  value: number;
}

interface TaskTrendChartProps {
  completedTasks: DataPoint[];
  createdTasks: DataPoint[];
  period: 'day' | 'week' | 'month';
}

const TaskTrendChart: React.FC<TaskTrendChartProps> = ({ completedTasks, createdTasks, period }) => {
  // 这里应该使用实际的图表库，如Chart.js或Recharts
  // 为了简化示例，这里使用简单的SVG实现
  
  const maxValue = Math.max(
    ...completedTasks.map(d => d.value),
    ...createdTasks.map(d => d.value)
  );
  
  // 添加边距，防止线条超出区域
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const chartHeight = 200 - margin.top - margin.bottom;
  const chartWidth = 600 - margin.left - margin.right;
  
  const normalizeValue = (value: number) => {
    // 添加顶部边距，确保线条不会超出区域
    return margin.top + chartHeight - (value / maxValue) * (chartHeight * 0.8);
  };
  
  const generatePath = (data: DataPoint[]) => {
    const width = chartWidth / (data.length - 1);
    
    // 使用贝塞尔曲线使线条更平滑
    let path = '';
    
    data.forEach((point, index) => {
      const x = index * width;
      const y = normalizeValue(point.value);
      
      if (index === 0) {
        // 起始点
        path += `M ${x} ${y}`;
      } else {
        // 计算控制点，使曲线更平滑
        const prevX = (index - 1) * width;
        const prevY = normalizeValue(data[index - 1].value);
        
        const cp1x = prevX + (x - prevX) / 3;
        const cp1y = prevY;
        const cp2x = prevX + 2 * (x - prevX) / 3;
        const cp2y = y;
        
        // 添加贝塞尔曲线
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      }
    });
    
    return path;
  };
  
  // 生成填充区域的路径
  const generateAreaPath = (data: DataPoint[]) => {
    const width = chartWidth / (data.length - 1);
    let path = '';
    
    // 先绘制上部曲线
    data.forEach((point, index) => {
      const x = index * width;
      const y = normalizeValue(point.value);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        const prevX = (index - 1) * width;
        const prevY = normalizeValue(data[index - 1].value);
        
        const cp1x = prevX + (x - prevX) / 3;
        const cp1y = prevY;
        const cp2x = prevX + 2 * (x - prevX) / 3;
        const cp2y = y;
        
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      }
    });
    
    // 添加右下角点
    const lastX = (data.length - 1) * width;
    // 使用实际的图表高度（包含边距）
    const totalHeight = chartHeight + margin.top + margin.bottom;
    path += ` L ${lastX} ${totalHeight}`;
    
    // 添加左下角点
    path += ` L 0 ${totalHeight}`;
    
    // 闭合路径
    path += ' Z';
    
    return path;
  };
  
  return (
    <div className="w-full h-full bg-white p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-700">任务完成趋势</h3>
        <div className="flex space-x-2">
          <button className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${period === 'day' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>日</button>
          <button className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${period === 'week' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>周</button>
          <button className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${period === 'month' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>月</button>
        </div>
      </div>
      
      <div className="relative h-[240px]">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${chartWidth + margin.left + margin.right} ${chartHeight + margin.top + margin.bottom + 40}`} 
          preserveAspectRatio="none"
        >
          {/* 添加Y轴刻度线 */}
          <g className="grid-lines">
            {[0, 5, 10, 15, 20, 25].map((tick) => {
              const y = margin.top + chartHeight - (tick / maxValue) * (chartHeight * 0.8);
              return (
                <g key={tick}>
                  <line 
                    x1="0" 
                    y1={y} 
                    x2={chartWidth + margin.left + margin.right} 
                    y2={y} 
                    stroke="#e5e7eb" 
                    strokeWidth="1"
                  />
                  <text 
                    x="5" 
                    y={y - 5} 
                    fontSize="10" 
                    fill="#9ca3af"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}
          </g>
          
          <g transform={`translate(${margin.left}, 0)`}>
          {/* 完成任务线 */}
          <path
            d={generatePath(completedTasks)}
            fill="none"
            stroke="#60a5fa" /* 更柔和的蓝色 */
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 1px 2px rgba(96, 165, 250, 0.2))"
          />
          
          {/* 创建任务线 */}
          <path
            d={generatePath(createdTasks)}
            fill="none"
            stroke="#d1d5db" /* 更柔和的灰色 */
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5 5"
          />
          
          {/* 填充区域 */}
          <path
            d={generateAreaPath(completedTasks)}
            fill="url(#blueGradient)"
            opacity="0.15"
          />
          
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          </g>
        </svg>
        
        {/* X轴标签 */}
        <div className="flex justify-between mt-6 px-4">
          {completedTasks.map((point, index) => (
            <div key={index} className="text-xs text-gray-500 px-1">{point.day}</div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">已完成</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">新建</span>
        </div>
      </div>
    </div>
  );
};

export default TaskTrendChart;
