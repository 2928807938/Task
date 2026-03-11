'use client';

import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '', // 设置默认值为空字符串
  src,
  size = 'md',
  className = '',
}) => {
  const getInitials = (name: string) => {
    // 确保name是有效的字符串
    if (!name || typeof name !== 'string') return 'U';
    
    return name
      .split(' ')
      .map(part => part && part[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U'; // 如果结果为空，则返回默认值'U'
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'w-6 h-6 text-xs';
      case 'sm': return 'w-8 h-8 text-sm';
      case 'md': return 'w-10 h-10 text-base';
      case 'lg': return 'w-12 h-12 text-lg';
      default: return 'w-10 h-10 text-base';
    }
  };

  const getRandomColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    // 使用名称的哈希值来确定颜色，确保同一个名字总是得到相同的颜色
    // 添加空值检查，如果name为undefined或空字符串，则使用默认值'User'
    const safeName = name || 'User';
    const hash = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const sizeClasses = getSizeClasses();
  const bgColor = getRandomColor();

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full ${sizeClasses} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={name || 'User avatar'}
          width={48}
          height={48}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <div className={`flex items-center justify-center w-full h-full rounded-full ${bgColor} text-white font-medium`}>
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};
