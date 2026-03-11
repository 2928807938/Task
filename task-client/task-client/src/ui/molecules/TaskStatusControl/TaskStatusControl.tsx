'use client';

import React, {useEffect, useRef, useState} from 'react';
import {FiCheck, FiChevronDown} from 'react-icons/fi';
import {ActivityIndicator} from '../LoadingSpinner';

// CSS动画定义
const appleAnimationStyles = `
  @keyframes appleMenuShow {
    0% {
      opacity: 0;
      transform: translateY(8px) scale(0.97);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes appleMenuItemShow {
    0% {
      opacity: 0;
      transform: translateY(8px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// 任务状态类型
export type TaskStatus = {
  id: string;
  name: string;
  color: string;
};

// 定义可用的任务状态列表
// 这些状态仅在没有自定义状态列表时作为参考使用
export const TASK_STATUSES: TaskStatus[] = [
  { id: 'pending', name: '待处理', color: '#8E8E93' },
  { id: 'in_progress', name: '进行中', color: '#007AFF' },
  { id: 'completed', name: '已完成', color: '#34C759' },
  { id: 'canceled', name: '已取消', color: '#FF3B30' }
];

// 组件属性定义
interface TaskStatusControlProps {
  currentStatusId: string;
  currentStatusName?: string;
  currentStatusColor?: string;
  onStatusChange: (newStatusId: string) => void;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  className?: string;
  isDisabled?: boolean;
  // 新增：自定义状态列表
  statusList?: TaskStatus[];
  // 新增：是否加载中
  isLoading?: boolean;
  // 新增：在切换菜单前的回调，用于获取状态列表
  onBeforeToggle?: (taskId: string) => void;
  taskId?: string; // 添加任务ID属性
}

/**
 * 任务状态控制组件
 * 符合苹果设计规范的任务状态流转控制器
 * 支持动态加载任务状态列表
 */
const TaskStatusControl: React.FC<TaskStatusControlProps> = ({
  currentStatusId,
  currentStatusName,
  currentStatusColor,
  onStatusChange,
  size = 'medium',
  showIcon = true,
  className = '',
  isDisabled = false,
  statusList,
  isLoading = false,
  onBeforeToggle,
  taskId
}) => {
  // 状态管理
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 引用DOM元素
  const containerRef = useRef<HTMLDivElement>(null);

  // 当API提供状态列表时使用API数据，如果没有则使用默认状态列表
  const statusItems = statusList && statusList.length > 0 ? statusList : [
    { id: 'planning', name: '策划中', color: '#AF52DE' },
    { id: 'pending', name: '等待中', color: '#5C68E2' },
    { id: 'in_progress', name: '进行中', color: '#34C759' },
    { id: 'needs_change', name: '需求变更', color: '#FF2D55' },
    { id: 'paused', name: '已暂停', color: '#FFCC00' },
    { id: 'completed', name: '已完成', color: '#007AFF' },
    { id: 'canceled', name: '已取消', color: '#FF3B30' }
  ];

  // 获取当前状态对象
  const currentStatus = {
    id: currentStatusId,
    name: currentStatusName || '未知状态',
    color: currentStatusColor || '#8E8E93'
  };

  // 如果在状态列表中找到当前状态，则使用列表中的数据
  const foundStatus = statusItems.find(status => status.id === currentStatusId);
  if (foundStatus) {
    currentStatus.name = foundStatus.name;
    currentStatus.color = foundStatus.color;
  }

  // 添加苹果风格动画样式到DOM
  useEffect(() => {
    // 检查是否已存在同名样式表
    const styleId = 'apple-animation-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = appleAnimationStyles;
      document.head.appendChild(styleElement);

      // 组件卸载时移除样式
      return () => {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, []);

  // 点击外部关闭菜单的处理函数
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {

      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // 使用 setTimeout 确保不会与其他状态更新冲突
        setTimeout(() => {
          setIsOpen(false);
        }, 10);
      }
    };

    // 添加全局点击事件监听
    document.addEventListener('mousedown', handleClickOutside);

    // 清理函数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 添加useEffect来监控下拉菜单状态变化，记录日志
  useEffect(() => {
  }, [isOpen, isDisabled, isLoading, statusItems]);

  // 切换菜单显示状态 - 简化逻辑确保正确执行
  const toggleMenu = (e: React.MouseEvent) => {
    // 阻止事件传播
    e.stopPropagation();
    e.preventDefault();

    // 如果禁用或正在更新，不处理
    if (isDisabled || isUpdating) {
      return;
    }

    // 点击时如果菜单已经打开，则关闭
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    // 如果菜单未打开，则打开并加载数据

    // 先设置状态，再触发回调
    setIsOpen(true);

    // 确保状态更新已应用
    setTimeout(() => {

      // 如果有回调，触发数据加载
      if (onBeforeToggle && taskId) {
        onBeforeToggle(taskId);
      }
    }, 50);
  };

  // 选择状态
  const selectStatus = (statusId: string) => {
    if (statusId === currentStatusId || isUpdating) return;

    setIsUpdating(true);

    try {
      // 调用回调函数更新状态
      onStatusChange(statusId);
      setIsOpen(false);
    } catch (error) {
      console.error('状态更新失败:', error);
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
      }, 300);
    }
  };

  // 样式配置 - 苹果风格优化
  const sizeStyles = {
    small: {
      button: 'text-xs px-1.5 py-0.5',
      icon: 'h-1.5 w-1.5 mr-1',
      arrow: 'h-2 w-2 ml-0.5',
      menu: 'text-xs min-w-[120px]', // 增加最小宽度确保菜单不会太窄
      item: 'py-1'
    },
    medium: {
      button: 'text-sm px-2 py-0.75',
      icon: 'h-2 w-2 mr-1',
      arrow: 'h-2.5 w-2.5 ml-0.75',
      menu: 'text-sm min-w-[140px]',
      item: 'py-1.5'
    },
    large: {
      button: 'text-base px-3 py-1',
      icon: 'h-2.5 w-2.5 mr-1.5',
      arrow: 'h-3 w-3 ml-1',
      menu: 'text-base min-w-[160px]',
      item: 'py-2'
    },
  };

  const styles = sizeStyles[size];


  return (
    <div
      ref={containerRef}
      className={`relative inline-block task-status-control ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 状态按钮 */}
      <div
        className={`task-status-control rounded-full border inline-flex items-center justify-between cursor-pointer ${styles.button} ${
          isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
        } ${isOpen ? 'ring-2 ring-opacity-30' : ''}`}
        style={{
          color: currentStatus.color,
          backgroundColor: `${currentStatus.color}10`,
          borderColor: `${currentStatus.color}30`,
          ...(isOpen ? { ringColor: currentStatus.color } : {}),
        }}
        onClick={toggleMenu}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center">
          {showIcon && !isUpdating && (
            <div
              className={`rounded-full ${styles.icon} opacity-80`}
              style={{ backgroundColor: currentStatus.color }}
            />
          )}

          {isUpdating ? (
            <div className={`${styles.icon} flex items-center justify-center`}>
              <ActivityIndicator size="xs" color={currentStatus.color} />
            </div>
          ) : null}

          <span>{currentStatus.name}</span>
        </div>

        {!isDisabled && (
          <FiChevronDown className={`${styles.arrow} opacity-70`} />
        )}
      </div>

      {/* 下拉菜单 -  */}
      {/* 强制显示菜单，确保在isOpen=true时一定能显示 */}
      {isOpen && (
        <div
          className={`fixed z-[99999] bg-white rounded-xl shadow-2xl border border-gray-200 py-2 overflow-visible`}
          style={{
            boxShadow: '0 4px 30px rgba(0,0,0,0.15), 0 0 5px rgba(0,0,0,0.08)',
            minWidth: '200px',
            maxWidth: '300px',
            top: containerRef.current ? containerRef.current.getBoundingClientRect().bottom + 5 : 0,
            left: containerRef.current ? containerRef.current.getBoundingClientRect().left : 0,
            animation: 'appleMenuShow 0.2s cubic-bezier(0.23, 1, 0.32, 1) forwards',
            visibility: 'visible',
            opacity: 1
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 加载中状态 - 增强加载指示器 */}
          {isLoading ? (
            <div className="py-5 px-4 flex flex-col items-center justify-center space-y-2"
              style={{ minWidth: '180px', animation: 'appleMenuShow 0.2s cubic-bezier(0.23, 1, 0.32, 1) forwards' }}>
              <ActivityIndicator size="sm" color="#007AFF" className="mb-1" />
              <span className="text-sm font-medium" style={{ color: 'var(--theme-neutral-500)' }}>正在加载状态列表...</span>
              <span className="text-xs opacity-70" style={{ color: 'var(--theme-neutral-500)' }}>请稍候</span>
            </div>
          ) : statusItems.length === 0 ? (
            <div className="py-4 px-3 text-center" style={{ minWidth: '180px' }}>
              <span className="text-sm" style={{ color: 'var(--theme-neutral-500)' }}>没有可用的状态选项</span>
            </div>
          ) : (
            /* 渲染状态列表项 - 添加苹果风格动效和过渡 */
            <div className="py-1">
              {statusItems.map((status, index) => (
                <div
                  key={status.id}
                  style={{
                    animation: `appleMenuItemShow 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards ${index * 0.03}s`,
                    opacity: 0,
                    transform: 'translateY(8px)'
                  }}
                  className={`mx-1 my-0.5 rounded-lg flex items-center cursor-pointer transition-all hover:bg-[#F2F2F7] active:bg-[#E5E5EA] active:scale-[0.98] ${status.id === currentStatusId ? 'font-medium' : ''}`}
                  onClick={() => selectStatus(status.id)}
                >
                  <div className="flex-1 flex items-center py-1.5 px-2">
                    {/* 状态圆点指示器 */}
                    <div
                      className="h-2.5 w-2.5 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: status.color, opacity: 0.8 }}
                    />
                    <span
                      className="text-sm"
                      style={{
                        color: status.id === currentStatusId ? 'var(--theme-primary-500)' : 'var(--foreground)'
                      }}
                    >
                      {status.name}
                    </span>
                    {/* 选中状态显示勾选图标 */}
                    {status.id === currentStatusId && (
                      <FiCheck className="h-3.5 w-3.5 ml-auto" style={{ color: 'var(--theme-primary-500)' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskStatusControl;
