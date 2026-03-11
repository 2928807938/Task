'use client';

import React from 'react';
import {Skeleton} from './Skeleton';

interface TextSkeletonProps {
  lines?: number;
  width?: string | string[];
  className?: string;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
}

/**
 * 文本骨架屏组件
 * 显示多行文本的加载状态
 */
export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 3,
  width = ['100%', '80%', '60%'],
  className = '',
  animation = 'shimmer'
}) => {
  const widths = Array.isArray(width) ? width : Array(lines).fill(width);

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={widths[i % widths.length]}
          height="0.75rem"
          animation={animation}
        />
      ))}
    </div>
  );
};
