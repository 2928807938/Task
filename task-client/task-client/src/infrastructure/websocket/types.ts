/**
 * WebSocket相关类型定义
 */

// 连接状态
export enum WebSocketConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting', 
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// WebSocket错误类型
export enum WebSocketErrorType {
  AUTHENTICATION_FAILED = 'authentication_failed',
  CONNECTION_TIMEOUT = 'connection_timeout',
  NETWORK_ERROR = 'network_error',
  SERVER_ERROR = 'server_error',
  PROTOCOL_ERROR = 'protocol_error',
  PERMISSION_DENIED = 'permission_denied',
  TOKEN_EXPIRED = 'token_expired',
  UNKNOWN_ERROR = 'unknown_error'
}

// WebSocket错误详情
export interface WebSocketError {
  type: WebSocketErrorType;
  message: string;
  originalError?: any;
  timestamp: number;
  context?: {
    userId?: number;
    projectId?: number;
    action?: string;
  };
}

// 协作活动事件类型
export interface ActivityEvent {
  id?: string;
  userId: number;
  username: string;
  userAvatar?: string;
  projectId: number;
  taskId?: number;
  activityType: string;
  title: string;
  description?: string;
  metadata: Record<string, any>;
  timestamp: number;
}

// 用户在线状态事件
export interface PresenceEvent {
  userId: number;
  username?: string;
  userAvatar?: string;
  projectId: number;
  taskId?: number;
  status: string;
  lastActivity?: number;
  currentPage?: string;
  metadata: Record<string, any>;
  timestamp: number;
}

// 通知事件
export interface NotificationEvent {
  type: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  timestamp: number;
}

// WebSocket消息类型
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

// 订阅配置
export interface SubscriptionConfig {
  destination: string;
  callback: (message: any) => void;
  headers?: Record<string, string>;
}

// WebSocket客户端配置
export interface WebSocketConfig {
  url: string;
  reconnectDelay: number;
  maxReconnectAttempts: number;
  heartbeatIncoming: number;
  heartbeatOutgoing: number;
  debug: boolean;
}

// 活动类型常量
export const ActivityType = {
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED', 
  TASK_COMMENTED: 'TASK_COMMENTED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  TASK_PRIORITY_CHANGED: 'TASK_PRIORITY_CHANGED',
  USER_MENTIONED: 'USER_MENTIONED',
  PROJECT_JOINED: 'PROJECT_JOINED',
  PROJECT_LEFT: 'PROJECT_LEFT',
  // 评论相关活动
  COMMENT_CREATED: 'COMMENT_CREATED',
  COMMENT_UPDATED: 'COMMENT_UPDATED',
  COMMENT_DELETED: 'COMMENT_DELETED',
  COMMENT_REPLY_CREATED: 'COMMENT_REPLY_CREATED'
} as const;

// 用户状态类型常量
export const PresenceStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  IDLE: 'idle',
  TYPING: 'typing',
  VIEWING_TASK: 'viewing_task',
  EDITING_TASK: 'editing_task',
  COMMENTING: 'commenting'
} as const;

// 评论事件类型
export interface CommentEvent {
  type: 'COMMENT_CREATED' | 'COMMENT_UPDATED' | 'COMMENT_DELETED' | 'COMMENT_REPLY_CREATED';
  commentId: string;
  taskId: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  parentId?: string;
  content?: string;
  mentionedUserIds?: string[];
  timestamp: number;
}

// 评论活动事件类型
export interface CommentActivityEvent extends ActivityEvent {
  commentId: string;
  commentContent?: string;
  parentCommentId?: string;
  mentionedUserIds?: string[];
}