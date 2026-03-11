'use client';

import React from 'react';
import {useTheme} from '@/ui/theme';

export interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
}

/**
 * 骨架屏加载组件
 * 提供脉冲、波浪和微光三种动画效果
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1.5rem',
  variant = 'text',
  animation = 'shimmer'
}) => {
  const { theme, isDark } = useTheme();

  // 基础样式 - 使用CSS变量作为后备，避免主题初始化时的闪烁
  const baseStyle = {
    backgroundColor: theme?.colors?.neutral?.[200] || 'var(--theme-neutral-200)',
    position: 'relative' as const,
    overflow: 'hidden' as const
  };

  // 变体样式
  const variantClasses = {
    text: 'rounded-md',
    rectangular: '',
    rounded: 'rounded-lg',
    circular: 'rounded-full'
  };

  // 动画样式
  let animationClasses = '';
  let beforeClasses = '';

  if (animation === 'pulse') {
    animationClasses = 'animate-pulse';
  } else if (animation === 'shimmer' || animation === 'wave') {
    // 为shimmer和wave添加伪元素样式
    beforeClasses = 'before:absolute before:inset-0 before:translate-x-[-100%]';

    if (animation === 'shimmer') {
      beforeClasses += ` before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:to-transparent`;
    } else {
      beforeClasses += ` before:animate-wave before:bg-gradient-to-r before:from-transparent before:to-transparent`;
    }
  }

  return (
    <div
      className={`${variantClasses[variant]} ${animationClasses} ${beforeClasses} ${className}`}
      style={{ 
        ...baseStyle,
        width, 
        height,
        // 为shimmer和wave动画添加伪元素的背景渐变
        ...(animation === 'shimmer' || animation === 'wave' ? {
          '--shimmer-color': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'
        } as React.CSSProperties : {})
      }}
    />
  );
};
