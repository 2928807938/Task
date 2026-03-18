'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiAlertTriangle,
  FiTarget,
  FiCalendar,
  FiActivity
} from 'react-icons/fi';
import { TodoTask } from '@/types/dashboard-types';
import { differenceInDays, format, startOfWeek, endOfWeek } from 'date-fns';

interface StatsOverviewProps {
  tasks: TodoTask[];
  className?: string;
  onlineCount?: number;
  isConnected?: boolean;
}

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
    suffix?: string;
  };
  onClick?: () => void;
}

/**
 * 统计概览组件
 * 显示Dashboard的关键指标和统计信息
 */
export const StatsOverview: React.FC<StatsOverviewProps> = ({
  tasks,
  className = '',
  onlineCount = 0,
  isConnected = false
}) => {
  // 计算统计数据
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 周一开始
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // 基础统计
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => 
      task.statusName?.toLowerCase().includes('完成') || 
      task.statusName?.toLowerCase().includes('完毕')
    ).length;
    
    // 今日任务（今天截止的任务）
    const todayTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate.getTime() >= today.getTime() && 
             dueDate.getTime() < today.getTime() + 24 * 60 * 60 * 1000;
    }).length;

    // 逾期任务
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < now;
    }).length;

    // 本周任务
    const weekTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= weekStart && dueDate <= weekEnd;
    }).length;

    // 高优先级任务
    const highPriorityTasks = tasks.filter(task =>
      task.priorityName?.toLowerCase().includes('高') ||
      task.priorityName?.toLowerCase().includes('紧急') ||
      task.priorityName?.includes('P0') ||
      task.priorityName?.includes('P1')
    ).length;

    // 计算完成率
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      todayTasks,
      overdueTasks,
      weekTasks,
      highPriorityTasks,
      completionRate
    };
  }, [tasks]);

  // 定义统计卡片
  const statCards: StatCard[] = useMemo(() => [
    {
      id: 'total',
      title: '总任务',
      value: stats.totalTasks,
      subtitle: `已完成 ${stats.completedTasks} 个`,
      icon: FiTarget,
      color: 'var(--theme-primary-600)',
      bgColor: 'var(--theme-primary-50)',
      trend: stats.totalTasks > 0 ? {
        value: stats.completionRate,
        isPositive: stats.completionRate > 50,
        label: '完成率',
        suffix: '%'
      } : undefined
    },
    {
      id: 'today',
      title: '今日任务',
      value: stats.todayTasks,
      subtitle: '今天截止',
      icon: FiCalendar,
      color: 'var(--theme-info-600)',
      bgColor: 'var(--theme-info-50)',
    },
    {
      id: 'overdue',
      title: '逾期任务',
      value: stats.overdueTasks,
      subtitle: stats.overdueTasks > 0 ? '需要关注' : '保持良好',
      icon: FiAlertTriangle,
      color: 'var(--theme-error-600)',
      bgColor: 'var(--theme-error-50)',
      trend: stats.overdueTasks > 0 ? {
        value: stats.overdueTasks,
        isPositive: false,
        label: '逾期',
        suffix: '项'
      } : undefined
    },
    {
      id: 'week',
      title: '本周任务',
      value: stats.weekTasks,
      subtitle: format(new Date(), 'MM/dd') + ' - ' + format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'MM/dd'),
      icon: FiTrendingUp,
      color: 'var(--theme-success-600)',
      bgColor: 'var(--theme-success-50)',
    },
    {
      id: 'priority',
      title: '高优先级',
      value: stats.highPriorityTasks,
      subtitle: '重点关注',
      icon: FiActivity,
      color: 'var(--theme-warning-600)',
      bgColor: 'var(--theme-warning-50)',
    },
    {
      id: 'team',
      title: '团队在线',
      value: isConnected ? onlineCount : 0,
      subtitle: isConnected ? '人员在线' : '离线状态',
      icon: FiUsers,
      color: 'var(--theme-purple-600)',
      bgColor: 'var(--theme-purple-50)',
    },
  ], [stats, onlineCount, isConnected]);

  // 渲染单个统计卡片
  const renderStatCard = (card: StatCard, index: number) => (
    <motion.div
      key={card.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`
        relative overflow-hidden rounded-[26px] p-5 cursor-pointer transition-all duration-200 
        hover:shadow-md hover:scale-[1.01] active:scale-[0.98]
        ${card.onClick ? 'cursor-pointer' : ''}
      `}
      style={{ 
        background: `linear-gradient(180deg, color-mix(in srgb, ${card.bgColor} 26%, var(--theme-card-bg)) 0%, var(--theme-card-bg) 72%)`,
        border: '1px solid color-mix(in srgb, var(--theme-card-border) 78%, transparent)',
        boxShadow: '0 16px 36px rgba(15, 23, 42, 0.06)'
      }}
      onClick={card.onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 背景装饰 */}
      <div 
        className="absolute -right-5 -top-5 h-24 w-24 rounded-full opacity-20"
        style={{ backgroundColor: card.color }}
      />
      <div 
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }}
      />
      
      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <div 
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `color-mix(in srgb, ${card.bgColor} 82%, white)` }}
          >
            <card.icon 
              className="h-5 w-5" 
              style={{ color: card.color }} 
            />
          </div>
          
          {card.trend && (
            <div className={`
              flex items-center rounded-full px-2.5 py-1 text-xs font-semibold
              ${card.trend.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}
            `}>
              <FiTrendingUp className={`h-3 w-3 mr-1 ${card.trend.isPositive ? '' : 'rotate-180'}`} />
              {card.trend.value}{card.trend.suffix || ''}
            </div>
          )}
        </div>

        <div className="mb-2">
          <div 
            className="text-3xl font-semibold leading-none tracking-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {card.value}
          </div>
          <div 
            className="mt-2 text-sm font-medium"
            style={{ color: 'var(--theme-neutral-600)' }}
          >
            {card.title}
          </div>
        </div>

        {/* 副标题 */}
        {card.subtitle && (
          <div 
            className="text-xs leading-relaxed"
            style={{ color: 'var(--theme-neutral-500)' }}
          >
            {card.subtitle}
          </div>
        )}

        {/* 趋势标签 */}
        {card.trend && (
          <div 
            className="text-xs mt-2"
            style={{ color: 'var(--theme-neutral-400)' }}
          >
            {card.trend.label}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={`${className}`}>
      {/* 标题 */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 
            className="text-lg font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            数据概览
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--theme-neutral-500)' }}>
            以更清晰的方式查看任务节奏、优先级和团队在线状态
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium" style={{ color: 'var(--theme-neutral-500)', backgroundColor: 'color-mix(in srgb, var(--theme-card-bg) 78%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-card-border) 80%, transparent)' }}>
          <div className={`
            h-2 w-2 rounded-full animate-pulse
            ${isConnected ? 'bg-green-500' : 'bg-gray-400'}
          `} />
          {isConnected ? '实时数据已同步' : '当前显示离线数据'}
        </div>
      </div>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card, index) => renderStatCard(card, index))}
      </div>

      {/* 快速洞察 */}
      {stats.totalTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-5 rounded-[24px] p-4"
          style={{ 
            background: 'linear-gradient(135deg, rgba(var(--theme-primary-500-rgb), 0.08), rgba(var(--theme-info-500-rgb), 0.04))',
            border: '1px solid color-mix(in srgb, var(--theme-card-border) 70%, transparent)'
          }}
        >
          <div className="flex items-center">
            <FiActivity 
              className="h-4 w-4 mr-2" 
              style={{ color: 'var(--theme-primary-500)' }} 
            />
            <span 
              className="text-sm"
              style={{ color: 'var(--theme-neutral-600)' }}
            >
              {stats.overdueTasks > 0 ? (
                <span>
                  <span className="font-medium text-red-600">{stats.overdueTasks}</span> 个任务已逾期，建议优先处理
                </span>
              ) : stats.todayTasks > 0 ? (
                <span>
                  今日有 <span className="font-medium" style={{ color: 'var(--theme-primary-600)' }}>{stats.todayTasks}</span> 个任务截止
                </span>
              ) : (
                <span>
                  进展良好！完成率达到 <span className="font-medium" style={{ color: 'var(--theme-success-600)' }}>{stats.completionRate}%</span>
                </span>
              )}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StatsOverview;
