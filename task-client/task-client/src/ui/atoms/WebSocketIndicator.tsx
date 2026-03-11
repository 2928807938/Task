import React from 'react';
import { WebSocketConnectionStatus } from '@/infrastructure/websocket/types';

interface WebSocketIndicatorProps {
  status: WebSocketConnectionStatus;
  className?: string;
}

/**
 * WebSocket连接状态指示器
 * 显示当前WebSocket连接状态的小图标
 */
export const WebSocketIndicator: React.FC<WebSocketIndicatorProps> = ({ 
  status, 
  className = '' 
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case WebSocketConnectionStatus.CONNECTED:
        return {
          color: 'bg-green-500',
          title: '已连接 - 实时功能正常',
          pulse: false
        };
      case WebSocketConnectionStatus.CONNECTING:
        return {
          color: 'bg-yellow-500',
          title: '连接中...',
          pulse: true
        };
      case WebSocketConnectionStatus.RECONNECTING:
        return {
          color: 'bg-orange-500',
          title: '重新连接中...',
          pulse: true
        };
      case WebSocketConnectionStatus.ERROR:
        return {
          color: 'bg-red-500',
          title: '连接错误 - 实时功能不可用',
          pulse: false
        };
      case WebSocketConnectionStatus.DISCONNECTED:
      default:
        return {
          color: 'bg-gray-400',
          title: '未连接 - 实时功能不可用',
          pulse: false
        };
    }
  };

  const { color, title, pulse } = getStatusInfo();

  return (
    <div 
      className={`inline-flex items-center ${className}`}
      title={title}
    >
      <div className={`
        w-2 h-2 rounded-full 
        ${color} 
        ${pulse ? 'animate-pulse' : ''}
      `} />
      <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
        实时
      </span>
    </div>
  );
};