/**
 * WebSocket事件监听器初始化
 * 统一管理各种事件监听器的初始化和清理
 */

import { 
  initializeWebSocketEventListeners as initWebSocketEvents
} from '@/store/websocket/useWebSocketStore';

import { 
  initializeActivityEventListeners as initActivityEvents
} from '@/store/websocket/useActivityStore';

import { 
  initializePresenceEventListeners as initPresenceEvents
} from '@/store/websocket/usePresenceStore';

import { 
  initializeNotificationEventListeners as initNotificationEvents
} from '@/store/websocket/useNotificationStore';

// 重新导出事件监听器初始化函数
export const initializeWebSocketEventListeners = initWebSocketEvents;
export const initializeActivityEventListeners = initActivityEvents;
export const initializePresenceEventListeners = initPresenceEvents;
export const initializeNotificationEventListeners = initNotificationEvents;