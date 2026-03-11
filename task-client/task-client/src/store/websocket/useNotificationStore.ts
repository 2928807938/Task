import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import { NotificationEvent } from '@/infrastructure/websocket/types';
import { webSocketManager } from '@/infrastructure/websocket/websocket-manager';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  timestamp: number;
  read: boolean;
  important: boolean;
  dismissed: boolean;
}

interface NotificationState {
  // 通知数据
  notifications: Notification[];
  notificationMap: Map<string, Notification>;
  
  // 过滤和分组
  unreadNotifications: Notification[];
  importantNotifications: Notification[];
  
  // 统计
  unreadCount: number;
  importantCount: number;
  totalCount: number;
  
  // 设置
  settings: {
    enableToast: boolean;
    enableBrowser: boolean;
    enableSound: boolean;
    maxNotifications: number;
    autoMarkReadDelay: number;
  };
  
  // 动作
  addNotification: (notificationEvent: NotificationEvent) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
  dismissAll: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // 设置管理
  updateSettings: (settings: Partial<NotificationState['settings']>) => void;
  
  // 查询方法
  getNotificationsByType: (type: string) => Notification[];
  getRecentNotifications: (limit?: number) => Notification[];
  searchNotifications: (query: string) => Notification[];
}

/**
 * 通知管理Store
 */
export const useNotificationStore = create<NotificationState>()(
  subscribeWithSelector(
    devtools(
      persist((set, get) => ({
        // 初始状态
        notifications: [],
        notificationMap: new Map(),
        unreadNotifications: [],
        importantNotifications: [],
        unreadCount: 0,
        importantCount: 0,
        totalCount: 0,
        
        // 默认设置
        settings: {
          enableToast: true,
          enableBrowser: false,
          enableSound: false,
          maxNotifications: 100,
          autoMarkReadDelay: 5000
        },

        // 添加新通知
        addNotification: (notificationEvent) => {
          set((state) => {
            const notification: Notification = {
              id: `notification_${Date.now()}_${Math.random()}`,
              type: notificationEvent.type,
              title: notificationEvent.title,
              message: notificationEvent.message,
              metadata: notificationEvent.metadata,
              timestamp: notificationEvent.timestamp,
              read: false,
              important: isImportantNotification(notificationEvent.type),
              dismissed: false
            };

            const newNotificationMap = new Map(state.notificationMap);
            newNotificationMap.set(notification.id, notification);

            // 保持最新的通知数量限制
            const newNotifications = [notification, ...state.notifications]
              .slice(0, state.settings.maxNotifications);

            // 清理过期的通知映射
            const notificationIds = new Set(newNotifications.map(n => n.id));
            for (const [id] of newNotificationMap) {
              if (!notificationIds.has(id)) {
                newNotificationMap.delete(id);
              }
            }

            const newState = {
              ...state,
              notifications: newNotifications,
              notificationMap: newNotificationMap,
              ...updateDerivedData(newNotifications),
              totalCount: state.totalCount + 1
            };

            // 显示通知
            showNotification(notification, state.settings);

            // 自动标记已读（可选）
            if (state.settings.autoMarkReadDelay > 0 && !notification.important) {
              setTimeout(() => {
                const currentState = useNotificationStore.getState();
                if (currentState.notificationMap.has(notification.id)) {
                  currentState.markAsRead(notification.id);
                }
              }, state.settings.autoMarkReadDelay);
            }

            return newState;
          });
        },

        // 标记为已读
        markAsRead: (notificationId) => {
          set((state) => {
            const notification = state.notificationMap.get(notificationId);
            if (!notification || notification.read) {
              return state;
            }

            const updatedNotification = { ...notification, read: true };
            const newNotificationMap = new Map(state.notificationMap);
            newNotificationMap.set(notificationId, updatedNotification);

            const newNotifications = state.notifications.map(n =>
              n.id === notificationId ? updatedNotification : n
            );

            return {
              ...state,
              notifications: newNotifications,
              notificationMap: newNotificationMap,
              ...updateDerivedData(newNotifications)
            };
          });
        },

        // 全部标记为已读
        markAllAsRead: () => {
          set((state) => {
            const newNotificationMap = new Map();
            const newNotifications = state.notifications.map(notification => {
              const updatedNotification = { ...notification, read: true };
              newNotificationMap.set(notification.id, updatedNotification);
              return updatedNotification;
            });

            return {
              ...state,
              notifications: newNotifications,
              notificationMap: newNotificationMap,
              ...updateDerivedData(newNotifications)
            };
          });
        },

        // 忽略通知
        dismissNotification: (notificationId) => {
          set((state) => {
            const notification = state.notificationMap.get(notificationId);
            if (!notification) {
              return state;
            }

            const updatedNotification = { ...notification, dismissed: true };
            const newNotificationMap = new Map(state.notificationMap);
            newNotificationMap.set(notificationId, updatedNotification);

            const newNotifications = state.notifications.map(n =>
              n.id === notificationId ? updatedNotification : n
            );

            return {
              ...state,
              notifications: newNotifications,
              notificationMap: newNotificationMap,
              ...updateDerivedData(newNotifications)
            };
          });
        },

        // 忽略全部
        dismissAll: () => {
          set((state) => {
            const newNotificationMap = new Map();
            const newNotifications = state.notifications.map(notification => {
              const updatedNotification = { ...notification, dismissed: true };
              newNotificationMap.set(notification.id, updatedNotification);
              return updatedNotification;
            });

            return {
              ...state,
              notifications: newNotifications,
              notificationMap: newNotificationMap,
              ...updateDerivedData(newNotifications)
            };
          });
        },

        // 删除通知
        removeNotification: (notificationId) => {
          set((state) => {
            const newNotificationMap = new Map(state.notificationMap);
            newNotificationMap.delete(notificationId);

            const newNotifications = state.notifications.filter(n => n.id !== notificationId);

            return {
              ...state,
              notifications: newNotifications,
              notificationMap: newNotificationMap,
              ...updateDerivedData(newNotifications)
            };
          });
        },

        // 清空所有通知
        clearAllNotifications: () => {
          set({
            notifications: [],
            notificationMap: new Map(),
            unreadNotifications: [],
            importantNotifications: [],
            unreadCount: 0,
            importantCount: 0
          });
        },

        // 更新设置
        updateSettings: (newSettings) => {
          set((state) => ({
            ...state,
            settings: { ...state.settings, ...newSettings }
          }));
        },

        // 查询方法
        getNotificationsByType: (type) => {
          const state = get();
          return state.notifications.filter(n => n.type === type);
        },

        getRecentNotifications: (limit = 10) => {
          const state = get();
          return state.notifications.slice(0, limit);
        },

        searchNotifications: (query) => {
          const state = get();
          const searchTerm = query.toLowerCase();
          return state.notifications.filter(n =>
            n.title.toLowerCase().includes(searchTerm) ||
            n.message.toLowerCase().includes(searchTerm)
          );
        }
      }), {
        name: 'notification-store',
        partialize: (state) => ({
          notifications: state.notifications,
          settings: state.settings
        })
      }),
      { name: 'notification-store' }
    )
  )
);

/**
 * 更新派生数据
 */
function updateDerivedData(notifications: Notification[]) {
  const unreadNotifications = notifications.filter(n => !n.read && !n.dismissed);
  const importantNotifications = notifications.filter(n => n.important && !n.dismissed);
  
  return {
    unreadNotifications,
    importantNotifications,
    unreadCount: unreadNotifications.length,
    importantCount: importantNotifications.length
  };
}

/**
 * 判断是否为重要通知
 */
function isImportantNotification(type: string): boolean {
  const importantTypes = [
    'TASK_ASSIGNED',
    'USER_MENTIONED',
    'URGENT_TASK_UPDATE',
    'DEADLINE_REMINDER',
    'SYSTEM_NOTIFICATION'
  ];
  return importantTypes.includes(type);
}

/**
 * 显示通知
 */
function showNotification(notification: Notification, settings: NotificationState['settings']) {
  // Toast通知
  if (settings.enableToast) {
    if (notification.important) {
      toast.success(notification.message, {
        duration: 5000,
        position: 'top-right',
        icon: '🔔'
      });
    } else {
      toast(notification.message, {
        duration: 3000,
        position: 'top-right'
      });
    }
  }

  // 浏览器通知
  if (settings.enableBrowser && 'Notification' in window && Notification.permission === 'granted') {
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.important,
      silent: !settings.enableSound
    });

    browserNotification.onclick = () => {
      window.focus();
      useNotificationStore.getState().markAsRead(notification.id);
      browserNotification.close();
    };

    setTimeout(() => {
      browserNotification.close();
    }, notification.important ? 8000 : 4000);
  }

  // 声音通知
  if (settings.enableSound) {
    // 这里可以播放通知声音
    console.log('[NotificationStore] Playing notification sound');
  }
}

// 请求浏览器通知权限
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('[NotificationStore] Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// 初始化通知事件监听
let isNotificationListenerInitialized = false;

export const initializeNotificationEventListeners = () => {
  if (isNotificationListenerInitialized) {
    return;
  }

  isNotificationListenerInitialized = true;

  // 监听通知事件
  const unsubscribeNotification = webSocketManager.onNotification((notificationEvent) => {
    console.log('[NotificationStore] Received notification event:', notificationEvent);
    useNotificationStore.getState().addNotification(notificationEvent);
  });

  // 清理函数
  return () => {
    unsubscribeNotification();
    isNotificationListenerInitialized = false;
  };
};