'use client';

import React from 'react';

// 图表卡片属性接口
export interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    color: string;
  };
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

// 新拟态样式
const neumorphicStyles = {
  container: "bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-700",
  transition: "transition-all duration-200",
};

/**
 * 图表卡片组件
 * 用于展示各种图表的通用容器组件
 */
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badge,
  children,
  fullWidth = false,
  className = '',
}) => {
  return (
    <div className={`${neumorphicStyles.container} ${neumorphicStyles.transition} group hover:shadow p-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* 卡片头部 */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        {badge && (
          <div className={`${badge.color} text-xs font-medium px-3 py-1.5 rounded-full`}>
            {badge.text}
          </div>
        )}
      </div>
      
      {/* 图表内容 */}
      <div className="h-60">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
