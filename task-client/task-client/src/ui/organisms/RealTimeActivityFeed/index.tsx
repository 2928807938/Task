'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiMessageSquare, FiCheckCircle, FiClock, FiUserPlus, FiEdit3, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useActivityStore } from '@/store/websocket/useActivityStore';
import { useWebSocketStore } from '@/store/websocket/useWebSocketStore';
import { ActivityEvent } from '@/infrastructure/websocket/types';
import { WebSocketIndicator } from '@/ui/atoms/WebSocketIndicator';

interface RealTimeActivityFeedProps {
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
  projectId?: number;
}

/**
 * 实时活动动态组件
 * 显示团队协作活动的实时feed
 */
export const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({
  className = '',
  showHeader = true,
  maxHeight = '400px',
  projectId
}) => {
  const {
    filteredActivities,
    filters,
    setFilters,
    unreadCount,
    markAllAsRead
  } = useActivityStore();

  const {
    connectionStatus,
    isConnected,
    currentProjectId
  } = useWebSocketStore();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // 设置项目过滤器
  useEffect(() => {
    if (projectId) {
      setFilters({ projectId });
    } else if (currentProjectId) {
      setFilters({ projectId: currentProjectId });
    }
  }, [projectId, currentProjectId, setFilters]);

  // 获取活动图标
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'TASK_CREATED':
        return FiCheckCircle;
      case 'TASK_UPDATED':
      case 'TASK_STATUS_CHANGED':
        return FiEdit3;
      case 'TASK_ASSIGNED':
        return FiUserPlus;
      case 'TASK_COMMENTED':
        return FiMessageSquare;
      case 'USER_JOINED_PROJECT':
        return FiUsers;
      default:
        return FiClock;
    }
  };

  // 获取活动颜色
  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'TASK_CREATED':
        return 'text-green-500';
      case 'TASK_UPDATED':
      case 'TASK_STATUS_CHANGED':
        return 'text-blue-500';
      case 'TASK_ASSIGNED':
        return 'text-purple-500';
      case 'TASK_COMMENTED':
        return 'text-orange-500';
      case 'USER_JOINED_PROJECT':
        return 'text-indigo-500';
      default:
        return 'text-gray-500';
    }
  };

  // 格式化时间
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return new Date(timestamp).toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // 过滤器选项
  const filterOptions = [
    { value: 'all', label: '全部', icon: FiClock },
    { value: 'TASK_CREATED', label: '任务创建', icon: FiCheckCircle },
    { value: 'TASK_ASSIGNED', label: '任务分配', icon: FiUserPlus },
    { value: 'TASK_COMMENTED', label: '评论', icon: FiMessageSquare },
    { value: 'TASK_STATUS_CHANGED', label: '状态变更', icon: FiEdit3 }
  ];

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      setFilters({ activityType: undefined });
    } else {
      setFilters({ activityType: filter });
    }
  };

  const ActivityItem: React.FC<{ activity: ActivityEvent; index: number }> = ({ activity, index }) => {
    const IconComponent = getActivityIcon(activity.activityType);
    const colorClass = getActivityColor(activity.activityType);

    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-200"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 flex-shrink-0 ${colorClass}`}>
          <IconComponent className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {activity.userName || activity.userId}
            </span>
            {activity.projectName && (
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {activity.projectName}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">
            {activity.content}
          </p>

          {activity.taskTitle && (
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md inline-block mb-1">
              {activity.taskTitle}
            </div>
          )}

          <div className="text-xs text-gray-400">
            {formatTimestamp(activity.timestamp)}
          </div>
        </div>

        {!activity.metadata?.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
        )}
      </motion.div>
    );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 mb-4">
        <FiMessageSquare className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        暂无活动动态
      </h3>
      <p className="text-xs text-gray-500 max-w-[200px]">
        {isConnected ? '当前项目还没有协作活动' : '请检查网络连接状态'}
      </p>
    </div>
  );

  return (
    <div className={`rounded-lg border bg-white dark:bg-gray-900 shadow-sm ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              协作动态
            </h2>
            <WebSocketIndicator status={connectionStatus} className="text-xs" />
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                全部已读
              </button>
            )}
            
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {filteredActivities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-2">
            <AnimatePresence mode="popLayout">
              {filteredActivities.slice(0, 20).map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  index={index}
                />
              ))}
            </AnimatePresence>

            {filteredActivities.length > 20 && (
              <div className="text-center py-3">
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  查看更多活动
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!isConnected && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-yellow-50 dark:bg-yellow-900/10">
          <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-400">
            <FiRefreshCw className="w-4 h-4" />
            <span className="text-xs">实时连接已断开，活动更新可能有延迟</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeActivityFeed;