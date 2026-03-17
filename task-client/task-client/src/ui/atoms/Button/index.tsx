"use client";

import React, {useCallback} from 'react';
import {FiCheck, FiEdit, FiPlus, FiSearch, FiTrash, FiX} from 'react-icons/fi';
import {showLoading} from '@/utils/loading-utils';

type IconType = 'plus' | 'edit' | 'delete' | 'check' | 'close' | 'search' | null;

interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  loadingText?: string;
  /**
   * 是否导航按钮，如果是，点击时会显示全局加载状态
   */
  isNavigation?: boolean;
  /**
   * 导航提示文本
   */
  navLoadingText?: string;
  /**
   * 导航目标地址
   */
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  isLoading = false,
  loadingText,
  isNavigation = false,
  navLoadingText = '页面加载中',
  href,
}) => {
  const getIcon = (iconName: IconType) => {
    switch (iconName) {
      case 'plus':
        return <FiPlus />;
      case 'edit':
        return <FiEdit />;
      case 'delete':
        return <FiTrash />;
      case 'check':
        return <FiCheck />;
      case 'close':
        return <FiX />;
      case 'search':
        return <FiSearch />;
      default:
        return null;
    }
  };

  const baseStyles = "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-2.5 text-lg",
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const disabledStyle = (disabled || isLoading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  // 处理点击事件，如果是导航按钮，显示全局加载状态
  const handleClick = useCallback(() => {
    if (isNavigation) {
      // 触发全局加载状态
      showLoading(navLoadingText);
    }

    // 调用原始的onClick处理函数
    if (onClick) {
      onClick();
    }
  }, [isNavigation, navLoadingText, onClick]);

  // 渲染内容
  const renderContent = () => (
    <>
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={`inline-block ${children ? 'mr-2' : ''}`}>{getIcon(icon)}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className={`inline-block ${children ? 'ml-2' : ''}`}>{getIcon(icon)}</span>
          )}
        </>
      )}
    </>
  );

  // 根据是否有href属性决定渲染button还是a标签
  return href ? (
    <a
      href={href}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${className} flex items-center justify-center`}
      onClick={handleClick}
      data-navigation={isNavigation ? 'true' : undefined}
    >
      {renderContent()}
    </a>
  ) : (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${className} flex items-center justify-center`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      data-navigation={isNavigation ? 'true' : undefined}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
export {Button};
