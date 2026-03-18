'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import type { Transition } from 'framer-motion';
import {FiAlertCircle, FiArrowLeft, FiMoreHorizontal, FiX} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
import {useTheme} from '@/ui/theme';
import useTaskHook from '@/hooks/use-task-hook';

// 导入子组件
import SubTaskDetailHeader from './components/SubTaskDetailHeader';
import SubTaskDetailContent from './components/SubTaskDetailContent';
import DashboardTaskDetailContent from './components/DashboardTaskDetailContent';
import SubTaskDetailActions from './components/SubTaskDetailActions';
import ParentTaskInfo from './components/ParentTaskInfo';

interface SubTaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  projectId?: string;
  onTaskUpdated?: (updatedTask: ProjectTask) => void;
  projectMembers?: Array<{ id: string; name: string; avatar?: string }>;
  /** 是否为子任务优先视图 */
  isSubTaskFocused?: boolean;
  /** 当前视图类型 */
  currentView?: 'list' | 'board' | 'calendar' | 'gantt';
  /** 是否来源于 dashboard */
  isDashboardSource?: boolean;
}

/**
 * 子任务详情模态框 - 严格遵循苹果设计规范
 * 
 * 设计特点：
 * - 毛玻璃背景效果
 * - 流畅的弹性动画
 * - 清晰的信息层级
 * - 触觉反馈和手势支持
 * - 可访问性支持
 */
const SubTaskDetailModal: React.FC<SubTaskDetailModalProps> = ({
  isOpen,
  onClose,
  taskId,
  projectId = '',
  onTaskUpdated,
  projectMembers = [],
  isSubTaskFocused = false,
  currentView = 'list',
  isDashboardSource = false
}) => {
  const { isDark } = useTheme();
  const { useGetTaskWithSubtasks } = useTaskHook();
  
  // 状态管理
  const [isEditing, setIsEditing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // 引用
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  
  // 获取任务详情数据
  const {
    data: taskData,
    isLoading,
    error,
    refetch
  } = useGetTaskWithSubtasks(taskId, {
    enabled: isOpen && !!taskId,
    staleTime: 30000
  });

  // 确定是否为子任务
  const isSubTask = taskData?.mainTask && !!(taskData.mainTask.parentTaskId || taskData.mainTask.parentId);
  
  // 重置状态
  const resetState = useCallback(() => {
    setIsEditing(false);
    setDragOffset(0);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  // 处理背景滚动和键盘事件
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (isEditing) {
            setIsEditing(false);
          } else {
            onClose();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isEditing, onClose]);

  // 拖拽手势处理 - 苹果风格的下拉关闭
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isEditing) return;
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, [isEditing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || isEditing) return;
    
    const deltaY = e.touches[0].clientY - dragStartY.current;
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  }, [isDragging, isEditing]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || isEditing) return;
    
    setIsDragging(false);
    
    // 如果拖拽距离超过阈值，关闭模态框
    if (dragOffset > 100) {
      onClose();
    } else {
      setDragOffset(0);
    }
  }, [isDragging, dragOffset, onClose, isEditing]);

  // 处理任务更新
  const handleTaskUpdate = useCallback((updatedTask: ProjectTask) => {
    onTaskUpdated?.(updatedTask);
    refetch(); // 重新获取最新数据
  }, [onTaskUpdated, refetch]);

  // 背景点击关闭
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isEditing) {
      onClose();
    }
  }, [onClose, isEditing]);

  // 动画配置 - 苹果风格的弹性动画
  const backdropAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' as Transition['ease'] }
  };

  const modalAnimation = {
    initial: { 
      y: '100%',
      opacity: 0,
      scale: 0.95
    },
    animate: { 
      y: dragOffset,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: { 
      y: '100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.25,
        ease: 'easeIn' as Transition['ease']
      }
    }
  };

  // 错误状态渲染
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-96 text-center p-8">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
        <FiAlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        加载失败
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
        {error instanceof Error ? error.message : '获取任务详情时发生错误'}
      </p>
      <button
        onClick={() => refetch()}
        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
      >
        重新加载
      </button>
    </div>
  );

  // 加载状态渲染 - 苹果风格骨架屏
  const renderLoadingState = () => (
    <div className="p-6 animate-pulse">
      {/* 头部骨架 */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
        </div>
      </div>
      
      {/* 内容骨架 */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
      
      {/* 按钮骨架 */}
      <div className="flex justify-end space-x-3 mt-8">
        <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          {...backdropAnimation}
          onClick={handleBackdropClick}
        >
          {/* 毛玻璃背景 */}
          <div 
            className="absolute inset-0 bg-slate-950/28 dark:bg-black/55"
            style={{
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)'
            }}
          />
          
          {/* 模态框内容 */}
          <motion.div
            ref={modalRef}
            className={`
              relative mx-auto flex w-full max-w-[920px] flex-col overflow-hidden
              rounded-t-[28px] border shadow-[0_28px_80px_rgba(15,23,42,0.24)]
              sm:max-h-[92vh] sm:rounded-[32px]
              ${isDark
                ? 'border-slate-700/40 bg-slate-950/92'
                : 'border-white/60 bg-white/88'}
            `}
            style={{
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              transform: `translateY(${dragOffset}px)`,
              opacity: Math.max(0.5, 1 - dragOffset / 400)
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            {...modalAnimation}
          >
            {/* 拖拽指示器 - 仅在移动端显示 */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* 顶部操作栏 */}
            <div className={`
              flex items-center justify-between border-b px-6 py-4
              ${isDark
                ? 'border-slate-800/80 bg-slate-950/70'
                : 'border-card-border/70 bg-white/78'}
            `}
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            }}>
              {/* 左侧：标题信息 */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isSubTaskFocused && isSubTask ? '子任务详情' : '任务详情'}
                </h2>
                {currentView !== 'list' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentView === 'board' && '看板视图'}
                    {currentView === 'calendar' && '日历视图'}
                    {currentView === 'gantt' && '甘特图视图'}
                  </p>
                )}
              </div>

              {/* 右侧：操作按钮 */}
              <div className="flex items-center space-x-3">
                {/* 编辑按钮 - 苹果风格，使用文字 */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isLoading}
                  className={`
                    rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200
                    ${isLoading
                      ? 'cursor-not-allowed text-gray-400 opacity-50'
                      : isEditing
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700'
                        : 'border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:border-primary-800/70 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/40'
                    }
                  `}
                  aria-label={isEditing ? "完成编辑" : "编辑任务"}
                >
                  {isEditing ? '完成' : '编辑'}
                </button>
                
                {/* 关闭按钮 - 苹果风格，位于最右侧 */}
                <button
                  onClick={onClose}
                  className={`
                    group rounded-full p-2.5 transition-all duration-200
                    ${isDark
                      ? 'text-gray-400 hover:bg-slate-800 hover:text-white'
                      : 'text-gray-500 hover:bg-neutral-100 hover:text-neutral-800'}
                  `}
                  aria-label="关闭"
                >
                  <FiX className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div 
              ref={contentRef}
              className="flex-1 overflow-y-auto overscroll-contain bg-neutral-50/70 dark:bg-slate-950/70"
              style={{ maxHeight: 'calc(90vh - 140px)' }}
            >
              {isLoading && renderLoadingState()}
              {error && renderErrorState()}
              
              {taskData && !isLoading && !error && (
                <div className="space-y-5 p-5 sm:p-6">
                  {/* 父任务信息 - 仅在子任务优先视图且为子任务时显示 */}
                  {isSubTaskFocused && isSubTask && (
                    <ParentTaskInfo 
                      parentTaskId={(taskData.mainTask.parentTaskId || taskData.mainTask.parentId)!}
                      projectId={projectId}
                    />
                  )}

                  {/* 任务头部信息 */}
                  <SubTaskDetailHeader 
                    task={taskData.mainTask}
                    isSubTask={!!isSubTask}
                    isSubTaskFocused={isSubTaskFocused}
                  />

                  {/* 任务详细内容 - 根据编辑状态选择界面 */}
                  {isEditing || isDashboardSource ? (
                    <DashboardTaskDetailContent 
                      task={taskData.mainTask}
                      onTaskUpdate={handleTaskUpdate}
                      projectId={projectId}
                      isEditing={isEditing}
                      projectMembers={projectMembers}
                    />
                  ) : (
                    <SubTaskDetailContent 
                      task={taskData.mainTask}
                    />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubTaskDetailModal;
