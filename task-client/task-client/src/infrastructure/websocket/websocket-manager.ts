import { WebSocketClient } from './websocket-client';
import { 
  WebSocketConnectionStatus, 
  ActivityEvent, 
  PresenceEvent, 
  NotificationEvent,
  WebSocketConfig,
  PresenceStatus,
  WebSocketError
} from './types';
import { WebSocketErrorHandler } from './error-handler';

/**
 * WebSocket管理器
 * 提供高级的WebSocket功能，包括自动重连、会话管理等
 */
function getDefaultWebSocketUrl() {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }

  return 'ws://localhost:8080/ws';
}

export class WebSocketManager {
  private client: WebSocketClient;
  private currentProjectId: number | null = null;
  private currentUserId: number | null = null;
  private subscriptionIds: Set<string> = new Set();
  private isInitialized = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

  // 事件回调
  private eventCallbacks: {
    onActivity: ((event: ActivityEvent) => void)[];
    onPresence: ((event: PresenceEvent) => void)[];
    onNotification: ((event: NotificationEvent) => void)[];
    onConnectionChange: ((status: WebSocketConnectionStatus) => void)[];
  } = {
    onActivity: [],
    onPresence: [],
    onNotification: [],
    onConnectionChange: []
  };

  constructor() {
    // 增强的配置，从环境变量读取
    const defaultConfig: WebSocketConfig = {
      url: process.env.NEXT_PUBLIC_WS_URL || getDefaultWebSocketUrl(),
      reconnectDelay: parseInt(process.env.NEXT_PUBLIC_WS_RECONNECT_DELAY || '5000'),
      maxReconnectAttempts: parseInt(process.env.NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS || '10'),
      heartbeatIncoming: parseInt(process.env.NEXT_PUBLIC_WS_HEARTBEAT_INTERVAL || '30000'),
      heartbeatOutgoing: parseInt(process.env.NEXT_PUBLIC_WS_HEARTBEAT_INTERVAL || '30000'),
      debug: process.env.NODE_ENV === 'development'
    };

    console.log('[WebSocketManager] Initializing with config:', {
      ...defaultConfig,
      url: defaultConfig.url // 显示实际使用的URL
    });

    this.maxReconnectAttempts = defaultConfig.maxReconnectAttempts;
    this.client = new WebSocketClient(defaultConfig);
    this.setupEventListeners();
  }

  /**
   * 初始化WebSocket连接
   */
  initialize(token: string, userId: number): void {
    if (this.isInitialized && this.client.isConnected()) {
      console.log('[WebSocketManager] Already initialized and connected');
      return;
    }

    if (this.isInitialized && !this.client.isConnected()) {
      console.log('[WebSocketManager] Previously initialized but disconnected, reconnecting...');
      this.client.connect(token);
      return;
    }

    console.log('[WebSocketManager] Initializing WebSocket connection for user:', userId);
    this.currentUserId = userId;
    this.isInitialized = true;

    // 连接WebSocket
    this.client.connect(token);
  }

  /**
   * 销毁WebSocket连接
   */
  destroy(): void {
    console.log('[WebSocketManager] Destroying WebSocket connection...');
    
    // 停止健康检查
    this.stopHealthCheck();
    
    this.isInitialized = false;
    this.currentProjectId = null;
    this.currentUserId = null;
    this.reconnectAttempts = 0;
    
    // 清理所有订阅
    this.subscriptionIds.forEach(id => this.client.unsubscribe(id));
    this.subscriptionIds.clear();
    
    // 断开连接
    this.client.disconnect();
  }

  /**
   * 加入项目频道
   */
  joinProject(projectId: number): void {
    if (!this.client.isConnected()) {
      console.warn('[WebSocketManager] Cannot join project - not connected');
      return;
    }

    if (this.currentProjectId === projectId) {
      console.log(`[WebSocketManager] Already in project ${projectId}`);
      return;
    }

    // 离开当前项目
    if (this.currentProjectId) {
      this.leaveProject();
    }

    console.log(`[WebSocketManager] Joining project ${projectId}`);
    this.currentProjectId = projectId;

    try {
      // 订阅项目活动频道
      const activitySubId = this.client.subscribe({
        destination: `/topic/project/${projectId}/activity`,
        callback: (message: ActivityEvent) => {
          console.log(`[WebSocketManager] Received activity event:`, message);
          this.notifyActivityListeners(message);
        }
      });
      this.subscriptionIds.add(activitySubId);

      // 订阅项目用户状态频道
      const presenceSubId = this.client.subscribe({
        destination: `/topic/project/${projectId}/presence`,
        callback: (message: PresenceEvent) => {
          console.log(`[WebSocketManager] Received presence event:`, message);
          this.notifyPresenceListeners(message);
        }
      });
      this.subscriptionIds.add(presenceSubId);

      // 订阅个人通知频道
      if (this.currentUserId) {
        const notificationSubId = this.client.subscribe({
          destination: `/user/queue/notifications`,
          callback: (message: NotificationEvent) => {
            console.log(`[WebSocketManager] Received notification:`, message);
            this.notifyNotificationListeners(message);
          }
        });
        this.subscriptionIds.add(notificationSubId);
      }

      // 发送加入项目消息
      this.client.send('/app/project.join', { projectId: projectId.toString() });

    } catch (error) {
      console.error(`[WebSocketManager] Failed to join project ${projectId}:`, error);
    }
  }

  /**
   * 离开项目频道
   */
  leaveProject(): void {
    if (!this.currentProjectId) {
      return;
    }

    console.log(`[WebSocketManager] Leaving project ${this.currentProjectId}`);

    try {
      // 发送离开项目消息
      if (this.client.isConnected()) {
        this.client.send('/app/project.leave', { projectId: this.currentProjectId.toString() });
      }
    } catch (error) {
      console.error(`[WebSocketManager] Failed to send leave message:`, error);
    }

    // 清理订阅
    this.subscriptionIds.forEach(id => this.client.unsubscribe(id));
    this.subscriptionIds.clear();

    this.currentProjectId = null;
  }

  /**
   * 更新用户状态
   */
  updateUserStatus(status: string, taskId?: number): void {
    if (!this.client.isConnected() || !this.currentProjectId) {
      return;
    }

    try {
      this.client.send('/app/user.status', {
        projectId: this.currentProjectId.toString(),
        status,
        taskId: taskId?.toString()
      });
    } catch (error) {
      console.error('[WebSocketManager] Failed to update user status:', error);
    }
  }

  /**
   * 订阅特定任务的频道
   */
  subscribeToTask(taskId: number): string | null {
    if (!this.client.isConnected()) {
      console.warn('[WebSocketManager] Cannot subscribe to task - not connected');
      return null;
    }

    try {
      // 订阅任务活动频道
      const activitySubId = this.client.subscribe({
        destination: `/topic/task/${taskId}/activity`,
        callback: (message: ActivityEvent) => {
          console.log(`[WebSocketManager] Received task activity event:`, message);
          this.notifyActivityListeners(message);
        }
      });
      this.subscriptionIds.add(activitySubId);

      // 订阅任务用户状态频道
      const presenceSubId = this.client.subscribe({
        destination: `/topic/task/${taskId}/presence`,
        callback: (message: PresenceEvent) => {
          console.log(`[WebSocketManager] Received task presence event:`, message);
          this.notifyPresenceListeners(message);
        }
      });
      this.subscriptionIds.add(presenceSubId);

      return `task_${taskId}`;
    } catch (error) {
      console.error(`[WebSocketManager] Failed to subscribe to task ${taskId}:`, error);
      return null;
    }
  }

  /**
   * 取消订阅任务频道
   */
  unsubscribeFromTask(taskId: number): void {
    // 这里简化处理，实际可能需要更精确的订阅管理
    console.log(`[WebSocketManager] Unsubscribing from task ${taskId}`);
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): WebSocketConnectionStatus {
    return this.client.getConnectionStatus();
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.client.isConnected();
  }

  /**
   * 添加活动事件监听器
   */
  onActivity(callback: (event: ActivityEvent) => void): () => void {
    this.eventCallbacks.onActivity.push(callback);
    return () => {
      const index = this.eventCallbacks.onActivity.indexOf(callback);
      if (index > -1) {
        this.eventCallbacks.onActivity.splice(index, 1);
      }
    };
  }

  /**
   * 添加用户状态事件监听器
   */
  onPresence(callback: (event: PresenceEvent) => void): () => void {
    this.eventCallbacks.onPresence.push(callback);
    return () => {
      const index = this.eventCallbacks.onPresence.indexOf(callback);
      if (index > -1) {
        this.eventCallbacks.onPresence.splice(index, 1);
      }
    };
  }

  /**
   * 添加通知事件监听器
   */
  onNotification(callback: (event: NotificationEvent) => void): () => void {
    this.eventCallbacks.onNotification.push(callback);
    return () => {
      const index = this.eventCallbacks.onNotification.indexOf(callback);
      if (index > -1) {
        this.eventCallbacks.onNotification.splice(index, 1);
      }
    };
  }

  /**
   * 添加连接状态变化监听器
   */
  onConnectionChange(callback: (status: WebSocketConnectionStatus) => void): () => void {
    this.eventCallbacks.onConnectionChange.push(callback);
    return () => {
      const index = this.eventCallbacks.onConnectionChange.indexOf(callback);
      if (index > -1) {
        this.eventCallbacks.onConnectionChange.splice(index, 1);
      }
    };
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    // 清除现有的健康检查
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // 每30秒检查一次连接健康状态
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);
  }

  /**
   * 停止健康检查
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * 执行健康检查
   */
  private performHealthCheck(): void {
    if (!this.client.isConnected()) {
      return;
    }

    try {
      // 发送心跳消息
      this.client.send('/app/heartbeat', {
        timestamp: Date.now(),
        userId: this.currentUserId
      });
      
      this.lastHeartbeat = Date.now();
      
      // 检查是否长时间没有收到响应（超过2分钟）
      const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
      if (timeSinceLastHeartbeat > 120000) {
        console.warn('[WebSocketManager] No heartbeat response for 2 minutes, attempting reconnection');
        this.handleConnectionIssue();
      }
    } catch (error) {
      console.error('[WebSocketManager] Health check failed:', error);
      this.handleConnectionIssue();
    }
  }

  /**
   * 处理连接问题
   */
  private handleConnectionIssue(error?: WebSocketError): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocketManager] Max reconnection attempts reached');
      return;
    }

    console.log(`[WebSocketManager] Handling connection issue, attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
    this.reconnectAttempts++;
    
    // 如果有错误信息，判断是否可以重试
    if (error && !WebSocketErrorHandler.isRetriableError(error)) {
      console.warn('[WebSocketManager] Error is not retriable, stopping reconnection attempts');
      return;
    }
    
    // 计算重试延迟
    const retryDelay = error 
      ? WebSocketErrorHandler.getRetryDelay(error, this.reconnectAttempts)
      : Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`[WebSocketManager] Retrying in ${retryDelay}ms...`);
    
    // 重新连接
    setTimeout(() => {
      this.client.disconnect();
      if (this.currentUserId) {
        const token = localStorage.getItem('token');
        if (token) {
          this.client.connect(token);
        }
      }
    }, retryDelay);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听连接状态变化
    this.client.onConnectionChange((status) => {
      console.log(`[WebSocketManager] Connection status changed to ${status}`);
      this.notifyConnectionChangeListeners(status);

      if (status === WebSocketConnectionStatus.CONNECTED) {
        // 连接成功，重置重连次数
        this.reconnectAttempts = 0;
        this.startHealthCheck();
        
        // 重新加入项目
        if (this.currentProjectId) {
          setTimeout(() => {
            this.joinProject(this.currentProjectId!);
          }, 1000);
        }
      } else if (status === WebSocketConnectionStatus.DISCONNECTED || 
                 status === WebSocketConnectionStatus.ERROR) {
        // 停止健康检查
        this.stopHealthCheck();
      }
    });

    // 监听错误
    this.client.onError((error: WebSocketError) => {
      console.error('[WebSocketManager] WebSocket error:', error);
      this.handleConnectionIssue(error);
    });
  }

  /**
   * 通知活动监听器
   */
  private notifyActivityListeners(event: ActivityEvent): void {
    this.eventCallbacks.onActivity.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[WebSocketManager] Error in activity listener:', error);
      }
    });
  }

  /**
   * 通知用户状态监听器
   */
  private notifyPresenceListeners(event: PresenceEvent): void {
    this.eventCallbacks.onPresence.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[WebSocketManager] Error in presence listener:', error);
      }
    });
  }

  /**
   * 通知通知监听器
   */
  private notifyNotificationListeners(event: NotificationEvent): void {
    this.eventCallbacks.onNotification.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[WebSocketManager] Error in notification listener:', error);
      }
    });
  }

  /**
   * 通知连接状态变化监听器
   */
  private notifyConnectionChangeListeners(status: WebSocketConnectionStatus): void {
    this.eventCallbacks.onConnectionChange.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('[WebSocketManager] Error in connection change listener:', error);
      }
    });
  }
}

// 单例实例
export const webSocketManager = new WebSocketManager();