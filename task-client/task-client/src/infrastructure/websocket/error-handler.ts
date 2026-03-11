import { WebSocketError, WebSocketErrorType } from './types';

/**
 * WebSocket错误分类和处理工具
 */
export class WebSocketErrorHandler {
  /**
   * 分类和创建标准化的WebSocket错误
   */
  static createError(
    error: any,
    context?: { userId?: number; projectId?: number; action?: string }
  ): WebSocketError {
    const timestamp = Date.now();
    
    // 根据错误信息判断错误类型
    if (this.isAuthenticationError(error)) {
      return {
        type: WebSocketErrorType.AUTHENTICATION_FAILED,
        message: '认证失败，请重新登录',
        originalError: error,
        timestamp,
        context
      };
    }
    
    if (this.isConnectionTimeoutError(error)) {
      return {
        type: WebSocketErrorType.CONNECTION_TIMEOUT,
        message: '连接超时，请检查网络状态',
        originalError: error,
        timestamp,
        context
      };
    }
    
    if (this.isNetworkError(error)) {
      return {
        type: WebSocketErrorType.NETWORK_ERROR,
        message: '网络连接异常，请检查网络设置',
        originalError: error,
        timestamp,
        context
      };
    }
    
    if (this.isServerError(error)) {
      return {
        type: WebSocketErrorType.SERVER_ERROR,
        message: '服务器连接异常，请稍后重试',
        originalError: error,
        timestamp,
        context
      };
    }
    
    if (this.isProtocolError(error)) {
      return {
        type: WebSocketErrorType.PROTOCOL_ERROR,
        message: 'WebSocket协议异常',
        originalError: error,
        timestamp,
        context
      };
    }
    
    if (this.isPermissionError(error)) {
      return {
        type: WebSocketErrorType.PERMISSION_DENIED,
        message: '权限不足，无法执行此操作',
        originalError: error,
        timestamp,
        context
      };
    }
    
    if (this.isTokenExpiredError(error)) {
      return {
        type: WebSocketErrorType.TOKEN_EXPIRED,
        message: '登录令牌已过期，请重新登录',
        originalError: error,
        timestamp,
        context
      };
    }
    
    // 默认未知错误
    return {
      type: WebSocketErrorType.UNKNOWN_ERROR,
      message: '未知错误，请稍后重试',
      originalError: error,
      timestamp,
      context
    };
  }
  
  /**
   * 判断是否为认证错误
   */
  private static isAuthenticationError(error: any): boolean {
    if (typeof error === 'string') {
      return error.toLowerCase().includes('authentication') ||
             error.toLowerCase().includes('unauthorized') ||
             error.toLowerCase().includes('401');
    }
    
    if (error?.message) {
      const message = error.message.toLowerCase();
      return message.includes('authentication') ||
             message.includes('unauthorized') ||
             message.includes('jwt') ||
             message.includes('token');
    }
    
    if (error?.status === 401) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 判断是否为连接超时错误
   */
  private static isConnectionTimeoutError(error: any): boolean {
    if (typeof error === 'string') {
      return error.toLowerCase().includes('timeout') ||
             error.toLowerCase().includes('timed out');
    }
    
    if (error?.message) {
      const message = error.message.toLowerCase();
      return message.includes('timeout') ||
             message.includes('timed out');
    }
    
    if (error?.type === 'timeout') {
      return true;
    }
    
    return false;
  }
  
  /**
   * 判断是否为网络错误
   */
  private static isNetworkError(error: any): boolean {
    if (typeof error === 'string') {
      return error.toLowerCase().includes('network') ||
             error.toLowerCase().includes('connection refused') ||
             error.toLowerCase().includes('net::');
    }
    
    if (error?.message) {
      const message = error.message.toLowerCase();
      return message.includes('network') ||
             message.includes('connection refused') ||
             message.includes('net::') ||
             message.includes('failed to fetch');
    }
    
    return false;
  }
  
  /**
   * 判断是否为服务器错误
   */
  private static isServerError(error: any): boolean {
    if (error?.status && error.status >= 500) {
      return true;
    }
    
    if (typeof error === 'string') {
      return error.toLowerCase().includes('server error') ||
             error.toLowerCase().includes('internal server') ||
             error.toLowerCase().includes('503') ||
             error.toLowerCase().includes('502') ||
             error.toLowerCase().includes('500');
    }
    
    if (error?.message) {
      const message = error.message.toLowerCase();
      return message.includes('server') && 
             (message.includes('error') || message.includes('unavailable'));
    }
    
    return false;
  }
  
  /**
   * 判断是否为协议错误
   */
  private static isProtocolError(error: any): boolean {
    if (typeof error === 'string') {
      return error.toLowerCase().includes('stomp') ||
             error.toLowerCase().includes('websocket') ||
             error.toLowerCase().includes('protocol');
    }
    
    if (error?.message) {
      const message = error.message.toLowerCase();
      return message.includes('stomp') ||
             message.includes('websocket') ||
             message.includes('protocol');
    }
    
    return false;
  }
  
  /**
   * 判断是否为权限错误
   */
  private static isPermissionError(error: any): boolean {
    if (error?.status === 403) {
      return true;
    }
    
    if (typeof error === 'string') {
      return error.toLowerCase().includes('forbidden') ||
             error.toLowerCase().includes('permission') ||
             error.toLowerCase().includes('access denied');
    }
    
    if (error?.message) {
      const message = error.message.toLowerCase();
      return message.includes('forbidden') ||
             message.includes('permission') ||
             message.includes('access denied');
    }
    
    return false;
  }
  
  /**
   * 判断是否为Token过期错误
   */
  private static isTokenExpiredError(error: any): boolean {
    if (typeof error === 'string') {
      return error.toLowerCase().includes('token expired') ||
             error.toLowerCase().includes('jwt expired') ||
             error.toLowerCase().includes('expired');
    }
    
    if (error?.message) {
      const message = error.message.toLowerCase();
      return message.includes('token') && message.includes('expired');
    }
    
    return false;
  }
  
  /**
   * 获取用户友好的错误信息
   */
  static getUserFriendlyMessage(error: WebSocketError): string {
    switch (error.type) {
      case WebSocketErrorType.AUTHENTICATION_FAILED:
        return '登录验证失败，请重新登录';
      case WebSocketErrorType.TOKEN_EXPIRED:
        return '登录已过期，请重新登录';
      case WebSocketErrorType.CONNECTION_TIMEOUT:
        return '连接超时，请检查网络状态后重试';
      case WebSocketErrorType.NETWORK_ERROR:
        return '网络连接异常，请检查网络设置';
      case WebSocketErrorType.SERVER_ERROR:
        return '服务器暂时不可用，请稍后重试';
      case WebSocketErrorType.PERMISSION_DENIED:
        return '权限不足，无法执行此操作';
      case WebSocketErrorType.PROTOCOL_ERROR:
        return 'WebSocket连接异常，请刷新页面重试';
      default:
        return '连接异常，请稍后重试';
    }
  }
  
  /**
   * 判断错误是否可以自动重试
   */
  static isRetriableError(error: WebSocketError): boolean {
    switch (error.type) {
      case WebSocketErrorType.CONNECTION_TIMEOUT:
      case WebSocketErrorType.NETWORK_ERROR:
      case WebSocketErrorType.SERVER_ERROR:
        return true;
      case WebSocketErrorType.AUTHENTICATION_FAILED:
      case WebSocketErrorType.TOKEN_EXPIRED:
      case WebSocketErrorType.PERMISSION_DENIED:
      case WebSocketErrorType.PROTOCOL_ERROR:
        return false;
      default:
        return true; // 未知错误默认可重试
    }
  }
  
  /**
   * 获取建议的重试延迟时间（毫秒）
   */
  static getRetryDelay(error: WebSocketError, attempt: number): number {
    const baseDelay = 1000; // 1秒基础延迟
    const maxDelay = 30000; // 最大30秒
    
    switch (error.type) {
      case WebSocketErrorType.SERVER_ERROR:
        // 服务器错误时使用更长的延迟
        return Math.min(baseDelay * Math.pow(2, attempt) * 2, maxDelay);
      case WebSocketErrorType.NETWORK_ERROR:
      case WebSocketErrorType.CONNECTION_TIMEOUT:
        // 网络错误时使用指数退避
        return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      default:
        return Math.min(baseDelay * attempt, maxDelay);
    }
  }
}