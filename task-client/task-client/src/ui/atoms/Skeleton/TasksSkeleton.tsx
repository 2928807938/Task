'use client';

import React from 'react';
import {Skeleton} from './Skeleton';

interface TasksSkeletonProps {
  className?: string;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
}

/**
 * 临期任务骨架屏组件
 * 特化临期任务面板的加载状态
 */
export const UpcomingTasksSkeleton: React.FC<TasksSkeletonProps> = ({
  className = '',
  animation = 'shimmer'
}) => {
  return (
    <div 
      className={`border rounded-xl overflow-hidden ${className}`}
      style={{
        borderColor: 'var(--theme-card-border)',
        backgroundColor: 'var(--theme-card-background)'
      }}
    >
      {/* 面板标题 */}
      <div 
        className="p-3 border-b flex justify-between items-center"
        style={{ borderColor: 'var(--theme-card-border)' }}
      >
        <div className="flex items-center">
          <Skeleton
            width="1.5rem"
            height="1.5rem"
            variant="circular"
            animation={animation}
            className="mr-2"
          />
          <Skeleton
            width="120px"
            height="1rem"
            animation={animation}
          />
        </div>
        <div className="flex space-x-2">
          <Skeleton
            width="30px"
            height="1.5rem"
            variant="rounded"
            animation={animation}
          />
          <Skeleton
            width="30px"
            height="1.5rem"
            variant="rounded"
            animation={animation}
          />
        </div>
      </div>

      {/* 任务列表 */}
      <div className="p-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div 
            key={item} 
            className="p-2 border-b last:border-b-0"
            style={{ borderColor: 'var(--theme-card-border)' }}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center">
                <Skeleton
                  width="1rem"
                  height="1rem"
                  variant="rounded"
                  animation={animation}
                  className="mr-2"
                />
                <Skeleton
                  width="180px"
                  height="1rem"
                  animation={animation}
                />
              </div>
              <Skeleton
                width="60px"
                height="0.75rem"
                variant="rounded"
                animation={animation}
              />
            </div>
            <div className="flex justify-between pl-6 items-center">
              <Skeleton
                width="120px"
                height="0.75rem"
                animation={animation}
              />
              <div className="flex items-center space-x-1">
                <Skeleton
                  width="60px"
                  height="0.75rem"
                  variant="rounded"
                  animation={animation}
                />
                <Skeleton
                  width="1.25rem"
                  height="1.25rem"
                  variant="circular"
                  animation={animation}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部按钮 */}
      <div 
        className="p-3 border-t flex justify-center"
        style={{ borderColor: 'var(--theme-card-border)' }}
      >
        <Skeleton
          width="150px"
          height="2rem"
          variant="rounded"
          animation={animation}
        />
      </div>
    </div>
  );
};

/**
 * 我的任务骨架屏组件
 * 特化我的任务面板的加载状态
 */
export const MyTasksSkeleton: React.FC<TasksSkeletonProps> = ({
  className = '',
  animation = 'shimmer'
}) => {
  return (
    <div 
      className={`border rounded-xl overflow-hidden ${className}`}
      style={{
        borderColor: 'var(--theme-card-border)',
        backgroundColor: 'var(--theme-card-background)'
      }}
    >
      {/* 面板标题 */}
      <div 
        className="p-3 border-b flex justify-between items-center"
        style={{ borderColor: 'var(--theme-card-border)' }}
      >
        <div className="flex items-center">
          <Skeleton
            width="1.5rem"
            height="1.5rem"
            variant="circular"
            animation={animation}
            className="mr-2"
          />
          <Skeleton
            width="100px"
            height="1rem"
            animation={animation}
          />
        </div>
        <div className="flex space-x-2">
          <Skeleton
            width="30px"
            height="1.5rem"
            variant="rounded"
            animation={animation}
          />
          <Skeleton
            width="30px"
            height="1.5rem"
            variant="rounded"
            animation={animation}
          />
        </div>
      </div>

      {/* 任务卡片网格 */}
      <div className="p-3 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((item) => (
          <div 
            key={item} 
            className="border rounded-lg p-3 relative"
            style={{
              borderColor: 'var(--theme-card-border)',
              backgroundColor: 'var(--theme-card-background)'
            }}
          >
            {/* 左侧优先级标记 */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
              style={{ backgroundColor: 'var(--theme-neutral-200)' }}
            />

            <Skeleton
              width="90%"
              height="1rem"
              animation={animation}
              className="mb-2"
            />
            <div className="flex justify-between items-center mb-2">
              <Skeleton
                width="60%"
                height="0.75rem"
                animation={animation}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <Skeleton
                width="25%"
                height="0.75rem"
                animation={animation}
                variant="rounded"
              />
              <Skeleton
                width="20%"
                height="0.75rem"
                animation={animation}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
