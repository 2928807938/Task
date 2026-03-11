import { useEffect, useState, useCallback } from 'react';
import { webSocketManager } from '@/infrastructure/websocket/websocket-manager';
import { ActivityEvent } from '@/infrastructure/websocket/types';

/**
 * 实时活动Hook
 * 监听和管理实时活动事件
 */
export function useRealTimeActivity(projectId?: number) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  /**
   * 添加新活动到列表
   */
  const addActivity = useCallback((activity: ActivityEvent) => {
    setActivities(prev => {
      // 防止重复添加
      const exists = prev.some(a => a.id === activity.id);
      if (exists) {
        return prev;
      }

      // 保持最新的50条活动记录
      const newActivities = [activity, ...prev].slice(0, 50);
      
      // 按时间排序
      return newActivities.sort((a, b) => b.timestamp - a.timestamp);
    });
  }, []);

  /**
   * 清理活动列表
   */
  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  /**
   * 获取特定类型的活动
   */
  const getActivitiesByType = useCallback((activityType: string) => {
    return activities.filter(activity => activity.activityType === activityType);
  }, [activities]);

  /**
   * 获取特定用户的活动
   */
  const getActivitiesByUser = useCallback((userId: number) => {
    return activities.filter(activity => activity.userId === userId);
  }, [activities]);

  /**
   * 加入项目频道
   */
  const joinProject = useCallback((projectId: number) => {
    if (webSocketManager.isConnected()) {
      webSocketManager.joinProject(projectId);
      setIsSubscribed(true);
    }
  }, []);

  /**
   * 离开项目频道
   */
  const leaveProject = useCallback(() => {
    webSocketManager.leaveProject();
    setIsSubscribed(false);
    clearActivities();
  }, [clearActivities]);

  // 监听活动事件
  useEffect(() => {
    const unsubscribe = webSocketManager.onActivity((activity) => {
      console.log('[useRealTimeActivity] Received activity:', activity);
      
      // 只处理当前项目的活动
      if (projectId && activity.projectId === projectId) {
        addActivity(activity);
      }
    });

    return unsubscribe;
  }, [addActivity, projectId]);

  // 自动加入项目频道
  useEffect(() => {
    if (projectId && webSocketManager.isConnected() && !isSubscribed) {
      joinProject(projectId);
    }
  }, [projectId, joinProject, isSubscribed]);

  // 监听连接状态，连接后重新订阅
  useEffect(() => {
    const unsubscribe = webSocketManager.onConnectionChange((status) => {
      if (status === 'connected' && projectId) {
        joinProject(projectId);
      } else if (status === 'disconnected') {
        setIsSubscribed(false);
      }
    });

    return unsubscribe;
  }, [projectId, joinProject]);

  return {
    activities,
    isSubscribed,
    addActivity,
    clearActivities,
    getActivitiesByType,
    getActivitiesByUser,
    joinProject,
    leaveProject
  };
}