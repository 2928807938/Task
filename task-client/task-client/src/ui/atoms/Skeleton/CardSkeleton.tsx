'use client';

import React from 'react';
import {Skeleton} from './Skeleton';
import {TextSkeleton} from './TextSkeleton';

interface CardSkeletonProps {
  className?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
  contentLines?: number;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
}

/**
 * 卡片骨架屏组件
 * 用于显示卡片式内容的加载状态
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className = '',
  hasHeader = true,
  hasFooter = false,
  contentLines = 3,
  animation = 'shimmer'
}) => {
  return (
    <div className={`border rounded-xl overflow-hidden ${className}`} style={{
      borderColor: 'var(--theme-card-border)',
      backgroundColor: 'var(--theme-card-bg)'
    }}>
      {hasHeader && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--theme-card-border)' }}>
          <div className="flex items-center">
            <Skeleton
              variant="circular"
              width="2rem"
              height="2rem"
              animation={animation}
              className="mr-3"
            />
            <div className="flex-1">
              <Skeleton
                width="40%"
                height="0.875rem"
                animation={animation}
                className="mb-2"
              />
              <Skeleton
                width="60%"
                height="0.625rem"
                animation={animation}
              />
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <TextSkeleton
          lines={contentLines}
          width={['100%', '90%', '80%', '85%']}
          animation={animation}
        />
      </div>

      {hasFooter && (
        <div className="p-4 border-t flex justify-between" style={{ borderColor: 'var(--theme-card-border)' }}>
          <Skeleton
            width="30%"
            height="1.25rem"
            animation={animation}
          />
          <Skeleton
            width="20%"
            height="1.25rem"
            animation={animation}
          />
        </div>
      )}
    </div>
  );
};
