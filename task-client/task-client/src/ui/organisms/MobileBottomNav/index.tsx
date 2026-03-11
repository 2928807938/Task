'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiCalendar,
  FiPlus,
  FiActivity,
  FiUser,
  FiSearch,
  FiSettings,
  FiMessageSquare
} from 'react-icons/fi';
import Link from 'next/link';

interface MobileBottomNavProps {
  className?: string;
  currentPath?: string;
  onQuickAction?: (action: string) => void;
  unreadCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  action?: string;
  color: string;
  badge?: number;
}

/**
 * 移动端底部导航组件
 * 提供主要页面导航和快捷操作
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  className = '',
  currentPath = '/dashboard',
  onQuickAction,
  unreadCount = 0
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  // 主导航项
  const mainNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: '首页',
      icon: FiHome,
      href: '/dashboard',
      color: 'var(--theme-primary-500)',
    },
    {
      id: 'calendar',
      label: '日历',
      icon: FiCalendar,
      href: '/calendar',
      color: 'var(--theme-info-500)',
    },
    {
      id: 'add',
      label: '创建',
      icon: FiPlus,
      action: 'show-quick-actions',
      color: 'var(--theme-success-500)',
    },
    {
      id: 'activity',
      label: '活动',
      icon: FiActivity,
      href: '/activity',
      color: 'var(--theme-warning-500)',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'profile',
      label: '我的',
      icon: FiUser,
      href: '/profile',
      color: 'var(--theme-purple-500)',
    },
  ];

  // 快捷操作项
  const quickActions: NavItem[] = [
    {
      id: 'new-task',
      label: '新建任务',
      icon: FiPlus,
      action: 'create-task',
      color: 'var(--theme-primary-500)',
    },
    {
      id: 'search',
      label: '搜索',
      icon: FiSearch,
      action: 'search',
      color: 'var(--theme-info-500)',
    },
    {
      id: 'message',
      label: '消息',
      icon: FiMessageSquare,
      action: 'messages',
      color: 'var(--theme-success-500)',
    },
    {
      id: 'settings',
      label: '设置',
      icon: FiSettings,
      action: 'settings',
      color: 'var(--theme-neutral-500)',
    },
  ];

  // 处理导航项点击
  const handleNavItemClick = useCallback((item: NavItem) => {
    if (item.action) {
      if (item.action === 'show-quick-actions') {
        setShowQuickActions(prev => !prev);
      } else {
        onQuickAction?.(item.action);
        setShowQuickActions(false);
      }
    }
  }, [onQuickAction]);

  // 处理快捷操作点击
  const handleQuickActionClick = useCallback((action: string) => {
    onQuickAction?.(action);
    setShowQuickActions(false);
  }, [onQuickAction]);

  // 检查是否为当前路径
  const isActive = (href?: string) => {
    if (!href) return false;
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  // 渲染导航按钮
  const renderNavButton = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    const buttonContent = (
      <motion.button
        key={item.id}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleNavItemClick(item)}
        className={`
          relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200
          ${item.id === 'add' ? 'transform scale-110' : ''}
          ${active ? 'shadow-sm' : ''}
        `}
        style={{
          backgroundColor: active ? `${item.color}15` : 'transparent',
          color: active ? item.color : 'var(--theme-neutral-500)',
        }}
      >
        {/* 图标容器 */}
        <div className={`
          relative flex items-center justify-center
          ${item.id === 'add' ? 'w-12 h-12 rounded-full shadow-lg' : 'w-6 h-6'}
        `}
          style={{
            backgroundColor: item.id === 'add' ? item.color : 'transparent'
          }}
        >
          <Icon 
            className={`${item.id === 'add' ? 'h-6 w-6 text-white' : 'h-5 w-5'}`}
            style={{
              color: item.id === 'add' ? 'white' : (active ? item.color : 'var(--theme-neutral-500)')
            }}
          />
          
          {/* 徽章 */}
          {item.badge && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--theme-error-500)' }}
            >
              {item.badge > 99 ? '99+' : item.badge}
            </motion.div>
          )}
          
          {/* 活跃指示器 */}
          {active && item.id !== 'add' && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
              style={{ backgroundColor: item.color }}
            />
          )}
        </div>

        {/* 标签 */}
        {item.id !== 'add' && (
          <span className={`text-xs mt-1 font-medium transition-colors`}>
            {item.label}
          </span>
        )}
      </motion.button>
    );

    // 如果有链接，包装在Link组件中
    if (item.href && !item.action) {
      return (
        <Link key={item.id} href={item.href} className="flex-1">
          {buttonContent}
        </Link>
      );
    }

    return <div key={item.id} className="flex-1">{buttonContent}</div>;
  };

  return (
    <>
      {/* 快捷操作浮层 */}
      <AnimatePresence>
        {showQuickActions && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickActions(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            
            {/* 快捷操作面板 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              className="fixed bottom-20 left-4 right-4 z-50"
            >
              <div 
                className="rounded-2xl p-6 shadow-2xl border"
                style={{ 
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                }}
              >
                <div className="text-center mb-6">
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    快捷操作
                  </h3>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: 'var(--theme-neutral-500)' }}
                  >
                    选择要执行的操作
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickActionClick(action.action!)}
                        className="flex flex-col items-center p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                        style={{
                          backgroundColor: 'var(--theme-neutral-50)',
                          color: 'var(--theme-neutral-700)',
                        }}
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                          style={{ backgroundColor: `${action.color}15` }}
                        >
                          <Icon 
                            className="h-6 w-6" 
                            style={{ color: action.color }}
                          />
                        </div>
                        <span className="text-sm font-medium">{action.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 底部导航栏 */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={`
          fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-lg
          ${className}
        `}
        style={{ 
          backgroundColor: 'var(--theme-card-bg)/95',
          borderColor: 'var(--theme-card-border)',
        }}
      >
        {/* 安全区域适配 */}
        <div className="px-4 pt-2 pb-2" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
          <div className="flex items-center justify-around max-w-md mx-auto">
            {mainNavItems.map(renderNavButton)}
          </div>
        </div>
      </motion.div>

      {/* 底部导航占位符 */}
      <div 
        className="flex-shrink-0" 
        style={{ height: 'calc(5rem + env(safe-area-inset-bottom))' }}
      />
    </>
  );
};

export default MobileBottomNav;