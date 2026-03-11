'use client';

import React, {ReactNode} from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendValue?: string;
  bgColor?: string;
  textColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  bgColor = 'bg-blue-500',
  textColor = 'text-white'
}) => {
  return (
    <div className={`rounded-xl p-6 ${bgColor} ${textColor} shadow-lg transition-all duration-300 hover:shadow-xl`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <span className="transition-transform duration-300">{trend === 'up' ? '↑' : '↓'}</span>
              <span className="ml-1">{trendValue}</span>
            </div>
          )}
        </div>
        {icon && <div className="text-xl opacity-90">{icon}</div>}
      </div>
    </div>
  );
};

export default StatCard;
