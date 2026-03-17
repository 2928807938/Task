import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { WebSocketConnectionStatus } from '@/infrastructure/websocket/types';
import { webSocketManager } from '@/infrastructure/websocket/websocket-manager';

interface WebSocketState {
  // 连接状态
  connectionStatus: WebSocketConnectionStatus;
  isConnected: boolean;
  isInitializing: boolean;
  error: string | null;
  lastConnectedTime: number | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  
  // 当前用户和项目信息
  currentUserId: number | null;
  currentProjectId: number | null;
  
  // 性能指标
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  latency: number;
  messagesSent: number;
  messagesReceived: number;
  
  // 动作
  setConnectionStatus: (status: WebSocketConnectionStatus) => void;
  setError: (error: string | null) => void;
  setCurrentUser: (userId: number | null) => void;
  setCurrentProject: (projectId: number | null) => void;
  updateLastConnectedTime: () => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  updateConnectionQuality: (latency: number) => void;
  incrementMessageCount: (type: 'sent' | 'received') => void;
  
  // WebSocket管理动作
  initialize: (token: string, userId: number) => void;
  destroy: () => void;
  joinProject: (projectId: number) => void;
  leaveProject: () => void;
  updateUserStatus: (status: string, taskId?: number) => void;
  
  // 诊断和调试
  getConnectionInfo: () => {
    status: WebSocketConnectionStatus;
    uptime: number | null;
    reconnectAttempts: number;
    quality: string;
    latency: number;
    messageStats: { sent: number; received: number };
  };
}

/**
 * WebSocket连接状态管理Store
 */
export const useWebSocketStore = create<WebSocketState>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    connectionStatus: WebSocketConnectionStatus.DISCONNECTED,
    isConnected: false,
    isInitializing: false,
    error: null,
    lastConnectedTime: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
    currentUserId: null,
    currentProjectId: null,
    
    // 性能指标初始化
    connectionQuality: 'unknown',
    latency: 0,
    messagesSent: 0,
    messagesReceived: 0,

    // 状态更新动作
    setConnectionStatus: (status) => {
      set({ 
        connectionStatus: status,
        isConnected: status === WebSocketConnectionStatus.CONNECTED,
        isInitializing: status === WebSocketConnectionStatus.CONNECTING ? get().isInitializing : false
      });
      
      // 连接成功时更新最后连接时间和重置状态
      if (status === WebSocketConnectionStatus.CONNECTED) {
        get().updateLastConnectedTime();
        get().resetReconnectAttempts();
      }
    },

    setError: (error) => set({ error }),

    setCurrentUser: (userId) => set({ currentUserId: userId }),

    setCurrentProject: (projectId) => set({ currentProjectId: projectId }),

    updateLastConnectedTime: () => set({ lastConnectedTime: Date.now() }),

    incrementReconnectAttempts: () => set((state) => ({
      reconnectAttempts: state.reconnectAttempts + 1
    })),

    resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),

    updateConnectionQuality: (latency) => {
      let quality: 'excellent' | 'good' | 'poor' = 'excellent';
      if (latency > 1000) {
        quality = 'poor';
      } else if (latency > 500) {
        quality = 'good';
      }
      
      set({ 
        latency, 
        connectionQuality: quality 
      });
    },

    incrementMessageCount: (type) => set((state) => ({
      messagesSent: type === 'sent' ? state.messagesSent + 1 : state.messagesSent,
      messagesReceived: type === 'received' ? state.messagesReceived + 1 : state.messagesReceived
    })),

    // WebSocket管理动作
    initialize: (token, userId) => {
      const state = get();
      
      // 防止重复初始化
      if (state.isInitializing) {
        console.log('[WebSocketStore] Already initializing, skipping');
        return;
      }
      
      if (state.currentUserId === userId && state.isConnected) {
        console.log('[WebSocketStore] Already initialized and connected');
        return;
      }

      console.log('[WebSocketStore] Starting initialization for user:', userId);
      set({ 
        isInitializing: true,
        currentUserId: userId,
        error: null 
      });

      try {
        webSocketManager.initialize(token, userId);
        console.log('[WebSocketStore] WebSocket initialization requested');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '初始化失败';
        set({ 
          error: errorMessage,
          isInitializing: false
        });
        console.error('[WebSocketStore] Initialize failed:', error);
      }
    },

    destroy: () => {
      try {
        webSocketManager.destroy();
        set({
          connectionStatus: WebSocketConnectionStatus.DISCONNECTED,
          isConnected: false,
          isInitializing: false,
          error: null,
          currentUserId: null,
          currentProjectId: null,
          lastConnectedTime: null,
          reconnectAttempts: 0
        });
        console.log('[WebSocketStore] WebSocket destroyed and state reset');
      } catch (error) {
        console.error('[WebSocketStore] Destroy failed:', error);
      }
    },

    joinProject: (projectId) => {
      const state = get();
      if (state.currentProjectId === projectId) {
        console.log(`[WebSocketStore] Already in project ${projectId}`);
        return;
      }

      if (!state.isConnected) {
        console.warn('[WebSocketStore] Cannot join project - not connected');
        return;
      }

      try {
        webSocketManager.joinProject(projectId);
        set({ currentProjectId: projectId });
      } catch (error) {
        console.error('[WebSocketStore] Join project failed:', error);
        set({ error: error instanceof Error ? error.message : '加入项目失败' });
      }
    },

    leaveProject: () => {
      const state = get();
      if (!state.currentProjectId) {
        return;
      }

      try {
        webSocketManager.leaveProject();
        set({ currentProjectId: null });
      } catch (error) {
        console.error('[WebSocketStore] Leave project failed:', error);
      }
    },

    updateUserStatus: (status, taskId) => {
      const state = get();
      if (!state.isConnected) {
        console.warn('[WebSocketStore] Cannot update status - not connected');
        return;
      }

      try {
        webSocketManager.updateUserStatus(status, taskId);
      } catch (error) {
        console.error('[WebSocketStore] Update user status failed:', error);
      }
    },

    // 诊断和调试方法
    getConnectionInfo: () => {
      const state = get();
      return {
        status: state.connectionStatus,
        uptime: state.lastConnectedTime ? Date.now() - state.lastConnectedTime : null,
        reconnectAttempts: state.reconnectAttempts,
        quality: state.connectionQuality,
        latency: state.latency,
        messageStats: {
          sent: state.messagesSent,
          received: state.messagesReceived
        }
      };
    }
  }))
);

// 初始化WebSocket事件监听
let isEventListenerInitialized = false;

export const initializeWebSocketEventListeners = () => {
  if (isEventListenerInitialized) {
    return;
  }

  isEventListenerInitialized = true;

  // 监听连接状态变化
  const unsubscribeConnectionChange = webSocketManager.onConnectionChange((status) => {
    useWebSocketStore.getState().setConnectionStatus(status);
    
    // 连接成功后自动重新加入项目
    if (status === WebSocketConnectionStatus.CONNECTED) {
      const currentProjectId = useWebSocketStore.getState().currentProjectId;
      if (currentProjectId) {
        setTimeout(() => {
          webSocketManager.joinProject(currentProjectId);
        }, 1000);
      }
    }
  });

  // 清理函数（可选，在应用卸载时调用）
  return () => {
    unsubscribeConnectionChange();
    isEventListenerInitialized = false;
  };
};
