import { useEffect, useState, useCallback } from 'react';
import { webSocketManager } from '@/infrastructure/websocket/websocket-manager';
import { PresenceEvent, PresenceStatus } from '@/infrastructure/websocket/types';

/**
 * 用户在线状态数据结构
 */
export interface UserPresence {
  userId: number;
  username?: string;
  userAvatar?: string;
  status: string;
  lastActivity?: number;
  currentPage?: string;
  taskId?: number;
  timestamp: number;
}

/**
 * 团队在线状态Hook
 * 管理团队成员的在线状态和活动信息
 */
export function useTeamPresence(projectId?: number) {
  const [presenceMap, setPresenceMap] = useState<Map<number, UserPresence>>(new Map());
  const [isSubscribed, setIsSubscribed] = useState(false);

  /**
   * 更新用户状态
   */
  const updateUserPresence = useCallback((presenceEvent: PresenceEvent) => {
    setPresenceMap(prev => {
      const newMap = new Map(prev);
      
      const userPresence: UserPresence = {
        userId: presenceEvent.userId,
        username: presenceEvent.username,
        userAvatar: presenceEvent.userAvatar,
        status: presenceEvent.status,
        lastActivity: presenceEvent.lastActivity,
        currentPage: presenceEvent.currentPage,
        taskId: presenceEvent.taskId,
        timestamp: presenceEvent.timestamp
      };

      // 如果用户离线，从列表中移除（延迟移除）
      if (presenceEvent.status === PresenceStatus.OFFLINE) {
        setTimeout(() => {
          setPresenceMap(currentMap => {
            const updatedMap = new Map(currentMap);
            updatedMap.delete(presenceEvent.userId);
            return updatedMap;
          });
        }, 30000); // 30秒后移除离线用户
      } else {
        newMap.set(presenceEvent.userId, userPresence);
      }

      return newMap;
    });
  }, []);

  /**
   * 获取在线用户列表
   */
  const getOnlineUsers = useCallback((): UserPresence[] => {
    return Array.from(presenceMap.values()).filter(user => 
      user.status !== PresenceStatus.OFFLINE
    );
  }, [presenceMap]);

  /**
   * 获取特定状态的用户
   */
  const getUsersByStatus = useCallback((status: string): UserPresence[] => {
    return Array.from(presenceMap.values()).filter(user => user.status === status);
  }, [presenceMap]);

  /**
   * 获取正在查看特定任务的用户
   */
  const getUsersViewingTask = useCallback((taskId: number): UserPresence[] => {
    return Array.from(presenceMap.values()).filter(user => 
      user.taskId === taskId && 
      (user.status === PresenceStatus.VIEWING_TASK || user.status === PresenceStatus.EDITING_TASK)
    );
  }, [presenceMap]);

  /**
   * 获取用户当前状态
   */
  const getUserPresence = useCallback((userId: number): UserPresence | undefined => {
    return presenceMap.get(userId);
  }, [presenceMap]);

  /**
   * 判断用户是否在线
   */
  const isUserOnline = useCallback((userId: number): boolean => {
    const presence = presenceMap.get(userId);
    return presence ? presence.status !== PresenceStatus.OFFLINE : false;
  }, [presenceMap]);

  /**
   * 更新当前用户状态
   */
  const updateMyStatus = useCallback((status: string, taskId?: number) => {
    webSocketManager.updateUserStatus(status, taskId);
  }, []);

  /**
   * 清理状态数据
   */
  const clearPresence = useCallback(() => {
    setPresenceMap(new Map());
  }, []);

  // 监听用户状态事件
  useEffect(() => {
    const unsubscribe = webSocketManager.onPresence((presenceEvent) => {
      console.log('[useTeamPresence] Received presence event:', presenceEvent);
      
      // 只处理当前项目的用户状态
      if (projectId && presenceEvent.projectId === projectId) {
        updateUserPresence(presenceEvent);
      }
    });

    return unsubscribe;
  }, [updateUserPresence, projectId]);

  // 定期清理过期的状态数据
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const PRESENCE_TIMEOUT = 5 * 60 * 1000; // 5分钟

      setPresenceMap(prev => {
        const newMap = new Map(prev);
        let hasChanges = false;

        for (const [userId, presence] of newMap.entries()) {
          // 如果用户超过5分钟没有活动，标记为离线
          if (now - presence.timestamp > PRESENCE_TIMEOUT && presence.status !== PresenceStatus.OFFLINE) {
            newMap.set(userId, { ...presence, status: PresenceStatus.OFFLINE });
            hasChanges = true;
          }
        }

        return hasChanges ? newMap : prev;
      });
    }, 60000); // 每分钟检查一次

    return () => clearInterval(cleanupInterval);
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearPresence();
    };
  }, [clearPresence]);

  return {
    presenceMap,
    onlineUsers: getOnlineUsers(),
    isSubscribed,
    updateUserPresence,
    getOnlineUsers,
    getUsersByStatus,
    getUsersViewingTask,
    getUserPresence,
    isUserOnline,
    updateMyStatus,
    clearPresence
  };
}