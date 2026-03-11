"use client";

import React, {ReactNode} from 'react';
import {FiArrowDown, FiArrowUp} from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: number;
  trend?: 'increase' | 'decrease' | 'neutral';
  percentage?: number;
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  children?: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend = 'neutral',
  percentage = 0,
  color = 'blue',
  children
}) => {
  const getTrendIcon = () => {
    if (trend === 'increase') {
      return <FiArrowUp className="w-3 h-3" />;
    } else if (trend === 'decrease') {
      return <FiArrowDown className="w-3 h-3" />;
    }
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'increase') {
      return color === 'red' ? 'var(--theme-error-500)' : 'var(--theme-success-500)';
    } else if (trend === 'decrease') {
      return color === 'red' ? 'var(--theme-success-500)' : 'var(--theme-error-500)';
    }
    return 'var(--theme-neutral-500)';
  };

  return (
    <div 
      className="rounded-lg p-5"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-card-border)',
        boxShadow: 'var(--theme-shadow-sm)'
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium" style={{ color: 'var(--theme-neutral-500)' }}>{title}</h3>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>{value}</p>
        </div>
        {percentage > 0 && (
          <div className="flex items-center text-xs font-medium" style={{ color: getTrendColor() }}>
            {getTrendIcon()}
            <span className="ml-1">同比{trend === 'increase' ? '增长' : '下降'} {percentage}%</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default StatCard;
