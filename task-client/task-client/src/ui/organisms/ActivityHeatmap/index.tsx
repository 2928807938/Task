"use client";

import React from 'react';
import {FiCalendar} from 'react-icons/fi';
import {motion} from 'framer-motion';
import {useQuery} from '@tanstack/react-query';
import LoadingSpinner from '@/ui/molecules/LoadingSpinner';

// 热力图数据类型
interface HeatmapDataItem {
  day: string;
  hours: number[];
}

// 时间段标签
const timeLabels = ['0:00', '2:00', '4:00', '6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

// 获取颜色强度 - 使用新拟态设计的颜色方案
const getColorIntensity = (value: number) => {
  if (value === 0) return 'bg-gray-50 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-gray-400';
  if (value <= 2) return 'bg-blue-50 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] text-blue-500';
  if (value <= 4) return 'bg-blue-100 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] text-blue-600';
  if (value <= 6) return 'bg-blue-200 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] text-blue-700';
  if (value <= 8) return 'bg-indigo-200 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] text-indigo-700';
  if (value <= 10) return 'bg-indigo-300 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] text-indigo-800';
  if (value <= 12) return 'bg-indigo-400 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] text-white';
  if (value <= 14) return 'bg-indigo-500 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] text-white';
  return 'bg-indigo-600 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] text-white';
};

const ActivityHeatmap: React.FC = () => {
  // 默认项目ID
  const projectId = '1'; // 实际应用中应该从上下文或URL参数中获取

  // 使用React Query获取活跃度数据
  const { data: activityData, isLoading, isError } = useQuery({
    queryKey: ['activityHeatmap', projectId],
    queryFn: async () => {
      try {
        // 假设后端有一个活跃度数据的API，这里只是示例
        // 实际应用中应该调用真实的API端点
        const response = await fetch(`/api/projects/${projectId}/activity-heatmap`);
        if (!response.ok) throw new Error('获取活跃度数据失败');
        return await response.json();
      } catch (error) {
        console.error('获取活跃度数据错误:', error);
        return [];
      }
    },
    // 禁用自动获取，实际应用中可以启用
    enabled: false
  });

  // 默认数据（当API未启用或失败时使用）
  const defaultHeatmapData: HeatmapDataItem[] = [
    { day: '周日', hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: '周六', hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: '周五', hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: '周四', hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: '周三', hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: '周二', hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { day: '周一', hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  ];

  // 使用API数据或默认数据
  const heatmapData = activityData || defaultHeatmapData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-sm transition-all duration-200 w-full"
    >
      {/* 卡片顶部彩条 */}
      <div className="h-1 w-full bg-indigo-500"></div>

      <div className="p-2 sm:p-3">
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <FiCalendar className="text-indigo-500 w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-gray-800">成员活跃度热力图</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="md" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-gray-500">
            数据加载失败，请稍后再试
          </div>
        ) : (
          <>
            {/* 热力图时间标签 */}
            <div className="flex mb-1">
              <div className="w-12 flex-shrink-0"></div>
              <div className="flex-1 grid grid-cols-12 gap-1">
                {timeLabels.map((label, index) => (
                  <div key={index} className="text-xs text-gray-500 text-center">
                    {index % 3 === 0 ? label : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* 热力图主体 */}
            <div className="overflow-x-auto">
              {heatmapData.map((row: HeatmapDataItem, rowIndex: number) => (
                <div key={rowIndex} className="flex mb-1">
                  <div className="w-12 flex-shrink-0 text-xs text-gray-500 pr-2 flex items-center justify-end">
                    {row.day}
                  </div>
                  <div className="flex-1 grid grid-cols-12 gap-1">
                    {row.hours.map((value: number, colIndex: number) => (
                      <div
                        key={colIndex}
                        className={`h-6 rounded-sm ${getColorIntensity(value)} flex items-center justify-center text-xs font-medium transition-all`}
                        title={`${row.day} ${timeLabels[colIndex]}: ${value} 项活动`}
                      >
                        {value > 0 ? value : ''}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityHeatmap;
