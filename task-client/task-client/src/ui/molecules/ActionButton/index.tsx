'use client';

import React from 'react';

interface ActionButtonProps {
  icon?: React.ReactNode;
  text: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

/**
 * 通用操作按钮组件
 * 用于统一展示各种操作按钮（如新增任务、筛选等）
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  text,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
}) => {
  // 根据variant设置样式
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-gray-200',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-200 dark:border-neutral-600',
  };

  // 根据size设置样式
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md shadow-sm transition-colors duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {text}
    </button>
  );
};

export default ActionButton;
