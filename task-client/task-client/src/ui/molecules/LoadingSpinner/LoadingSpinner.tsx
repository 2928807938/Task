'use client';

import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | string;
  thickness?: 'thin' | 'regular' | 'thick';
  label?: string;
  className?: string;
}

/**
 * 符合苹果设计规范的加载旋转组件
 * 提供多种尺寸和颜色选项
 */
const LoadingSpinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  thickness = 'regular',
  label,
  className = ''
}) => {
  // 尺寸映射
  const sizeMap = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // 边框厚度映射
  const thicknessMap = {
    thin: 'border',
    regular: 'border-2',
    thick: 'border-3'
  };

  // 颜色映射
  const colorMap: Record<string, string> = {
    primary: 'border-[#007AFF]',
    secondary: 'border-[#8E8E93]',
    success: 'border-[#34C759]',
    danger: 'border-[#FF3B30]',
    warning: 'border-[#FF9500]',
    info: 'border-[#5AC8FA]'
  };

  // 获取颜色类
  const colorClass = colorMap[color] || `border-[${color}]`;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeMap[size]} ${thicknessMap[thickness]} rounded-full ${colorClass} border-t-transparent animate-spinner`}
        style={{
          // 旋转动画，确保平滑过渡
          animationTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
        }}
        role="status"
        aria-label={label || '加载中'}
      />
      {label && (
        <span className="mt-2 text-xs font-medium" style={{ color: 'var(--theme-neutral-500)' }}>{label}</span>
      )}
    </div>
  );
};

/**
 * 符合苹果设计规范的活动指示器
 * 仿照iOS设计的小型加载指示器
 */
export const ActivityIndicator: React.FC<{
  size?: 'xs' | 'sm' | 'md';
  color?: string;
  className?: string;
}> = ({
  size = 'sm',
  color = '#8E8E93',
  className = ''
}) => {
  // 尺寸映射
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  };

  return (
    <div
      className={`inline-block ${sizeMap[size]} ${className}`}
      style={{ color }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spinner"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="2.5"
        />
        <path
          d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

/**
 * 加载容器组件
 * 可包裹任何内容显示加载状态
 */
export const LoadingContainer: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  text?: string;
  spinnerProps?: SpinnerProps;
  className?: string;
  loadingClassName?: string;
  overlay?: boolean;
}> = ({
  loading,
  children,
  text = '加载中',
  spinnerProps,
  className = '',
  loadingClassName = '',
  overlay = true
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}

      {loading && (
        <div
          className={`
            ${overlay ? 'absolute inset-0 bg-white/60 backdrop-blur-[1px]' : ''}
            flex flex-col items-center justify-center
            transition-opacity duration-300
            ${loadingClassName}
          `}
        >
          <LoadingSpinner {...(spinnerProps || {})} />
          {text && (
            <span className="mt-3 text-sm font-medium" style={{ color: 'var(--theme-neutral-500)' }}>{text}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
