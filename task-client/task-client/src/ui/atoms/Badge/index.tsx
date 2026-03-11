"use client";

import React from 'react';

interface BadgeProps {
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  color = 'blue',
  size = 'md',
  className = '',
  children
}) => {
  const colorClasses = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500'
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full ${className}`}>
      {children}
    </div>
  );
};

export default Badge;
