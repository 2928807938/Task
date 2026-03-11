import { useEffect, useState, useCallback } from 'react';
import { webSocketManager } from '@/infrastructure/websocket/websocket-manager';
import { WebSocketConnectionStatus } from '@/infrastructure/websocket/types';

/**
 * WebSocket连接管理Hook
 * 管理WebSocket连接的生命周期
 */
export function useWebSocketConnection(userId?: number) {
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>(
    WebSocketConnectionStatus.DISCONNECTED
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 初始化WebSocket连接
   */
  const initialize = useCallback(() => {
    if (isInitialized || !userId) {
      return;
    }

    try {
      // 获取JWT token
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('未找到认证令牌');
        return;
      }

      console.log('[useWebSocketConnection] Initializing WebSocket connection...');
      webSocketManager.initialize(token, userId);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('[useWebSocketConnection] Failed to initialize WebSocket:', err);
      setError(err instanceof Error ? err.message : '初始化失败');
    }
  }, [userId, isInitialized]);

  /**
   * 销毁WebSocket连接
   */
  const destroy = useCallback(() => {
    if (!isInitialized) {
      return;
    }

    console.log('[useWebSocketConnection] Destroying WebSocket connection...');
    webSocketManager.destroy();
    setIsInitialized(false);
    setConnectionStatus(WebSocketConnectionStatus.DISCONNECTED);
    setError(null);
  }, [isInitialized]);

  /**
   * 重新连接
   */
  const reconnect = useCallback(() => {
    destroy();
    setTimeout(() => {
      initialize();
    }, 1000);
  }, [destroy, initialize]);

  // 监听连接状态变化
  useEffect(() => {
    const unsubscribe = webSocketManager.onConnectionChange((status) => {
      setConnectionStatus(status);
      
      // 如果连接出错，清除错误状态等待重连
      if (status === WebSocketConnectionStatus.CONNECTED) {
        setError(null);
      } else if (status === WebSocketConnectionStatus.ERROR) {
        setError('WebSocket连接出错');
      }
    });

    return unsubscribe;
  }, []);

  // 自动初始化
  useEffect(() => {
    if (userId && !isInitialized) {
      initialize();
    }
  }, [userId, initialize, isInitialized]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (isInitialized) {
        destroy();
      }
    };
  }, [isInitialized, destroy]);

  return {
    connectionStatus,
    isConnected: connectionStatus === WebSocketConnectionStatus.CONNECTED,
    isConnecting: connectionStatus === WebSocketConnectionStatus.CONNECTING,
    isReconnecting: connectionStatus === WebSocketConnectionStatus.RECONNECTING,
    error,
    initialize,
    destroy,
    reconnect
  };
}