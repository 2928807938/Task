'use client';

import React, { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiWifi, 
  FiClock, 
  FiTrendingUp, 
  FiInfo, 
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';
import { useWebSocketStore } from '@/store/websocket/useWebSocketStore';
import { WebSocketConnectionStatus } from '@/infrastructure/websocket/types';

interface WebSocketDiagnosticsProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * WebSocket诊断工具组件
 * 提供连接状态、性能指标和调试信息
 */
export const WebSocketDiagnostics: React.FC<WebSocketDiagnosticsProps> = ({
  className = '',
  showDetails = false
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const {
    connectionStatus,
    isConnected,
    error,
    currentProjectId,
    getConnectionInfo
  } = useWebSocketStore();

  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo());

  // 定期更新连接信息
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionInfo(getConnectionInfo());
    }, 1000);

    return () => clearInterval(interval);
  }, [getConnectionInfo, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setConnectionInfo(getConnectionInfo());
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case WebSocketConnectionStatus.CONNECTED:
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case WebSocketConnectionStatus.CONNECTING:
      case WebSocketConnectionStatus.RECONNECTING:
        return <FiRefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case WebSocketConnectionStatus.ERROR:
        return <FiX className="w-4 h-4 text-red-500" />;
      case WebSocketConnectionStatus.DISCONNECTED:
      default:
        return <FiX className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case WebSocketConnectionStatus.CONNECTED:
        return '已连接';
      case WebSocketConnectionStatus.CONNECTING:
        return '连接中';
      case WebSocketConnectionStatus.RECONNECTING:
        return '重连中';
      case WebSocketConnectionStatus.ERROR:
        return '错误';
      case WebSocketConnectionStatus.DISCONNECTED:
      default:
        return '未连接';
    }
  };

  const getQualityIndicator = () => {
    const { quality, latency } = connectionInfo;
    
    const qualityConfig = {
      excellent: { color: 'text-green-500', bg: 'bg-green-100', label: '优秀' },
      good: { color: 'text-yellow-500', bg: 'bg-yellow-100', label: '良好' },
      poor: { color: 'text-red-500', bg: 'bg-red-100', label: '较差' },
      unknown: { color: 'text-gray-500', bg: 'bg-gray-100', label: '未知' }
    };

    const config = qualityConfig[quality as keyof typeof qualityConfig];

    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${config.bg}`}>
          <div className={`w-full h-full rounded-full ${config.color.replace('text-', 'bg-')}`} />
        </div>
        <span className={`text-xs ${config.color}`}>
          {config.label} {latency > 0 && `(${latency}ms)`}
        </span>
      </div>
    );
  };

  const formatUptime = (uptime: number | null) => {
    if (!uptime) return '---';
    
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const DiagnosticItem: React.FC<{
    icon: React.ComponentType<any>;
    label: string;
    value: React.ReactNode;
    status?: 'good' | 'warning' | 'error';
  }> = ({ icon: Icon, label, value, status }) => {
    const statusColors = {
      good: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600'
    };

    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
        <div className="flex items-center space-x-2">
          <Icon className={`w-4 h-4 ${status ? statusColors[status] : 'text-gray-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        </div>
        <span className={`text-sm font-medium ${status ? statusColors[status] : 'text-gray-900 dark:text-gray-100'}`}>
          {value}
        </span>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {/* 头部 - 始终显示 */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            WebSocket {getStatusText()}
          </span>
          {connectionInfo.quality !== 'unknown' && (
            <div className="ml-2">
              {getQualityIndicator()}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="刷新"
          >
            <FiRefreshCw className="w-3 h-3" />
          </button>
          <FiInfo className={`w-4 h-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* 详细信息 - 可折叠 */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
          <div className="space-y-1">
            <DiagnosticItem
              icon={FiWifi}
              label="连接状态"
              value={getStatusText()}
              status={isConnected ? 'good' : 'error'}
            />
            
            <DiagnosticItem
              icon={FiClock}
              label="连接时长"
              value={formatUptime(connectionInfo.uptime)}
            />
            
            <DiagnosticItem
              icon={FiTrendingUp}
              label="延迟"
              value={connectionInfo.latency > 0 ? `${connectionInfo.latency}ms` : '---'}
              status={
                connectionInfo.latency === 0 ? undefined :
                connectionInfo.latency < 500 ? 'good' : 
                connectionInfo.latency < 1000 ? 'warning' : 'error'
              }
            />
            
            <DiagnosticItem
              icon={FiActivity}
              label="消息统计"
              value={`发送: ${connectionInfo.messageStats.sent} / 接收: ${connectionInfo.messageStats.received}`}
            />
            
            <DiagnosticItem
              icon={FiRefreshCw}
              label="重连次数"
              value={connectionInfo.reconnectAttempts}
              status={connectionInfo.reconnectAttempts > 0 ? 'warning' : 'good'}
            />

            {currentProjectId && (
              <DiagnosticItem
                icon={FiInfo}
                label="当前项目"
                value={`项目 #${currentProjectId}`}
              />
            )}

            {error && (
              <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <div className="flex items-start space-x-2">
                  <FiAlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-800 dark:text-red-200">错误信息</p>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 调试信息 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 mb-2">调试信息:</p>
              <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                {JSON.stringify(connectionInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};