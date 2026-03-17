'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// 定义空状态卡片组件的props接口
export interface EmptyStateCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onActionClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal' | 'illustrated';
}

/**
 * 空状态卡片组件
 * 符合苹果设计规范的极简风格空状态展示
 */
export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  onActionClick,
  className = '',
  size = 'medium',
  variant = 'default'
}) => {
  // 根据尺寸设置样式
  const sizeStyles = {
    small: {
      container: 'p-4',
      icon: 'w-8 h-8 mb-3',
      iconSize: 'h-5 w-5',
      title: 'text-sm font-medium mb-1',
      description: 'text-xs max-w-[200px]',
      action: 'mt-3 px-3 py-1 text-xs'
    },
    medium: {
      container: 'p-8',
      icon: 'w-12 h-12 mb-5',
      iconSize: 'h-8 w-8',
      title: 'text-base font-medium mb-1',
      description: 'text-sm max-w-[260px]',
      action: 'mt-6 px-4 py-1.5 text-sm'
    },
    large: {
      container: 'p-12',
      icon: 'w-16 h-16 mb-6',
      iconSize: 'h-10 w-10',
      title: 'text-lg font-semibold mb-2',
      description: 'text-base max-w-[320px]',
      action: 'mt-8 px-6 py-2 text-base'
    }
  };

  const currentSize = sizeStyles[size];

  // 处理动作点击
  const handleActionClick = (e: React.MouseEvent) => {
    if (onActionClick) {
      e.preventDefault();
      onActionClick();
    }
  };

  // 渲染动作按钮
  const renderActionButton = () => {
    if (!actionLabel) return null;

    const buttonContent = (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`inline-flex items-center font-medium rounded-full transition-colors duration-200 ${currentSize.action}`}
        style={{
          color: 'var(--theme-primary-500)',
          backgroundColor: 'var(--theme-neutral-100)'
        }}
        onClick={handleActionClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--theme-neutral-200)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--theme-neutral-100)';
        }}
      >
        {actionLabel}
      </motion.button>
    );

    // 如果有链接且没有自定义点击处理，使用Link包装
    if (actionLink && !onActionClick) {
      return (
        <Link href={actionLink}>
          {buttonContent}
        </Link>
      );
    }

    return buttonContent;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`rounded-xl ${className}`}
      style={{ 
        backgroundColor: 'var(--theme-card-bg)',
        boxShadow: variant === 'minimal' ? 'none' : 'var(--theme-shadow-sm)',
        border: variant === 'minimal' ? '1px solid var(--theme-card-border)' : 'none'
      }}
    >
      <div className={`flex flex-col items-center justify-center text-center h-full ${currentSize.container}`}>
        {/* 图标 */}
        <div className={`mx-auto flex items-center justify-center ${currentSize.icon}`}>
          <Icon 
            className={currentSize.iconSize} 
            style={{ 
              color: variant === 'minimal' 
                ? 'var(--theme-neutral-400)' 
                : 'var(--theme-primary-500)' 
            }} 
          />
        </div>

        {/* 标题 */}
        <h3 
          className={`${currentSize.title}`}
          style={{ color: 'var(--foreground)' }}
        >
          {title}
        </h3>

        {/* 描述 */}
        <p 
          className={`${currentSize.description} mx-auto leading-relaxed`}
          style={{ color: 'var(--theme-neutral-500)' }}
        >
          {description}
        </p>

        {/* 动作按钮 */}
        {renderActionButton()}
      </div>
    </motion.div>
  );
};

/**
 * 预设的常用空状态组件
 */
type EmptyTasksVariant = 'upcoming' | 'completed' | 'general';
type EmptyTasksConfig = { icon: React.LazyExoticComponent<React.ComponentType<any>>; title: string; description: string };

export const EmptyTasksCard: React.FC<Omit<EmptyStateCardProps, 'icon' | 'title' | 'description'> & { variant?: EmptyTasksVariant }> = ({
  variant = 'general',
  ...props
}) => {
  const currentVariant = variant as EmptyTasksVariant;
  const configs: Record<EmptyTasksVariant, EmptyTasksConfig> = {
    upcoming: {
      icon: React.lazy(() => import('react-icons/fi').then(mod => ({ default: mod.FiClock }))),
      title: '暂无临期任务',
      description: '您目前没有即将到期的任务。'
    },
    completed: {
      icon: React.lazy(() => import('react-icons/fi').then(mod => ({ default: mod.FiCheckCircle }))),
      title: '暂无已完成任务',
      description: '还没有完成任何任务。'
    },
    general: {
      icon: React.lazy(() => import('react-icons/fi').then(mod => ({ default: mod.FiClipboard }))),
      title: '暂无任务',
      description: '您的任务列表当前为空。'
    }
  };

  const config = configs[currentVariant];

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <EmptyStateCard
        icon={config.icon as React.ElementType}
        title={config.title}
        description={config.description}
        {...props}
      />
    </React.Suspense>
  );
};

export default EmptyStateCard;
