"use client";

import React from 'react';
import {FiActivity, FiArrowDown, FiArrowUp, FiCheckCircle, FiUsers} from 'react-icons/fi';
import {motion} from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, color = 'indigo' }) => {
  const colorConfig = {
    indigo: {
      icon: <FiUsers className="h-5 w-5 text-blue-500" />,
      shadow: 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]',
      iconBg: 'bg-blue-50',
      valueColor: 'text-blue-600'
    },
    green: {
      icon: <FiActivity className="h-5 w-5 text-green-500" />,
      shadow: 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]',
      iconBg: 'bg-green-50',
      valueColor: 'text-green-600'
    },
    red: {
      icon: <FiCheckCircle className="h-5 w-5 text-red-500" />,
      shadow: 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]',
      iconBg: 'bg-red-50',
      valueColor: 'text-red-600'
    },
  };

  const changeColorClasses = {
    positive: 'text-green-600 bg-green-50 rounded-full px-2 py-0.5',
    negative: 'text-red-600 bg-red-50 rounded-full px-2 py-0.5',
  };

  const config = colorConfig[color as keyof typeof colorConfig];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-sm transition-all duration-200 w-full"
    >
      {/* 卡片顶部彩条 */}
      <div className={`h-1 w-full bg-${color}-500`}></div>

      <div className="p-2 sm:p-3">
        <div className="flex items-start">
          <div className={`${config.iconBg} p-2 rounded-lg mr-3`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 mb-0.5">{title}</h3>
            <div className="flex items-baseline justify-between">
              <p className={`text-xl font-bold ${config.valueColor}`}>{value}</p>
              <div className="flex items-center text-xs">
                <span className={change.isPositive ? changeColorClasses.positive : changeColorClasses.negative}>
                  {change.isPositive ? <FiArrowUp className="inline mr-1" /> : <FiArrowDown className="inline mr-1" />}
                  {change.value}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TeamOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <StatCard
        title="团队总人数"
        value="156"
        change={{ value: 12, isPositive: true }}
        color="indigo"
      />
      <StatCard
        title="本月活跃度"
        value="89%"
        change={{ value: 5, isPositive: true }}
        color="green"
      />
      <StatCard
        title="任务完成率"
        value="92%"
        change={{ value: 3, isPositive: false }}
        color="red"
      />
    </div>
  );
};

export default TeamOverview;
