'use client';

import { useEffect, useCallback } from 'react';
import { useWebSocketStore } from '@/store/websocket/useWebSocketStore';
import { useActivityStore } from '@/store/websocket/useActivityStore';
import { usePresenceStore } from '@/store/websocket/usePresenceStore';
import { useNotificationStore } from '@/store/websocket/useNotificationStore';
import { 
  initializeWebSocketEventListeners,
  initializeActivityEventListeners,
  initializePresenceEventListeners,
  initializeNotificationEventListeners
} from '@/infrastructure/websocket/event-listeners';

interface UseRealTimeActivityOptions {
  autoConnect?: boolean;
  projectId?: number;
}

/**
 * 实时活动动态Hook
 * 管理WebSocket连接和实时数据更新
 */
export const useRealTimeActivity = (options: UseRealTimeActivityOptions = {}) => {
  const { autoConnect = true, projectId } = options;

  const {
    isConnected,
    connectionStatus,
    initialize,
    joinProject,
    leaveProject,
    currentProjectId
  } = useWebSocketStore();

  const {
    filteredActivities,
    unreadCount,
    setFilters,
    markAllAsRead
  } = useActivityStore();

  const {
    onlineUsers,
    totalOnlineCount,
    setMyStatus
  } = usePresenceStore();

  const {
    unreadCount: notificationCount
  } = useNotificationStore();

  // 初始化事件监听器
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // 初始化各种事件监听器
    const cleanupWebSocket = initializeWebSocketEventListeners();
    const cleanupActivity = initializeActivityEventListeners();
    const cleanupPresence = initializePresenceEventListeners();
    const cleanupNotification = initializeNotificationEventListeners();

    if (cleanupWebSocket) cleanupFunctions.push(cleanupWebSocket);
    if (cleanupActivity) cleanupFunctions.push(cleanupActivity);
    if (cleanupPresence) cleanupFunctions.push(cleanupPresence);
    if (cleanupNotification) cleanupFunctions.push(cleanupNotification);

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);

  // 自动连接WebSocket
  useEffect(() => {
    if (!autoConnect || isConnected) {
      return;
    }

    // 获取JWT token和用户信息
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id) {
          console.log('[useRealTimeActivity] Initializing WebSocket connection');
          initialize(token, user.id);
        }
      } catch (error) {
        console.error('[useRealTimeActivity] Failed to parse user data:', error);
      }
    }
  }, [autoConnect, isConnected, initialize]);

  // 项目切换逻辑
  useEffect(() => {
    if (!isConnected || !projectId) {
      return;
    }

    // 如果当前项目ID和目标项目ID不同，切换项目
    if (currentProjectId !== projectId) {
      console.log(`[useRealTimeActivity] Switching to project ${projectId}`);
      joinProject(projectId);
    }

    return () => {
      // 组件卸载时离开项目（可选）
      if (currentProjectId === projectId) {
        leaveProject();
      }
    };
  }, [isConnected, projectId, currentProjectId, joinProject, leaveProject]);

  // 设置用户活动状态
  const updateUserStatus = useCallback((status: string, taskId?: number) => {
    setMyStatus(status, taskId);
  }, [setMyStatus]);

  // 设置活动过滤器
  const setActivityFilters = useCallback((filters: Parameters<typeof setFilters>[0]) => {
    setFilters(filters);
  }, [setFilters]);

  // 标记所有活动为已读
  const markActivitiesAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return {
    // 连接状态
    isConnected,
    connectionStatus,
    
    // 活动数据
    activities: filteredActivities,
    unreadActivityCount: unreadCount,
    
    // 在线用户信息
    onlineUsers,
    onlineCount: totalOnlineCount,
    
    // 通知数据
    notificationCount,
    
    // 操作方法
    updateUserStatus,
    setActivityFilters,
    markActivitiesAsRead,
    joinProject: (id: number) => joinProject(id),
    leaveProject
  };
};