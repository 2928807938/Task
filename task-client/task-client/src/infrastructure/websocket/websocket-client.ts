import { Client, StompConfig, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { 
  WebSocketConnectionStatus, 
  WebSocketConfig, 
  SubscriptionConfig,
  WebSocketMessage,
  WebSocketError
} from './types';
import { WebSocketErrorHandler } from './error-handler';

/**
 * WebSocket客户端封装类
 * 提供STOMP协议的WebSocket连接和消息处理功能
 */
export class WebSocketClient {
  private client: Client;
  private subscriptions: Map<string, any> = new Map();
  private connectionStatus: WebSocketConnectionStatus = WebSocketConnectionStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private listeners: {
    onConnectionChange: ((status: WebSocketConnectionStatus) => void)[];
    onError: ((error: WebSocketError) => void)[];
  } = {
    onConnectionChange: [],
    onError: []
  };

  private config: WebSocketConfig;

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.client = this.createClient();
  }

  /**
   * 创建STOMP客户端
   */
  private createClient(): Client {
    const stompConfig: StompConfig = {
      // 使用SockJS作为WebSocket实现
      webSocketFactory: () => new SockJS(this.config.url),
      
      // 连接头信息
      connectHeaders: {},
      
      // 心跳配置
      heartbeatIncoming: this.config.heartbeatIncoming,
      heartbeatOutgoing: this.config.heartbeatOutgoing,
      
      // 重连配置
      reconnectDelay: this.config.reconnectDelay,
      
      // 调试模式
      debug: this.config.debug ? (str: string) => console.log('[STOMP Debug]', str) : undefined,
      
      // 连接成功回调
      onConnect: (frame) => {
        console.log('[WebSocket] Connected successfully', frame);
        this.connectionStatus = WebSocketConnectionStatus.CONNECTED;
        this.reconnectAttempts = 0;
        this.notifyConnectionChange();
      },
      
      // 连接断开回调
      onDisconnect: (receipt) => {
        console.log('[WebSocket] Disconnected', receipt);
        this.connectionStatus = WebSocketConnectionStatus.DISCONNECTED;
        this.notifyConnectionChange();
      },
      
      // STOMP错误回调
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP Error:', frame);
        this.connectionStatus = WebSocketConnectionStatus.ERROR;
        const error = WebSocketErrorHandler.createError(
          new Error(`STOMP Error: ${frame.headers.message || 'Unknown STOMP error'}`),
          { action: 'stomp_connection' }
        );
        this.notifyError(error);
        this.notifyConnectionChange();
      },
      
      // Web Socket错误回调
      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket Error:', event);
        this.connectionStatus = WebSocketConnectionStatus.ERROR;
        const error = WebSocketErrorHandler.createError(event, { action: 'websocket_connection' });
        this.notifyError(error);
        this.notifyConnectionChange();
      },
      
      // 连接关闭前回调
      onWebSocketClose: (event) => {
        console.log('[WebSocket] WebSocket Closed:', event);
        if (this.connectionStatus !== WebSocketConnectionStatus.DISCONNECTED) {
          this.connectionStatus = WebSocketConnectionStatus.RECONNECTING;
          this.reconnectAttempts++;
          this.notifyConnectionChange();
        }
      }
    };

    return new Client(stompConfig);
  }

  /**
   * 连接WebSocket
   */
  connect(token?: string): void {
    if (this.connectionStatus === WebSocketConnectionStatus.CONNECTED || 
        this.connectionStatus === WebSocketConnectionStatus.CONNECTING) {
      console.log('[WebSocket] Already connected or connecting');
      return;
    }

    console.log('[WebSocket] Attempting to connect...');
    this.connectionStatus = WebSocketConnectionStatus.CONNECTING;
    this.notifyConnectionChange();

    // 设置认证头
    if (token) {
      this.client.configure({
        connectHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    try {
      this.client.activate();
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error);
      this.connectionStatus = WebSocketConnectionStatus.ERROR;
      const wsError = WebSocketErrorHandler.createError(error, { action: 'connect' });
      this.notifyError(wsError);
      this.notifyConnectionChange();
    }
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    console.log('[WebSocket] Disconnecting...');
    this.connectionStatus = WebSocketConnectionStatus.DISCONNECTED;
    
    // 清理所有订阅
    this.subscriptions.clear();
    
    // 断开连接
    if (this.client.connected) {
      this.client.deactivate();
    }
    
    this.notifyConnectionChange();
  }

  /**
   * 订阅消息频道
   */
  subscribe(config: SubscriptionConfig): string {
    if (this.connectionStatus !== WebSocketConnectionStatus.CONNECTED) {
      throw new Error('WebSocket is not connected');
    }

    const subscriptionId = `sub_${Date.now()}_${Math.random()}`;
    
    console.log(`[WebSocket] Subscribing to ${config.destination}`);
    
    try {
      const subscription = this.client.subscribe(
        config.destination,
        (message: IMessage) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log(`[WebSocket] Received message from ${config.destination}:`, parsedMessage);
            config.callback(parsedMessage);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error, message.body);
          }
        },
        config.headers
      );
      
      this.subscriptions.set(subscriptionId, subscription);
      return subscriptionId;
    } catch (error) {
      console.error(`[WebSocket] Failed to subscribe to ${config.destination}:`, error);
      throw error;
    }
  }

  /**
   * 取消订阅
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      console.log(`[WebSocket] Unsubscribing ${subscriptionId}`);
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * 发送消息
   */
  send(destination: string, body: any, headers?: Record<string, string>): void {
    if (this.connectionStatus !== WebSocketConnectionStatus.CONNECTED) {
      throw new Error('WebSocket is not connected');
    }

    try {
      console.log(`[WebSocket] Sending message to ${destination}:`, body);
      this.client.publish({
        destination,
        body: JSON.stringify(body),
        headers
      });
    } catch (error) {
      console.error(`[WebSocket] Failed to send message to ${destination}:`, error);
      throw error;
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): WebSocketConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.connectionStatus === WebSocketConnectionStatus.CONNECTED;
  }

  /**
   * 添加连接状态变化监听器
   */
  onConnectionChange(listener: (status: WebSocketConnectionStatus) => void): () => void {
    this.listeners.onConnectionChange.push(listener);
    
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.onConnectionChange.indexOf(listener);
      if (index > -1) {
        this.listeners.onConnectionChange.splice(index, 1);
      }
    };
  }

  /**
   * 添加错误监听器
   */
  onError(listener: (error: WebSocketError) => void): () => void {
    this.listeners.onError.push(listener);
    
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.onError.indexOf(listener);
      if (index > -1) {
        this.listeners.onError.splice(index, 1);
      }
    };
  }

  /**
   * 通知连接状态变化
   */
  private notifyConnectionChange(): void {
    this.listeners.onConnectionChange.forEach(listener => {
      try {
        listener(this.connectionStatus);
      } catch (error) {
        console.error('[WebSocket] Error in connection change listener:', error);
      }
    });
  }

  /**
   * 通知错误
   */
  private notifyError(error: WebSocketError): void {
    console.warn(`[WebSocket] ${error.type}: ${error.message}`, error);
    this.listeners.onError.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('[WebSocket] Error in error listener:', listenerError);
      }
    });
  }
}