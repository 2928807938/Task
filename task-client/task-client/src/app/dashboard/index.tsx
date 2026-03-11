'use client';

import React, {useState} from 'react';
import {FiCalendar, FiCheckCircle, FiClock, FiMessageSquare, FiRefreshCw} from 'react-icons/fi';
import MyTasksPanel from '@/ui/organisms/DashboardComponents/MyTasksPanel';
import { TodoTask } from '@/types/dashboard-types';
import UpcomingTasksPanel from '@/ui/organisms/DashboardComponents/UpcomingTasksPanel';
import TaskCalendarPanel from '@/ui/organisms/DashboardComponents/TaskCalendarPanel';
import { CollaborationTimeline } from '@/ui/organisms/CollaborationTimeline';
import RecentCommunications from '@/ui/organisms/RecentCommunications';
import RadialMenu from '@/ui/organisms/RadialMenu';
import {DashboardSkeleton} from '@/ui/atoms/Skeleton';
import { useWebSocket } from '@/contexts/WebSocketProvider';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { EmptyStateCard } from '@/ui/molecules/EmptyStateCard';
import ErrorBoundary, { ErrorMessage } from '@/ui/organisms/ErrorBoundary';
import StatsOverview from '@/ui/organisms/StatsOverview';
import CollapsibleSidebar from '@/ui/organisms/CollapsibleSidebar';
import BottomTabs from '@/ui/organisms/BottomTabs';
import MobileBottomNav from '@/ui/organisms/MobileBottomNav';
import LayoutSwitcher from '@/ui/organisms/LayoutSwitcher';
import { LayoutProvider, useLayout } from '@/contexts/LayoutContext';
// 导入已使用的组件
import Link from 'next/link';
import {motion, AnimatePresence} from 'framer-motion';
import SubTaskDetailModal from '@/ui/organisms/SubTaskDetailModal';

// Dashboard内容组件（使用布局上下文）
function DashboardContent() {
  const { mode, config } = useLayout();
  // 使用统一的WebSocket连接
  const { 
    isConnected, 
    connectionStatus,
    onlineCount,
    unreadActivityCount
  } = useWebSocket();

  // 使用Dashboard数据管理Hook
  const {
    tasks: todoTasks,
    activities,
    upcomingTasks,
    myTasks,
    hasData,
    isLoading,
    isRefreshing,
    error,
    refreshData
  } = useDashboardData({
    enableAutoRefresh: false, // 禁用自动刷新，只允许手动刷新
    staleTime: Infinity
  });

  // 任务详情弹窗状态
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // 移动端状态管理
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端设备
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 处理移动端快捷操作
  const handleMobileQuickAction = (action: string) => {
    console.log('Mobile quick action:', action);
    switch (action) {
      case 'create-task':
        // 打开新建任务弹窗
        break;
      case 'search':
        // 打开搜索面板
        break;
      case 'messages':
        // 打开消息面板
        break;
      case 'settings':
        // 打开设置面板
        break;
      default:
        break;
    }
  };

  // 处理点击任务
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailModalOpen(true);
  };

  // 关闭任务详情弹窗
  const handleCloseTaskDetail = () => {
    setIsTaskDetailModalOpen(false);
    // 延迟清空选中的任务ID，确保动画完成后再清空
    setTimeout(() => {
      setSelectedTaskId(null);
    }, 300);
  };

  // 检查是否有任务数据 - 现在使用hook提供的状态
  const hasNoData = !hasData;

  // 错误恢复处理
  const handleErrorRetry = async () => {
    try {
      await refreshData();
    } catch (retryError) {
      console.error('[Dashboard] Retry failed:', retryError);
    }
  };

  return (
    <ErrorBoundary 
      level="page" 
      onError={(error, errorInfo) => {
        console.error('[Dashboard] Error boundary caught error:', error, errorInfo);
        // 这里可以发送错误到监控服务
      }}
    >
      {/* 新的Flex布局结构 */}
      <div className="flex h-screen overflow-hidden">
        {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 移动端适配：添加底部安全区域 */}
          {isMobile && (
            <div 
              className="flex-shrink-0" 
              style={{ height: 'calc(5rem + env(safe-area-inset-bottom))' }}
            />
          )}
          {/* 添加环形导航菜单 */}
          <ErrorBoundary level="component">
            <RadialMenu />
          </ErrorBoundary>

          {/* 处理不同的状态 */}
          {error ? (
            /* 错误状态 */
            <div className="flex-1 flex items-center justify-center">
              <ErrorMessage 
                error={error} 
                onRetry={handleErrorRetry}
              />
            </div>
          ) : isLoading ? (
            <div className="flex-1">
              {/* 仪表盘页面只使用龙骨屏加载效果 */}
              <DashboardSkeleton animation="shimmer" />
            </div>
          ) : (
            /* 主要内容区域 */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 顶部内容区域 */}
              <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
                <div className={`max-w-[1440px] mx-auto ${config.spacing}`}>
                  {/* 页面标题和操作栏 */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
                        仪表盘
                      </h1>
                      <p className="text-sm mt-1" style={{ color: 'var(--theme-neutral-500)' }}>
                        任务和团队协作概览
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3">
                      {/* 连接状态指示器 - 移动端简化显示 */}
                      <div className="flex items-center space-x-1 md:space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'} ${isConnected ? '' : 'animate-pulse'}`} />
                        {!isMobile && (
                          <>
                            <span className="text-xs" style={{ color: 'var(--theme-neutral-500)' }}>
                              {isConnected ? '实时连接' : '离线模式'}
                            </span>
                            {onlineCount > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-neutral-600)' }}>
                                {onlineCount} 在线
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* 布局切换器 - 桌面端显示 */}
                      {!isMobile && (
                        <ErrorBoundary level="component">
                          <LayoutSwitcher 
                            showLabel={false}
                            onModeChange={(newMode) => {
                              console.log('Layout mode changed to:', newMode);
                            }}
                          />
                        </ErrorBoundary>
                      )}
                      
                      {/* 刷新按钮 */}
                      <button
                        onClick={() => refreshData()}
                        disabled={isRefreshing}
                        className="p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-80 disabled:opacity-50"
                        style={{ backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-neutral-600)' }}
                        title="刷新数据"
                      >
                        <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                      
                      {/* 日期显示 - 桌面端显示 */}
                      {!isMobile && (
                        <div className="px-3 py-1.5 rounded-full text-xs flex items-center shadow-sm" style={{ backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-neutral-600)' }}>
                          <FiCalendar className="h-3 w-3 mr-1.5" style={{ color: 'var(--theme-primary-500)' }} />
                          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 统计概览 */}
                  <ErrorBoundary level="component">
                    <StatsOverview 
                      tasks={todoTasks}
                      onlineCount={onlineCount}
                      isConnected={isConnected}
                    />
                  </ErrorBoundary>

                  {/* 任务面板区域 */}
                  {hasNoData ? (
                    /* 空状态显示 */
                    <div className={`flex ${isMobile ? `flex-col ${config.gap}` : `flex-col lg:flex-row ${config.gap}`}`}>
                      <div className="flex-1">
                        <EmptyStateCard
                          icon={FiClock}
                          title="暂无临期任务"
                          description="您目前没有即将到期的任务。"
                          className={isMobile ? "h-48" : "h-64"}
                        />
                      </div>
                      <div className="flex-1">
                        <EmptyStateCard
                          icon={FiCheckCircle}
                          title="暂无任务"
                          description="您的任务列表当前为空。"
                          className={isMobile ? "h-48" : "h-64"}
                        />
                      </div>
                    </div>
                  ) : (
                    /* 任务面板 */
                    <div className={`flex ${isMobile ? `flex-col ${config.gap}` : `flex-col lg:flex-row ${config.gap}`}`}>
                      {/* 临期任务面板 */}
                      <div className={isMobile ? "w-full" : "lg:w-2/5"}>
                        <ErrorBoundary level="component">
                          <UpcomingTasksPanel 
                            tasks={upcomingTasks} 
                            onTaskClick={handleTaskClick} 
                          />
                        </ErrorBoundary>
                      </div>

                      {/* 我的任务面板 */}
                      <div className={isMobile ? "w-full" : "lg:w-3/5"}>
                        <ErrorBoundary level="component">
                          <MyTasksPanel 
                            tasks={myTasks} 
                            onTaskClick={handleTaskClick} 
                          />
                        </ErrorBoundary>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 底部标签页区域 - 桌面端显示 */}
              {!isMobile && (
                <ErrorBoundary level="component">
                  <BottomTabs
                    onActivityClick={(activity) => {
                      if (activity.taskId) {
                        handleTaskClick(activity.taskId.toString());
                      }
                    }}
                    onCommunicationClick={(communication) => {
                      console.log('Communication clicked:', communication);
                    }}
                    defaultTab="activities"
                    collapsible={true}
                    defaultCollapsed={false}
                  />
                </ErrorBoundary>
              )}
            </div>
          )}
        </div>

        {/* 可折叠侧边栏 - 桌面端显示 */}
        {!isMobile && (
          <ErrorBoundary level="component">
            <CollapsibleSidebar
              tasks={todoTasks}
              defaultCollapsed={false}
              onQuickAction={(action) => {
                console.log('Quick action:', action);
                // 处理快捷操作
                switch (action) {
                  case 'create-task':
                    // 打开新建任务弹窗
                    break;
                  case 'search-tasks':
                    // 打开搜索面板
                    break;
                  default:
                    break;
                }
              }}
            />
          </ErrorBoundary>
        )}
      </div>

      {/* 移动端底部导航 */}
      {isMobile && (
        <ErrorBoundary level="component">
          <MobileBottomNav
            currentPath="/dashboard"
            onQuickAction={handleMobileQuickAction}
            unreadCount={unreadActivityCount}
          />
        </ErrorBoundary>
      )}

      {/* 任务详情弹窗 */}
      <AnimatePresence>
        {isTaskDetailModalOpen && selectedTaskId && (
          <ErrorBoundary level="component">
            <SubTaskDetailModal
              isOpen={isTaskDetailModalOpen}
              onClose={handleCloseTaskDetail}
              taskId={selectedTaskId}
              onTaskUpdated={() => {
                // 任务更新后刷新数据
                handleErrorRetry();
              }}
              projectMembers={[]}
              isSubTaskFocused={true}
              currentView="list"
              isDashboardSource={true}
            />
          </ErrorBoundary>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}

// 主Dashboard组件（包裹布局提供者）
export default function Dashboard() {
  return (
    <LayoutProvider defaultMode="comfortable">
      <DashboardContent />
    </LayoutProvider>
  );
}
