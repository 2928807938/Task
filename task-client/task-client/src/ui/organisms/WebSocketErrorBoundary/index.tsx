'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { FiWifi, FiWifiOff, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { WebSocketConnectionStatus } from '@/infrastructure/websocket/types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  connectionStatus?: WebSocketConnectionStatus;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  lastErrorTime: number;
}

/**
 * WebSocket错误边界组件
 * 为WebSocket相关功能提供错误恢复和用户友好的错误展示
 */
export class WebSocketErrorBoundary extends Component<Props, State> {
  private retryTimer: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private retryDelay = 5000; // 5秒

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[WebSocketErrorBoundary] Caught error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 如果是WebSocket相关错误，尝试自动恢复
    if (this.isWebSocketError(error) && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  private isWebSocketError(error: Error): boolean {
    const webSocketErrorPatterns = [
      'websocket',
      'stomp',
      'connection',
      'socket',
      'network'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return webSocketErrorPatterns.some(pattern => 
      errorMessage.includes(pattern)
    );
  }

  private scheduleRetry = () => {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    this.retryTimer = setTimeout(() => {
      this.handleRetry();
    }, this.retryDelay);
  };

  private handleRetry = () => {
    console.log('[WebSocketErrorBoundary] Attempting retry...');
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // 调用外部重试回调
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  private handleManualRetry = () => {
    this.handleRetry();
  };

  private getErrorSeverity(): 'low' | 'medium' | 'high' {
    const { error, retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) return 'high';
    if (this.isWebSocketError(error!)) return 'medium';
    return 'low';
  }

  private renderConnectionStatus() {
    const { connectionStatus } = this.props;
    
    if (!connectionStatus) return null;

    const statusConfig = {
      [WebSocketConnectionStatus.CONNECTED]: {
        icon: FiWifi,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        message: '连接正常'
      },
      [WebSocketConnectionStatus.CONNECTING]: {
        icon: FiWifi,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        message: '连接中...'
      },
      [WebSocketConnectionStatus.RECONNECTING]: {
        icon: FiRefreshCw,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        message: '重新连接中...'
      },
      [WebSocketConnectionStatus.ERROR]: {
        icon: FiWifiOff,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        message: '连接异常'
      },
      [WebSocketConnectionStatus.DISCONNECTED]: {
        icon: FiWifiOff,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        message: '连接断开'
      }
    };

    const config = statusConfig[connectionStatus];
    const IconComponent = config.icon;

    return (
      <div className={`flex items-center space-x-2 p-3 rounded-lg ${config.bgColor} mb-4`}>
        <IconComponent className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.message}
        </span>
      </div>
    );
  }

  private renderErrorDetails() {
    const { error, retryCount } = this.state;
    const severity = this.getErrorSeverity();
    
    if (!error) return null;

    const severityConfig = {
      low: {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      medium: {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      high: {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    };

    const config = severityConfig[severity];

    return (
      <div className={`border ${config.borderColor} ${config.bgColor} rounded-lg p-4 mb-4`}>
        <div className="flex items-start space-x-3">
          <FiAlertCircle className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${config.color} mb-1`}>
              {severity === 'high' ? '严重错误' : severity === 'medium' ? '连接问题' : '轻微异常'}
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {error.message}
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-gray-500">
                已重试 {retryCount}/{this.maxRetries} 次
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    // 如果提供了自定义fallback，使用它
    if (fallback) {
      return fallback;
    }

    const severity = this.getErrorSeverity();
    const canRetry = this.state.retryCount < this.maxRetries;

    return (
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
            <FiAlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            实时功能暂时不可用
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {severity === 'high' 
              ? '遇到了严重错误，请刷新页面或联系技术支持'
              : 'WebSocket连接出现问题，正在尝试恢复连接'}
          </p>

          {this.renderConnectionStatus()}
          {this.renderErrorDetails()}

          <div className="flex justify-center space-x-4">
            {canRetry && (
              <button
                onClick={this.handleManualRetry}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                重试连接
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
            >
              刷新页面
            </button>
          </div>

          {severity !== 'high' && (
            <p className="mt-4 text-xs text-gray-400">
              其他功能仍可正常使用，实时更新功能可能有延迟
            </p>
          )}
        </div>
      </div>
    );
  }
}