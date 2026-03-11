'use client';

import React, { Component, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

/**
 * 错误边界组件
 * 捕获子组件中的JavaScript错误，记录错误并显示降级UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新状态，下次渲染将显示降级UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // 记录错误到错误报告服务
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ 
      error, 
      errorInfo 
    });

    // 调用自定义错误处理器
    this.props.onError?.(error, errorInfo);

    // 发送错误到监控服务（如果有配置）
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: any) => {
    // 可以集成错误监控服务，如Sentry、LogRocket等
    if (process.env.NODE_ENV === 'production') {
      try {
        // 示例：发送到错误监控服务
        // window.errorReportingService?.captureException(error, {
        //   contexts: { react: errorInfo }
        // });
        
        console.warn('Error reported to monitoring service:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        });
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError);
      }
    }
  };

  private handleRetry = () => {
    // 清除错误状态，重新渲染子组件
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });

    // 延迟刷新，防止立即重新出错
    this.retryTimeoutId = setTimeout(() => {
      if (this.state.hasError) {
        // 如果重试后仍有错误，可能需要页面刷新
        console.warn('Retry failed, component still has error');
      }
    }, 1000);
  };

  private handleReload = () => {
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // 如果有自定义降级UI，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 根据错误级别显示不同的错误UI
      return this.renderErrorUI();
    }

    return this.props.children;
  }

  private renderErrorUI = () => {
    const { level = 'component', showDetails = false } = this.props;
    const { error } = this.state;

    const errorMessages = {
      page: {
        title: '页面加载失败',
        description: '很抱歉，页面遇到了一些问题。请尝试刷新页面或返回首页。',
        icon: FiAlertTriangle
      },
      component: {
        title: '组件加载失败',
        description: '该功能模块暂时不可用，请稍后再试。',
        icon: FiAlertTriangle
      },
      critical: {
        title: '系统错误',
        description: '应用遇到严重错误，请联系技术支持或刷新页面。',
        icon: FiAlertTriangle
      }
    };

    const config = errorMessages[level];
    const Icon = config.icon;

    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-md mx-auto"
        >
          <div 
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--theme-error-50)' }}
          >
            <Icon 
              className="h-8 w-8" 
              style={{ color: 'var(--theme-error-500)' }} 
            />
          </div>

          <h3 
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            {config.title}
          </h3>

          <p 
            className="text-sm mb-6 leading-relaxed"
            style={{ color: 'var(--theme-neutral-500)' }}
          >
            {config.description}
          </p>

          {/* 错误详情（开发模式或明确要求时显示） */}
          {showDetails && error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-lg text-left overflow-auto"
              style={{ 
                backgroundColor: 'var(--theme-neutral-50)',
                border: '1px solid var(--theme-neutral-200)'
              }}
            >
              <p className="text-xs font-mono mb-2" style={{ color: 'var(--theme-error-600)' }}>
                {error.name}: {error.message}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <pre className="text-xs overflow-x-auto" style={{ color: 'var(--theme-neutral-600)' }}>
                  {error.stack}
                </pre>
              )}
            </motion.div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={this.handleRetry}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: 'var(--theme-primary-500)',
                color: 'white'
              }}
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              重试
            </motion.button>

            {level === 'page' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleReload}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                  style={{
                    backgroundColor: 'var(--theme-neutral-100)',
                    color: 'var(--theme-neutral-700)'
                  }}
                >
                  <FiRefreshCw className="h-4 w-4 mr-2" />
                  刷新页面
                </motion.button>

                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                  style={{
                    backgroundColor: 'var(--theme-neutral-100)',
                    color: 'var(--theme-neutral-700)'
                  }}
                >
                  <FiHome className="h-4 w-4 mr-2" />
                  返回首页
                </Link>
              </>
            )}
          </div>

          {/* 帮助信息 */}
          <p className="text-xs mt-6" style={{ color: 'var(--theme-neutral-400)' }}>
            如果问题持续存在，请联系技术支持
          </p>
        </motion.div>
      </div>
    );
  };
}

/**
 * 高阶组件：为组件添加错误边界
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Hook：用于手动触发错误边界
 */
export const useErrorHandler = () => {
  const [, setState] = React.useState();

  return React.useCallback((error: Error) => {
    setState(() => {
      throw error;
    });
  }, []);
};

/**
 * 轻量级错误显示组件
 */
export const ErrorMessage: React.FC<{
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}> = ({ error, onRetry, className = '' }) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      <div className="text-center">
        <FiAlertTriangle 
          className="h-8 w-8 mx-auto mb-3" 
          style={{ color: 'var(--theme-error-500)' }} 
        />
        <p className="text-sm mb-3" style={{ color: 'var(--theme-neutral-600)' }}>
          {errorMessage}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200"
            style={{
              backgroundColor: 'var(--theme-primary-100)',
              color: 'var(--theme-primary-600)'
            }}
          >
            <FiRefreshCw className="h-3 w-3 mr-1" />
            重试
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;