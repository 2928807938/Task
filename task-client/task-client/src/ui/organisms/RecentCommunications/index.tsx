"use client";

import React, { useEffect, useMemo } from 'react';
import { Avatar } from '@/ui/atoms/Avatar';
import { FiMessageCircle, FiClock, FiUsers, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivityStore } from '@/store/websocket/useActivityStore';
import { useWebSocketStore } from '@/store/websocket/useWebSocketStore';
import { useRealTimeActivity } from '@/hooks/use-real-time-activity';
import { ActivityEvent } from '@/infrastructure/websocket/types';

interface Communication {
  id: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  message: string;
  time: string;
  timestamp: number;
  taskTitle?: string;
  isNew?: boolean;
  activityType: string;
}

interface RecentCommunicationsProps {
  projectId?: number;
  maxItems?: number;
  className?: string;
  onCommunicationClick?: (communication: Communication) => void;
}

/**
 * 最近沟通记录组件
 * 显示最近的团队沟通和协作活动
 */
const RecentCommunications: React.FC<RecentCommunicationsProps> = ({
  projectId,
  maxItems = 5,
  className = '',
  onCommunicationClick
}) => {
  const {
    filteredActivities,
    setFilters,
    unreadCount
  } = useActivityStore();

  const {
    isConnected
  } = useWebSocketStore();

  // 初始化实时活动功能
  const { 
    activities: realTimeActivities
  } = useRealTimeActivity({
    autoConnect: true,
    projectId: projectId
  });

  // 设置过滤器，只显示沟通相关的活动
  useEffect(() => {
    setFilters({
      projectId: projectId,
      activityType: undefined, // 显示所有类型，后续在组件内过滤
    });
  }, [projectId, setFilters]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  // 将活动事件转换为沟通记录
  const convertActivityToCommunication = (activity: ActivityEvent): Communication | null => {
    // 只显示沟通相关的活动类型
    const communicationTypes = [
      'TASK_COMMENTED',
      'USER_MENTIONED', 
      'TASK_ASSIGNED',
      'TASK_STATUS_CHANGED',
      'USER_JOINED_PROJECT'
    ];

    if (!communicationTypes.includes(activity.activityType)) {
      return null;
    }

    const getMessage = () => {
      switch (activity.activityType) {
        case 'TASK_COMMENTED':
          return activity.taskTitle ? `在任务「${activity.taskTitle}」中评论` : '添加了评论';
        case 'USER_MENTIONED':
          return activity.taskTitle ? `在任务「${activity.taskTitle}」中提及了你` : '提及了你';
        case 'TASK_ASSIGNED':
          return activity.taskTitle ? `分配了任务「${activity.taskTitle}」` : '分配了任务';
        case 'TASK_STATUS_CHANGED':
          return activity.taskTitle ? `更新了任务「${activity.taskTitle}」状态` : '更新了任务状态';
        case 'USER_JOINED_PROJECT':
          return activity.projectName ? `加入了项目「${activity.projectName}」` : '加入了项目';
        default:
          return activity.content || '进行了协作活动';
      }
    };

    return {
      id: activity.id,
      userId: activity.userId,
      userName: activity.userName || `用户${activity.userId}`,
      userAvatar: activity.userAvatar,
      message: getMessage(),
      time: formatTime(activity.timestamp),
      timestamp: activity.timestamp,
      taskTitle: activity.taskTitle,
      isNew: Date.now() - activity.timestamp < 300000, // 5分钟内为新消息
      activityType: activity.activityType
    };
  };

  // 合并并转换活动数据为沟通记录
  const communications = useMemo(() => {
    const allActivities = [...filteredActivities, ...realTimeActivities];
    const uniqueActivities = Array.from(
      new Map(allActivities.map(activity => [activity.id, activity])).values()
    );
    
    return uniqueActivities
      .map(convertActivityToCommunication)
      .filter((comm): comm is Communication => comm !== null)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxItems);
  }, [filteredActivities, realTimeActivities, maxItems]);

  // 获取活动类型对应的颜色
  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'TASK_COMMENTED':
        return 'text-orange-500';
      case 'USER_MENTIONED':
        return 'text-purple-500';
      case 'TASK_ASSIGNED':
        return 'text-blue-500';
      case 'TASK_STATUS_CHANGED':
        return 'text-green-500';
      case 'USER_JOINED_PROJECT':
        return 'text-indigo-500';
      default:
        return 'text-gray-500';
    }
  };

  // 处理沟通记录点击
  const handleCommunicationClick = (communication: Communication) => {
    onCommunicationClick?.(communication);
    
    // 根据沟通类型跳转到相应页面
    if (communication.taskTitle) {
      // 跳转到任务详情页（这里需要从activity中获取taskId）
      // TODO: 需要从activity metadata中获取taskId
      console.log('Navigate to task details:', communication.taskTitle);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3 }}
      className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 w-full ${className}`}
    >
      {/* 卡片顶部彩条 */}
      <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500"></div>

      <div className="p-4">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
              <FiMessageCircle className="text-blue-500 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">最近沟通</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">团队协作动态</p>
            </div>
          </div>
          
          {/* 连接状态指示器 */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* 沟通记录列表 */}
        <div className="space-y-3 overflow-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1">
          <AnimatePresence mode="popLayout">
            {communications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 mb-3">
                  <FiUsers className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">暂无最近沟通</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {isConnected ? '团队活动将在这里显示' : '连接断开，无法获取数据'}
                </p>
              </motion.div>
            ) : (
              communications.map((comm, index) => (
                <motion.div
                  key={comm.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group"
                  onClick={() => handleCommunicationClick(comm)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar
                        name={comm.userName}
                        size="sm"
                        className="shadow-sm"
                      />
                      {comm.isNew && (
                        <span className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center w-3 h-3 text-[8px] font-bold text-white bg-red-500 rounded-full shadow-md">
                          新
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                          {comm.userName}
                        </h3>
                        <div className={`w-1.5 h-1.5 rounded-full ${getActivityColor(comm.activityType)}`} />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{comm.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                    <FiClock className="w-3 h-3 mr-1 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{comm.time}</span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* 连接状态提示 */}
        {!isConnected && (
          <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-400">
              <FiRefreshCw className="w-4 h-4" />
              <span className="text-xs">实时连接已断开</span>
            </div>
          </div>
        )}

        {/* 查看更多链接 */}
        {communications.length >= maxItems && (
          <div className="mt-4 text-center">
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors">
              查看更多沟通记录
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentCommunications;
