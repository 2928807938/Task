import React from 'react';

type TextVariant = 'normal' | 'error' | 'success' | 'muted';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  size?: TextSize;
  className?: string;
}

export function Text({ 
  children, 
  variant = 'normal', 
  size = 'base',
  className = '' 
}: TextProps) {
  const variantClasses = {
    normal: 'text-gray-900',
    error: 'text-red-500',
    success: 'text-green-500',
    muted: 'text-gray-500'
  };
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  return (
    <span className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
