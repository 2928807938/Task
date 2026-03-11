'use client';

import React from 'react';
import {Skeleton} from './Skeleton';
import {CardSkeleton} from './CardSkeleton';
import {MyTasksSkeleton, UpcomingTasksSkeleton} from './TasksSkeleton';

interface DashboardSkeletonProps {
  className?: string;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
}

/**
 * 仪表盘骨架屏组件
 * 专为仪表盘页面设计的加载状态
 */
export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  className = '',
  animation = 'shimmer'
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 页面标题区 */}
      <div className="flex justify-between items-center mb-5 pb-4 border-b" style={{ borderColor: 'var(--theme-card-border)' }}>
        <div>
          <Skeleton
            width="180px"
            height="1.75rem"
            animation={animation}
            className="mb-2"
          />
          <Skeleton
            width="240px"
            height="0.625rem"
            animation={animation}
          />
        </div>
        <Skeleton
          width="120px"
          height="1.75rem"
          variant="rounded"
          animation={animation}
        />
      </div>

      {/* 仪表盘布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左侧 */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 临期任务区 - 使用特化的临期任务骨架屏 */}
          <div className="md:col-span-5">
            <UpcomingTasksSkeleton
              animation={animation}
              className="min-h-[400px]"
            />
          </div>

          {/* 我的任务区 - 使用特化的我的任务骨架屏 */}
          <div className="md:col-span-7">
            <MyTasksSkeleton
              animation={animation}
              className="min-h-[400px]"
            />
          </div>

          {/* 协作区 */}
          <div className="md:col-span-12">
            <CardSkeleton
              hasHeader={true}
              hasFooter={true}
              contentLines={3}
              animation={animation}
              className="min-h-[340px]"
            />
          </div>
        </div>

        {/* 右侧日历区 */}
        <div className="lg:col-span-3">
          <CardSkeleton
            hasHeader={true}
            hasFooter={true}
            contentLines={10}
            animation={animation}
            className="min-h-[790px]"
          />
        </div>
      </div>
    </div>
  );
};
