import { useEffect, useState, useCallback } from 'react';
import { webSocketManager } from '@/infrastructure/websocket/websocket-manager';
import { NotificationEvent } from '@/infrastructure/websocket/types';
import toast from 'react-hot-toast';

/**
 * 通知数据结构
 */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  timestamp: number;
  read: boolean;
  important: boolean;
}

/**
 * 实时通知Hook
 * 管理实时通知的接收、显示和状态
 */
export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * 添加新通知
   */
  const addNotification = useCallback((notificationEvent: NotificationEvent) => {
    const notification: Notification = {
      id: `notification_${Date.now()}_${Math.random()}`,
      type: notificationEvent.type,
      title: notificationEvent.title,
      message: notificationEvent.message,
      metadata: notificationEvent.metadata,
      timestamp: notificationEvent.timestamp,
      read: false,
      important: isImportantNotification(notificationEvent.type)
    };

    setNotifications(prev => {
      // 保持最新的100条通知
      const newNotifications = [notification, ...prev].slice(0, 100);
      return newNotifications;
    });

    // 显示toast通知
    if (notification.important) {
      toast.success(notification.message, {
        duration: 5000,
        position: 'top-right'
      });
    } else {
      toast(notification.message, {
        duration: 3000,
        position: 'top-right'
      });
    }
  }, []);

  /**
   * 标记通知为已读
   */
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  /**
   * 标记所有通知为已读
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  /**
   * 删除通知
   */
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  /**
   * 清空所有通知
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * 获取未读通知
   */
  const getUnreadNotifications = useCallback((): Notification[] => {
    return notifications.filter(notification => !notification.read);
  }, [notifications]);

  /**
   * 获取重要通知
   */
  const getImportantNotifications = useCallback((): Notification[] => {
    return notifications.filter(notification => notification.important);
  }, [notifications]);

  /**
   * 获取特定类型的通知
   */
  const getNotificationsByType = useCallback((type: string): Notification[] => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  /**
   * 判断是否为重要通知
   */
  const isImportantNotification = useCallback((type: string): boolean => {
    const importantTypes = [
      'TASK_ASSIGNED',
      'USER_MENTIONED',
      'URGENT_TASK_UPDATE',
      'DEADLINE_REMINDER',
      'SYSTEM_NOTIFICATION'
    ];
    return importantTypes.includes(type);
  }, []);

  // 监听实时通知
  useEffect(() => {
    const unsubscribe = webSocketManager.onNotification((notificationEvent) => {
      console.log('[useRealTimeNotifications] Received notification:', notificationEvent);
      addNotification(notificationEvent);
    });

    return unsubscribe;
  }, [addNotification]);

  // 计算未读通知数量
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setUnreadCount(unreadCount);
  }, [notifications]);

  // 浏览器通知权限处理
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('[useRealTimeNotifications] Notification permission:', permission);
      });
    }
  }, []);

  // 显示浏览器原生通知（可选）
  const showBrowserNotification = useCallback((notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.important,
        silent: !notification.important
      });

      browserNotification.onclick = () => {
        window.focus();
        markAsRead(notification.id);
        browserNotification.close();
      };

      // 自动关闭
      setTimeout(() => {
        browserNotification.close();
      }, notification.important ? 8000 : 4000);
    }
  }, [markAsRead]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadNotifications,
    getImportantNotifications,
    getNotificationsByType,
    showBrowserNotification
  };
}