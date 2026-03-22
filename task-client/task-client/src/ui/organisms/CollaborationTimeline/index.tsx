'use client';

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiMessageSquare, 
  FiCheckCircle, 
  FiClock, 
  FiUserPlus, 
  FiEdit3, 
  FiFilter,
  FiRefreshCw,
  FiArrowUp,
  FiActivity
} from 'react-icons/fi';
import { Avatar } from '@/ui/atoms/Avatar';
import { useActivityStore } from '@/store/websocket/useActivityStore';
import { useWebSocketStore } from '@/store/websocket/useWebSocketStore';
import { useWebSocket } from '@/contexts/WebSocketProvider';
import { ActivityEvent } from '@/infrastructure/websocket/types';
import { WebSocketErrorBoundary } from '@/ui/organisms/WebSocketErrorBoundary';
import { WebSocketDiagnostics } from '@/ui/organisms/WebSocketDiagnostics';

interface CollaborationTimelineProps {
  projectId?: number;
  taskId?: number;
  maxItems?: number;
  showHeader?: boolean;
  autoRefresh?: boolean;
  className?: string;
  onActivityClick?: (activity: ActivityEvent) => void;
}

/**
 * 协作时间线组件
 * 显示项目或任务的协作活动历史，支持实时更新
 */
export const CollaborationTimeline: React.FC<CollaborationTimelineProps> = ({
  projectId,
  taskId,
  maxItems = 20,
  showHeader = true,
  autoRefresh = true,
  className = '',
  onActivityClick
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
    isConnected
  } = useWebSocketStore();

  // 使用统一的WebSocket连接，移除重复初始化
  const { updateUserStatus } = useWebSocket();
  
  // 如果需要特定项目的WebSocket管理，使用useProjectWebSocket
  useEffect(() => {
    if (projectId) {
      // 项目切换逻辑已在WebSocketProvider中处理
      console.log(`[CollaborationTimeline] Connected to project ${projectId}`);
    }
  }, [projectId]);

  // 设置过滤器
  useEffect(() => {
    if (projectId || taskId) {
      setFilters({
        projectId: projectId,
        taskId: taskId
      });
    }
  }, [projectId, taskId, setFilters]);

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
        return FiActivity;
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

  // 使用过滤后的活动数据（实时数据已在store中合并）
  const mergedActivities = useMemo(() => {
    return filteredActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxItems);
  }, [filteredActivities, maxItems]);

  // 处理活动点击
  const handleActivityClick = (activity: ActivityEvent) => {
    onActivityClick?.(activity);
    
    // 可以根据活动类型跳转到相应页面
    if (activity.taskId) {
      // 跳转到任务详情
      window.location.href = `/task-detail?id=${activity.taskId}`;
    } else if (activity.projectId) {
      // 跳转到项目详情
      window.location.href = `/project-detail?id=${activity.projectId}`;
    }
  };

  const TimelineItem: React.FC<{ 
    activity: ActivityEvent; 
    index: number;
    isLast: boolean;
  }> = ({ activity, index, isLast }) => {
    const IconComponent = getActivityIcon(activity.activityType);
    const colorClass = getActivityColor(activity.activityType);

    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="relative flex items-start space-x-4 pb-6"
      >
        {/* 时间轴连接线 */}
        {!isLast && (
          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        )}

        {/* 活动图标 */}
        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-sm ${colorClass}`}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* 活动内容 */}
        <div className="flex-1 min-w-0">
          <div 
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleActivityClick(activity)}
          >
            {/* 活动头部 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Avatar 
                  name={activity.userName || activity.userId.toString()} 
                  size="xs" 
                  className="flex-shrink-0"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.userName || `用户${activity.userId}`}
                </span>
                {activity.projectName && (
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {activity.projectName}
                  </span>
                )}
              </div>
              <time className="text-xs text-gray-400 dark:text-gray-500">
                {formatTimestamp(activity.timestamp)}
              </time>
            </div>

            {/* 活动描述 */}
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              {activity.content}
            </p>

            {/* 关联任务 */}
            {activity.taskTitle && (
              <div className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                <FiCheckCircle className="w-3 h-3 mr-1" />
                {activity.taskTitle}
              </div>
            )}

            {/* 活动元数据 */}
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                {/* 可以根据需要展示额外的元数据信息 */}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 mb-4">
        <FiActivity className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        暂无协作活动
      </h3>
      <p className="text-xs text-gray-500 max-w-[200px]">
        {isConnected ? '还没有协作活动记录' : '连接断开，无法获取活动数据'}
      </p>
      {!isConnected && (
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          <FiRefreshCw className="w-3 h-3 mr-1" />
          重新连接
        </button>
      )}
    </div>
  );

  return (
    <WebSocketErrorBoundary 
      connectionStatus={connectionStatus}
      onRetry={() => {
        // 重新初始化实时活动
        const { initialize } = useWebSocketStore.getState();
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user?.id) {
              initialize(token, user.id);
            }
          } catch (error) {
            console.error('Failed to parse user data:', error);
          }
        }
      }}
    >
      <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                协作时间线
              </h2>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
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
              
              {autoRefresh && (
                <button
                  onClick={() => window.location.reload()}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="刷新"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="p-4">
          {mergedActivities.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-0">
              <AnimatePresence mode="popLayout">
                {mergedActivities.map((activity, index) => (
                  <TimelineItem
                    key={activity.id}
                    activity={activity}
                    index={index}
                    isLast={index === mergedActivities.length - 1}
                  />
                ))}
              </AnimatePresence>

              {mergedActivities.length >= maxItems && (
                <div className="text-center pt-4">
                  <button 
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => {
                      // 展开更多历史记录
                      console.log('Load more activities');
                    }}
                  >
                    查看更多活动
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* WebSocket诊断工具 - 开发环境显示 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <WebSocketDiagnostics className="max-w-full" />
          </div>
        )}

        {!isConnected && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-yellow-50 dark:bg-yellow-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-400">
                <FiRefreshCw className="w-4 h-4" />
                <span className="text-xs">实时连接已断开，活动更新可能有延迟</span>
              </div>
              <button
                onClick={() => {
                  updateUserStatus('reconnecting');
                }}
                className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline"
              >
                重新连接
              </button>
            </div>
          </div>
        )}
      </div>
    </WebSocketErrorBoundary>
  );
};
