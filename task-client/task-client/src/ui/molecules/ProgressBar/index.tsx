"use client";

import React from 'react';

interface ProgressBarProps {
  percentage: number;
  colors?: {
    low: string;
    medium: string;
    high: string;
  };
  label?: string;
  labelPosition?: 'left' | 'right';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  colors = {
    low: 'bg-green-500',
    medium: 'bg-blue-500',
    high: 'bg-purple-500'
  },
  label,
  labelPosition = 'right'
}) => {
  // 确保百分比在0-100之间
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  
  // 根据百分比选择颜色
  const getSegmentColor = (start: number, end: number) => {
    if (safePercentage >= start && safePercentage <= end) {
      if (end <= 33) return colors.low;
      if (end <= 66) return colors.medium;
      return colors.high;
    }
    return 'bg-gray-200 dark:bg-gray-700';
  };

  return (
    <div className="flex items-center">
      {label && labelPosition === 'left' && (
        <span className="text-xs font-medium mr-2">{label}</span>
      )}
      <div className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="flex h-full">
          <div className={`${getSegmentColor(0, 33)}`} style={{ width: `${Math.min(safePercentage, 33)}%` }}></div>
          <div className={`${getSegmentColor(34, 66)}`} style={{ width: `${Math.min(Math.max(safePercentage - 33, 0), 33)}%` }}></div>
          <div className={`${getSegmentColor(67, 100)}`} style={{ width: `${Math.min(Math.max(safePercentage - 66, 0), 34)}%` }}></div>
        </div>
      </div>
      {label && labelPosition === 'right' && (
        <span className="text-xs font-medium ml-2">{label}</span>
      )}
    </div>
  );
};

export default ProgressBar;
