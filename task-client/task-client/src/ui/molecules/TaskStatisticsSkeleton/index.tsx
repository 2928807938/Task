'use client';

import React from 'react';
import {motion} from 'framer-motion';
import {useTheme} from '@/ui/theme';

/**
 * 任务统计骨架屏组件
 * 适用于统计卡片加载时的显示效果
 */
const TaskStatisticsSkeleton: React.FC = () => {
  const { theme, isDark } = useTheme();

  // 使用CSS变量作为后备，避免主题初始化时的闪烁
  const getSkeletonColor = () => theme?.colors?.neutral?.[200] || 'var(--theme-neutral-200)';
  const getCardBackground = () => theme?.colors?.card?.background || 'var(--theme-card-bg)';
  const getCardBorder = () => theme?.colors?.card?.border || 'var(--theme-card-border)';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 任务完成度卡片骨架屏 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative backdrop-blur-lg rounded-2xl p-6 border shadow-sm overflow-hidden"
        style={{
          backgroundColor: getCardBackground(),
          borderColor: getCardBorder(),
          boxShadow: isDark 
            ? '0 2px 14px rgba(0,0,0,0.2)' 
            : '0 2px 14px rgba(0,0,0,0.03)'
        }}
      >
        {/* 玻璃光效 */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none">
          <div 
            className="h-px w-full bg-gradient-to-r from-transparent to-transparent"
            style={{
              background: `linear-gradient(to right, transparent, ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)'}, transparent)`
            }}
          ></div>
          <div 
            className="h-[1.5px] w-1/3 mt-10 ml-4 rounded-full"
            style={{
              background: `linear-gradient(to right, transparent, ${isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.03)'}, transparent)`
            }}
          ></div>
          <div 
            className="h-[0.7px] w-1/5 mt-8 ml-auto mr-6 rounded-full"
            style={{
              background: `linear-gradient(to right, transparent, ${isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.03)'}, transparent)`
            }}
          ></div>
        </div>

        {/* 标题区骨架 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div 
              className="w-5 h-5 rounded-full mr-2 animate-pulse"
              style={{ backgroundColor: getSkeletonColor() }}
            ></div>
            <div 
              className="h-4 w-24 rounded animate-pulse"
              style={{ backgroundColor: getSkeletonColor() }}
            ></div>
          </div>
          <div 
            className="h-7 w-12 rounded-md animate-pulse"
            style={{ backgroundColor: getSkeletonColor() }}
          ></div>
        </div>

        {/* 进度条骨架 */}
        <div className="my-1">
          <div 
            className="h-[6px] rounded-full animate-pulse"
            style={{ backgroundColor: getSkeletonColor() }}
          ></div>
        </div>

        {/* 数据统计骨架 */}
        <div className="flex justify-between items-center mt-3">
          <div 
            className="h-4 w-16 rounded animate-pulse"
            style={{ backgroundColor: getSkeletonColor() }}
          ></div>
          <div 
            className="h-4 w-16 rounded animate-pulse"
            style={{ backgroundColor: getSkeletonColor() }}
          ></div>
        </div>

        {/* 项目整体进度骨架 */}
        <div 
          className="mt-5 pt-3 border-t"
          style={{ borderColor: getCardBorder() }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div 
                className="w-5 h-5 rounded-full mr-2 animate-pulse"
                style={{ backgroundColor: getSkeletonColor() }}
              ></div>
              <div 
                className="h-3 w-20 rounded animate-pulse"
                style={{ backgroundColor: getSkeletonColor() }}
              ></div>
            </div>
            <div 
              className="h-4 w-10 rounded-md animate-pulse"
              style={{ backgroundColor: getSkeletonColor() }}
            ></div>
          </div>

          <div className="mt-1">
            <div 
              className="h-[5px] rounded-full animate-pulse"
              style={{ backgroundColor: getSkeletonColor() }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* 优先级分布卡片骨架屏 */}
      <div 
        className="backdrop-blur-md rounded-2xl p-5 border shadow-sm"
        style={{
          backgroundColor: getCardBackground(),
          borderColor: getCardBorder()
        }}
      >
        <div 
          className="h-5 w-20 rounded animate-pulse mb-3"
          style={{ backgroundColor: getSkeletonColor() }}
        ></div>

        {/* 骨架屏 - 三个优先级项 */}
        {[1, 2, 3].map((_, index) => (
          <div key={`priority-skeleton-${index}`} className={`mb-${index < 2 ? '3' : '0'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className="w-2.5 h-2.5 rounded-full mr-2 animate-pulse"
                  style={{ backgroundColor: getSkeletonColor() }}
                ></div>
                <div 
                  className="h-4 w-16 rounded animate-pulse"
                  style={{ backgroundColor: getSkeletonColor() }}
                ></div>
              </div>
              <div 
                className="h-4 w-8 rounded animate-pulse"
                style={{ backgroundColor: getSkeletonColor() }}
              ></div>
            </div>
            <div 
              className="h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: getSkeletonColor() }}
            ></div>
          </div>
        ))}
      </div>

      {/* 状态分布卡片骨架屏 */}
      <div 
        className="backdrop-blur-md rounded-2xl p-5 border shadow-sm"
        style={{
          backgroundColor: getCardBackground(),
          borderColor: getCardBorder()
        }}
      >
        <div 
          className="h-5 w-20 rounded animate-pulse mb-3"
          style={{ backgroundColor: getSkeletonColor() }}
        ></div>

        {/* 骨架屏 - 四个状态项 */}
        {[1, 2, 3, 4].map((_, index) => (
          <div key={`status-skeleton-${index}`} className={`mb-${index < 3 ? '3' : '0'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className="w-2.5 h-2.5 rounded-full mr-2 animate-pulse"
                  style={{ backgroundColor: getSkeletonColor() }}
                ></div>
                <div 
                  className="h-4 w-16 rounded animate-pulse"
                  style={{ backgroundColor: getSkeletonColor() }}
                ></div>
              </div>
              <div 
                className="h-4 w-8 rounded animate-pulse"
                style={{ backgroundColor: getSkeletonColor() }}
              ></div>
            </div>
            <div 
              className="h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: getSkeletonColor() }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatisticsSkeleton;
