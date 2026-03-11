'use client';

import React from 'react';
import {motion} from 'framer-motion';

interface ProgressBarProps {
  // 基础属性
  value?: number;
  max?: number;
  percentage?: number;
  color?: string;
  height?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;

  // 显示选项
  showPercentage?: boolean;
  showText?: boolean;
  showLabel?: boolean;
  text?: string;
  label?: string;
  labelPosition?: 'left' | 'right';

  // 动画选项
  animated?: boolean;

  // 渐变效果
  showGradient?: boolean;

  // 分段颜色
  segmented?: boolean;
  colors?: {
    low: string;
    medium: string;
    high: string;
  };
}

/**
 * 进度条组件
 * 统一的进度条实现，支持多种样式和功能选项
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  // 处理两种进度指定方式：value/max 或直接 percentage
  value,
  max = 100,
  percentage: propPercentage,
  color = 'bg-blue-500',
  height = 'sm',
  className = '',

  // 显示选项
  showPercentage = false,
  showText = false,
  showLabel = false,
  text,
  label,
  labelPosition = 'right',

  // 特殊效果
  animated = false,
  showGradient = false,

  // 分段颜色
  segmented = false,
  colors = {
    low: 'bg-green-500',
    medium: 'bg-blue-500',
    high: 'bg-purple-500'
  }
}) => {
  // 计算进度百分比 - 优先使用直接提供的百分比，否则计算
  const calculatedPercentage = propPercentage !== undefined
    ? propPercentage
    : (value !== undefined && max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0);

  // 确保百分比在0-100之间
  const safePercentage = Math.min(Math.max(calculatedPercentage, 0), 100);

  // 根据高度设置样式
  const heightClass = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  // 分段颜色逻辑
  const getSegmentColor = (start: number, end: number) => {
    if (safePercentage >= start && safePercentage <= end) {
      if (end <= 33) return colors.low;
      if (end <= 66) return colors.medium;
      return colors.high;
    }
    return 'bg-gray-200 dark:bg-gray-700';
  };

  // 基础进度条内容
  const progressBarContent = () => {
    if (segmented) {
      // 分段颜色进度条
      return (
        <div className="flex h-full">
          <div className={`${getSegmentColor(0, 33)}`} style={{ width: `${Math.min(safePercentage, 33)}%` }}></div>
          <div className={`${getSegmentColor(34, 66)}`} style={{ width: `${Math.min(Math.max(safePercentage - 33, 0), 33)}%` }}></div>
          <div className={`${getSegmentColor(67, 100)}`} style={{ width: `${Math.min(Math.max(safePercentage - 66, 0), 34)}%` }}></div>
        </div>
      );
    } else {
      // 单色进度条
      const barContent = (
        <div
          className={`${color} ${heightClass[height]} rounded-full transition-all duration-300 ease-in-out relative`}
          style={{ width: `${safePercentage}%` }}
        >
          {showGradient && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          )}
        </div>
      );

      // 如果需要动画，使用 motion.div
      if (animated) {
        return (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${safePercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`${color} ${heightClass[height]} rounded-full relative`}
          >
            {showGradient && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            )}
          </motion.div>
        );
      }

      return barContent;
    }
  };

  return (
    <div className={`${labelPosition === 'left' || labelPosition === 'right' ? 'flex items-center' : ''} ${className}`}>
      {/* 左侧标签 */}
      {label && labelPosition === 'left' && (
        <span className="text-xs font-medium mr-2">{label}</span>
      )}

      {/* 进度条主体 */}
      <div className={`${labelPosition === 'left' || labelPosition === 'right' ? 'flex-grow' : 'w-full'}`}>
        {/* 顶部文本和百分比 */}
        {(showText || showPercentage) && (
          <div className="flex justify-between items-center mb-1">
            {showText && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {text || (value !== undefined && max !== undefined ? `${value}/${max}` : '')}
              </span>
            )}
            {showPercentage && (
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {safePercentage}%
              </span>
            )}
          </div>
        )}

        {/* 进度条 */}
        <div className={`w-full bg-gray-100 dark:bg-neutral-700 rounded-full ${heightClass[height]} overflow-hidden`}>
          {progressBarContent()}
        </div>

        {/* 底部标签 */}
        {showLabel && (
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{safePercentage}% 完成</span>
          </div>
        )}
      </div>

      {/* 右侧标签 */}
      {label && labelPosition === 'right' && (
        <span className="text-xs font-medium ml-2">{label}</span>
      )}
    </div>
  );
};

export default ProgressBar;
