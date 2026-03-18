'use client';

import React, {useMemo, useState} from 'react';
import {
  FiActivity,
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import MyTasksPanel from '@/ui/organisms/DashboardComponents/MyTasksPanel';
import {CollaborationActivity} from '@/types/dashboard-types';
import UpcomingTasksPanel from '@/ui/organisms/DashboardComponents/UpcomingTasksPanel';
import TaskCalendarPanel from '@/ui/organisms/DashboardComponents/TaskCalendarPanel';
import RadialMenu from '@/ui/organisms/RadialMenu';
import {DashboardSkeleton} from '@/ui/atoms/Skeleton';
import {useWebSocket} from '@/contexts/WebSocketProvider';
import {useDashboardData} from '@/hooks/use-dashboard-data';
import {EmptyStateCard} from '@/ui/molecules/EmptyStateCard';
import ErrorBoundary, {ErrorMessage} from '@/ui/organisms/ErrorBoundary';
import StatsOverview from '@/ui/organisms/StatsOverview';
import MobileBottomNav from '@/ui/organisms/MobileBottomNav';
import LayoutSwitcher from '@/ui/organisms/LayoutSwitcher';
import {LayoutProvider, useLayout} from '@/contexts/LayoutContext';
import {AnimatePresence} from 'framer-motion';
import SubTaskDetailModal from '@/ui/organisms/SubTaskDetailModal';
import NavigationModeToggle from '@/ui/organisms/NavigationModeToggle';
import {useNavigationMode} from '@/hooks/use-navigation-mode';
import DesktopSidebarNav from '@/ui/organisms/DesktopSidebarNav';

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function formatActivityTime(value?: string) {
  if (!value) return '刚刚';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '刚刚';

  const diff = Date.now() - date.getTime();

  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))} 分钟前`;
  if (diff < 86_400_000) return `${Math.max(1, Math.floor(diff / 3_600_000))} 小时前`;

  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActivityStyle(type: string) {
  if (type.includes('COMMENT')) {
    return {
      icon: FiActivity,
      chip: '评论',
      iconBg: 'var(--theme-warning-100)',
      iconColor: 'var(--theme-warning-500)',
    };
  }

  if (type.includes('STATUS') || type.includes('UPDATED')) {
    return {
      icon: FiTrendingUp,
      chip: '变更',
      iconBg: 'var(--theme-info-100)',
      iconColor: 'var(--theme-info-500)',
    };
  }

  if (type.includes('ASSIGNED') || type.includes('JOINED')) {
    return {
      icon: FiUsers,
      chip: '协作',
      iconBg: 'rgba(139, 92, 246, 0.14)',
      iconColor: '#8B5CF6',
    };
  }

  return {
    icon: FiCheckCircle,
    chip: '任务',
    iconBg: 'var(--theme-success-100)',
    iconColor: 'var(--theme-success-500)',
  };
}

function ActivityFeedPanel({
  activities,
  onTaskClick,
}: {
  activities: CollaborationActivity[];
  onTaskClick: (taskId: string) => void;
}) {
  const visibleActivities = useMemo(() => activities.slice(0, 6), [activities]);

  return (
    <div className="dashboard-surface p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{color: 'var(--theme-neutral-400)'}}>团队动态</div>
          <h3 className="mt-2 text-xl font-semibold" style={{color: 'var(--foreground)'}}>近期协作更新</h3>
          <p className="mt-1 text-sm leading-6" style={{color: 'var(--theme-neutral-500)'}}>这里保留你当前接口返回的活动数据，只重新组织展示方式。</p>
        </div>
        <div className="rounded-full px-3 py-1.5 text-xs font-medium" style={{backgroundColor: 'var(--theme-primary-50)', color: 'var(--theme-primary-700)'}}>
          {visibleActivities.length} 条动态
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {visibleActivities.length > 0 ? visibleActivities.map((activity) => {
          const style = getActivityStyle(activity.type || '');
          const Icon = style.icon;

          return (
            <button
              key={activity.id}
              type="button"
              onClick={() => activity.taskId && onTaskClick(activity.taskId)}
              className="flex w-full items-start gap-3 rounded-[22px] border px-4 py-4 text-left transition hover:-translate-y-0.5"
              style={{borderColor: 'color-mix(in srgb, var(--theme-card-border) 72%, transparent)', backgroundColor: 'color-mix(in srgb, var(--theme-card-bg) 88%, transparent)'}}
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl" style={{backgroundColor: style.iconBg}}>
                <Icon className="h-5 w-5" style={{color: style.iconColor}} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold" style={{color: 'var(--foreground)'}}>{activity.userName || activity.username || '团队成员'}</span>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-neutral-600)'}}>{style.chip}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6" style={{color: 'var(--theme-neutral-500)'}}>{activity.content || activity.taskTitle || '有新的协作动态'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs" style={{color: 'var(--theme-neutral-400)'}}>
                  <span>{activity.projectName || '未归属项目'}</span>
                  <span>·</span>
                  <span>{formatActivityTime(activity.timestamp)}</span>
                </div>
              </div>
              <FiArrowUpRight className="mt-0.5 h-4 w-4 flex-shrink-0" style={{color: 'var(--theme-neutral-400)'}} />
            </button>
          );
        }) : (
          <div className="rounded-[22px] border border-dashed px-4 py-10 text-center" style={{borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)'}}>
            暂无最新协作动态
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardContent() {
  const {config} = useLayout();
  const {
    isConnected,
    onlineCount,
    unreadActivityCount,
  } = useWebSocket();
  const {
    tasks: todoTasks,
    activities,
    upcomingTasks,
    myTasks,
    hasData,
    isLoading,
    isRefreshing,
    error,
    refreshData,
  } = useDashboardData({
    enableAutoRefresh: false,
    staleTime: Infinity,
  });
  const {navigationMode, setNavigationMode, isDesktop, isSidebarDesktop} = useNavigationMode('radial');

  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isCalendarRailVisible, setIsCalendarRailVisible] = useState(true);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    try {
      const savedVisibility = localStorage.getItem('dashboard-calendar-rail-visible');
      if (savedVisibility !== null) {
        setIsCalendarRailVisible(savedVisibility === 'true');
      }
    } catch (error) {
      console.warn('Failed to load calendar rail visibility from localStorage:', error);
    }
  }, []);

  const dashboardHighlights = useMemo(() => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);

    return [
      {
        icon: FiZap,
        label: '临期推进',
        value: `${upcomingTasks.length} 项待关注`,
      },
      {
        icon: FiUsers,
        label: '协作状态',
        value: isConnected ? `${onlineCount} 人在线` : '当前离线模式',
      },
      {
        icon: FiCalendar,
        label: '近期排期',
        value: `${todoTasks.filter((task) => task.dueDate && new Date(task.dueDate) <= weekEnd).length} 项 7 天内到期`,
      },
    ];
  }, [isConnected, onlineCount, todoTasks, upcomingTasks.length]);

  const handleMobileQuickAction = (action: string) => {
    console.log('Mobile quick action:', action);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailModalOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailModalOpen(false);
    setTimeout(() => {
      setSelectedTaskId(null);
    }, 300);
  };

  const handleErrorRetry = async () => {
    try {
      await refreshData();
    } catch (retryError) {
      console.error('[Dashboard] Retry failed:', retryError);
    }
  };

  const toggleCalendarRail = () => {
    setIsCalendarRailVisible((previous) => {
      const next = !previous;

      try {
        localStorage.setItem('dashboard-calendar-rail-visible', String(next));
      } catch (error) {
        console.warn('Failed to save calendar rail visibility to localStorage:', error);
      }

      return next;
    });
  };

  const dashboardContainerClass = isSidebarDesktop
    ? 'mx-auto max-w-[1760px]'
    : 'mx-auto max-w-[1600px]';

  return (
    <ErrorBoundary
      level="page"
      onError={(pageError, errorInfo) => {
        console.error('[Dashboard] Error boundary caught error:', pageError, errorInfo);
      }}
    >
      <div className="dashboard-shell relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5" />
        <div className="pointer-events-none absolute left-[-80px] top-24 h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/20" />
        <div className="pointer-events-none absolute right-[-40px] top-14 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/20" />

        {isSidebarDesktop && <DesktopSidebarNav mode={navigationMode} onModeChange={setNavigationMode} />}

        <div className={`relative flex min-h-screen flex-col ${isSidebarDesktop ? 'lg:pl-[336px]' : ''}`}>
          {isMobile && (
            <div className="flex-shrink-0" style={{height: 'calc(5rem + env(safe-area-inset-bottom))'}} />
          )}

          {!isSidebarDesktop && (
            <ErrorBoundary level="component">
              <RadialMenu />
            </ErrorBoundary>
          )}

          {error ? (
            <div className="flex flex-1 items-center justify-center px-4 py-10">
              <ErrorMessage error={error} onRetry={handleErrorRetry} />
            </div>
          ) : isLoading ? (
            <div className="flex-1 px-4 py-6 md:px-6 lg:px-8">
              <div className={dashboardContainerClass}>
                <DashboardSkeleton animation="shimmer" />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 pb-10 pt-5 md:px-6 lg:px-8">
              <div className={`flex w-full flex-col gap-6 ${dashboardContainerClass}`}>
                <div className={`grid grid-cols-1 items-start gap-6 ${isCalendarRailVisible ? 'xl:grid-cols-[minmax(0,1fr)_360px]' : ''}`}>
                  <div className="min-w-0 space-y-6">
                    <section className="dashboard-surface px-5 py-5 md:px-7 md:py-7">
                      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                        <div className="max-w-3xl">
                          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]" style={{backgroundColor: 'rgba(var(--theme-primary-500-rgb), 0.1)', color: 'var(--theme-primary-700)'}}>
                            {getGreeting()}
                          </div>
                          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl" style={{color: 'var(--foreground)'}}>
                            仪表盘
                          </h1>
                          <p className="mt-3 max-w-2xl text-sm leading-7 md:text-base" style={{color: 'var(--theme-neutral-500)'}}>
                            在这里快速查看任务进度、协作状态和近期安排，把今天最重要的信息集中呈现。
                          </p>

                          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {dashboardHighlights.map((item) => {
                              const Icon = item.icon;

                              return (
                                <div
                                  key={item.label}
                                  className="rounded-[22px] border px-4 py-4"
                                  style={{borderColor: 'color-mix(in srgb, var(--theme-card-border) 75%, transparent)', backgroundColor: 'color-mix(in srgb, var(--theme-card-bg) 88%, transparent)'}}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{backgroundColor: 'rgba(var(--theme-primary-500-rgb), 0.12)'}}>
                                      <Icon className="h-4 w-4" style={{color: 'var(--theme-primary-600)'}} />
                                    </div>
                                    <div>
                                      <div className="text-xs font-medium" style={{color: 'var(--theme-neutral-400)'}}>{item.label}</div>
                                      <div className="mt-1 text-sm font-semibold" style={{color: 'var(--foreground)'}}>{item.value}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[360px]">
                          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                            <div className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium" style={{backgroundColor: isConnected ? 'var(--theme-success-50)' : 'var(--theme-neutral-100)', color: isConnected ? 'var(--theme-success-700)' : 'var(--theme-neutral-600)'}}>
                              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'} ${isConnected ? '' : 'animate-pulse'}`} />
                              {isConnected ? '实时连接正常' : '当前离线模式'}
                            </div>

                            {!isMobile && isDesktop && (
                              <NavigationModeToggle mode={navigationMode} onChange={setNavigationMode} />
                            )}

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

                            <button
                              onClick={toggleCalendarRail}
                              className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition xl:inline-flex"
                              style={{backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-neutral-600)', border: '1px solid color-mix(in srgb, var(--theme-card-border) 80%, transparent)'}}
                              title={isCalendarRailVisible ? '隐藏右侧日历' : '显示右侧日历'}
                            >
                              <FiCalendar className="h-4 w-4" />
                              {isCalendarRailVisible ? '隐藏日历' : '显示日历'}
                            </button>

                            <button
                              onClick={() => refreshData()}
                              disabled={isRefreshing}
                              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                              style={{backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-neutral-600)', border: '1px solid color-mix(in srgb, var(--theme-card-border) 80%, transparent)'}}
                              title="刷新数据"
                            >
                              <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                              刷新
                            </button>
                          </div>

                          <div className="dashboard-surface px-5 py-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{color: 'var(--theme-neutral-400)'}}>今日日期</div>
                                <div className="mt-2 text-lg font-semibold" style={{color: 'var(--foreground)'}}>
                                  {new Date().toLocaleDateString('zh-CN', {year: 'numeric', month: 'long', day: 'numeric'})}
                                </div>
                              </div>
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{backgroundColor: 'rgba(var(--theme-info-500-rgb), 0.12)'}}>
                                <FiCalendar className="h-5 w-5" style={{color: 'var(--theme-info-500)'}} />
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between rounded-[18px] px-3 py-3" style={{backgroundColor: 'color-mix(in srgb, var(--theme-card-bg) 88%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-card-border) 74%, transparent)'}}>
                              <div>
                                <div className="text-xs" style={{color: 'var(--theme-neutral-400)'}}>未读活动</div>
                                <div className="mt-1 text-base font-semibold" style={{color: 'var(--foreground)'}}>{unreadActivityCount}</div>
                              </div>
                              <div>
                                <div className="text-xs" style={{color: 'var(--theme-neutral-400)'}}>布局密度</div>
                                <div className="mt-1 text-base font-semibold capitalize" style={{color: 'var(--foreground)'}}>{config.gap.replace('gap-', '')}</div>
                              </div>
                              <div>
                                <div className="text-xs" style={{color: 'var(--theme-neutral-400)'}}>导航模式</div>
                                <div className="mt-1 text-base font-semibold" style={{color: 'var(--foreground)'}}>{navigationMode === 'radial' ? '环形' : '侧边'}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="dashboard-surface p-5 md:p-6">
                      <ErrorBoundary level="component">
                        <StatsOverview tasks={todoTasks} onlineCount={onlineCount} isConnected={isConnected} />
                      </ErrorBoundary>
                    </section>

                    {hasData ? (
                      <>
                        <div className={`grid grid-cols-1 ${config.gap} xl:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.08fr)]`}>
                          <ErrorBoundary level="component">
                            <UpcomingTasksPanel tasks={upcomingTasks} onTaskClick={handleTaskClick} />
                          </ErrorBoundary>

                          <ErrorBoundary level="component">
                            <MyTasksPanel tasks={myTasks} onTaskClick={handleTaskClick} />
                          </ErrorBoundary>
                        </div>

                        <ErrorBoundary level="component">
                          <ActivityFeedPanel activities={activities} onTaskClick={handleTaskClick} />
                        </ErrorBoundary>
                      </>
                    ) : (
                      <>
                        <div className={`grid grid-cols-1 ${config.gap} xl:grid-cols-3`}>
                          <EmptyStateCard icon={FiClock} title="暂无临期任务" description="即将到期的任务会在这里出现。" className="dashboard-surface h-56 border-0 shadow-none" />
                          <EmptyStateCard icon={FiTarget} title="暂无任务数据" description="当前接口返回为空时，这里会展示更优雅的空状态。" className="dashboard-surface h-56 border-0 shadow-none" />
                          <EmptyStateCard icon={FiUsers} title="等待协作动态" description="团队更新将在有数据后自动呈现。" className="dashboard-surface h-56 border-0 shadow-none" />
                        </div>
                      </>
                    )}
                  </div>

                  {isCalendarRailVisible && (
                    <aside className="hidden xl:block xl:self-start">
                      <div className="sticky top-5 space-y-4">
                        <div className="surface-card p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 text-sm font-semibold" style={{color: 'var(--foreground)'}}>
                                <FiCalendar className="h-4 w-4" style={{color: 'var(--theme-primary-500)'}} />
                                任务日历
                              </div>
                              <p className="mt-1 text-xs leading-5" style={{color: 'var(--theme-neutral-500)'}}>
                                固定在右侧，随时查看日期上的任务安排。
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={toggleCalendarRail}
                              className="rounded-full px-3 py-1.5 text-xs font-medium transition"
                              style={{
                                backgroundColor: 'color-mix(in srgb, var(--theme-card-bg) 88%, transparent)',
                                color: 'var(--theme-neutral-600)',
                                border: '1px solid color-mix(in srgb, var(--theme-card-border) 78%, transparent)',
                              }}
                            >
                              隐藏
                            </button>
                          </div>
                        </div>

                        <ErrorBoundary level="component">
                          <TaskCalendarPanel tasks={todoTasks} className="min-h-[calc(100vh-10rem)]" />
                        </ErrorBoundary>
                      </div>
                    </aside>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <ErrorBoundary level="component">
          <MobileBottomNav currentPath="/dashboard" onQuickAction={handleMobileQuickAction} unreadCount={unreadActivityCount} />
        </ErrorBoundary>
      )}

      <AnimatePresence>
        {isTaskDetailModalOpen && selectedTaskId && (
          <ErrorBoundary level="component">
            <SubTaskDetailModal
              isOpen={isTaskDetailModalOpen}
              onClose={handleCloseTaskDetail}
              taskId={selectedTaskId}
              onTaskUpdated={() => {
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

export default function Dashboard() {
  return (
    <LayoutProvider defaultMode="comfortable">
      <DashboardContent />
    </LayoutProvider>
  );
}
