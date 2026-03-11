'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useWebSocketStore, initializeWebSocketEventListeners } from '@/store/websocket/useWebSocketStore';
import { useActivityStore } from '@/store/websocket/useActivityStore';
import { usePresenceStore } from '@/store/websocket/usePresenceStore';
import { useNotificationStore } from '@/store/websocket/useNotificationStore';
import { WebSocketConnectionStatus } from '@/infrastructure/websocket/types';
import { webSocketManager } from '@/infrastructure/websocket/websocket-manager';
import { useCurrentUser } from '@/hooks/use-user-hook';
import { useToast } from '@/ui/molecules/Toast';

interface WebSocketContextValue {
  // 连接状态
  connectionStatus: WebSocketConnectionStatus;
  isConnected: boolean;
  error: string | null;
  
  // 统计信息
  onlineCount: number;
  unreadActivityCount: number;
  unreadNotificationCount: number;
  
  // 控制方法
  joinProject: (projectId: number) => void;
  leaveProject: () => void;
  updateUserStatus: (status: string, taskId?: number) => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

/**
 * WebSocket全局Provider
 * 统一管理WebSocket连接，避免多个组件重复初始化
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  autoConnect = true
}) => {
  const { showToast } = useToast();
  const { user } = useCurrentUser();

  // WebSocket状态
  const {
    connectionStatus,
    isConnected,
    error,
    initialize,
    destroy,
    joinProject: storeJoinProject,
    leaveProject: storeLeaveProject,
    updateUserStatus: storeUpdateUserStatus,
    currentProjectId
  } = useWebSocketStore();

  // 活动和通知状态
  const { unreadCount: unreadActivityCount } = useActivityStore();
  const { unreadCount: unreadNotificationCount } = useNotificationStore();
  const { totalOnlineCount } = usePresenceStore();

  // 初始化WebSocket事件监听器
  useEffect(() => {
    console.log('[WebSocketProvider] Initializing event listeners...');
    const cleanup = initializeWebSocketEventListeners();
    
    return () => {
      console.log('[WebSocketProvider] Cleaning up event listeners...');
      cleanup?.();
    };
  }, []);

  // 自动连接逻辑
  useEffect(() => {
    if (!autoConnect || !user?.id) {
      return;
    }

    // 获取存储的token
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[WebSocketProvider] No auth token found, skipping auto-connect');
      return;
    }

    // 如果已经连接且是同一个用户，跳过
    if (isConnected) {
      console.log('[WebSocketProvider] Already connected, skipping initialization');
      return;
    }

    console.log('[WebSocketProvider] Auto-connecting WebSocket for user:', user.id);
    initialize(token, user.id);

    // 清理函数
    return () => {
      console.log('[WebSocketProvider] Cleaning up WebSocket connection...');
      destroy();
    };
  }, [autoConnect, user?.id, isConnected, initialize, destroy]);

  // 监听连接状态变化并显示通知
  useEffect(() => {
    switch (connectionStatus) {
      case WebSocketConnectionStatus.CONNECTED:
        showToast?.({
          type: 'success',
          message: '实时功能已连接',
          duration: 2000
        });
        break;
      
      case WebSocketConnectionStatus.ERROR:
        showToast?.({
          type: 'error',
          message: '实时功能连接失败',
          duration: 3000
        });
        break;
      
      case WebSocketConnectionStatus.DISCONNECTED:
        if (isConnected) { // 只在从连接状态变为断开时提醒
          showToast?.({
            type: 'warning',
            message: '实时功能已断开',
            duration: 3000
          });
        }
        break;
    }
  }, [connectionStatus, showToast, isConnected]);

  // 监听错误状态
  useEffect(() => {
    if (error) {
      console.error('[WebSocketProvider] WebSocket error:', error);
      showToast?.({
        type: 'error',
        message: `连接错误: ${error}`,
        duration: 5000
      });
    }
  }, [error, showToast]);

  // 重连方法
  const reconnect = () => {
    if (!user?.id) {
      console.warn('[WebSocketProvider] Cannot reconnect - no user');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[WebSocketProvider] Cannot reconnect - no token');
      return;
    }

    console.log('[WebSocketProvider] Manual reconnection initiated');
    destroy();
    
    // 延迟重连，确保断开完成
    setTimeout(() => {
      initialize(token, user.id);
    }, 1000);
  };

  // Context值
  const contextValue: WebSocketContextValue = {
    connectionStatus,
    isConnected,
    error,
    onlineCount: totalOnlineCount,
    unreadActivityCount,
    unreadNotificationCount,
    joinProject: storeJoinProject,
    leaveProject: storeLeaveProject,
    updateUserStatus: storeUpdateUserStatus,
    reconnect
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * 使用WebSocket Context的Hook
 */
export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
};

/**
 * 项目级别的WebSocket管理Hook
 * 自动处理项目切换时的频道管理
 */
export const useProjectWebSocket = (projectId?: number) => {
  const { isConnected, joinProject, leaveProject, updateUserStatus } = useWebSocket();
  
  useEffect(() => {
    if (!isConnected || !projectId) {
      return;
    }
    
    console.log(`[useProjectWebSocket] Joining project ${projectId}`);
    joinProject(projectId);
    
    return () => {
      console.log(`[useProjectWebSocket] Leaving project ${projectId}`);
      leaveProject();
    };
  }, [isConnected, projectId, joinProject, leaveProject]);
  
  return {
    updateUserStatus
  };
};