'use client';

import React, {useMemo, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {
  FiActivity,
  FiArrowUpRight,
  FiBarChart2,
  FiBell,
  FiClipboard,
  FiHome,
  FiLayers,
  FiLogOut,
  FiMoon,
  FiSearch,
  FiSettings,
  FiSun,
  FiUsers,
} from 'react-icons/fi';

import {useCurrentUser, useLogout} from '@/hooks/use-user-hook';
import {NavigationMode} from '@/hooks/use-navigation-mode';
import ComingSoonModal from '@/ui/molecules/ComingSoonModal';
import {useToast} from '@/ui/molecules/Toast';
import {useTheme} from '@/ui/theme';

interface DesktopSidebarNavProps {
  mode: NavigationMode;
  onModeChange: (mode: NavigationMode) => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  description?: string;
  tag?: string;
}

interface SidebarSummaryItem {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
}

const DesktopSidebarNav: React.FC<DesktopSidebarNavProps> = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {isDark, toggleTheme, isSystemTheme} = useTheme();
  const {addToast} = useToast();
  const {mutate: logout, isPending: isLoggingOut} = useLogout();
  const {data: currentUserResponse} = useCurrentUser({enabled: true});

  const currentUser = useMemo(() => {
    if (currentUserResponse?.success && currentUserResponse.data) {
      return {
        name: currentUserResponse.data.username || '访客',
        email: currentUserResponse.data.email || '',
      };
    }

    return {name: '访客', email: ''};
  }, [currentUserResponse]);

  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<{title: string; description: string; icon: React.ReactNode}>({
    title: '',
    description: '',
    icon: null,
  });

  const handleComingSoonFeature = (title: string, icon: React.ReactNode, description: string) => {
    setComingSoonFeature({title, icon, description});
    setShowComingSoonModal(true);
  };

  const mainItems: SidebarItem[] = [
    {id: 'dashboard', label: '工作台', icon: FiHome, href: '/dashboard', description: '总览与优先事项', tag: '首页'},
    {id: 'projects', label: '项目列表', icon: FiLayers, href: '/projects', description: '查看全部项目状态'},
    {
      id: 'team',
      label: '团队管理',
      icon: FiUsers,
      onClick: () => handleComingSoonFeature('团队管理', <FiUsers size={42} className="text-purple-500" />, '团队管理功能正在开发中，未来您将能够管理团队成员、分配权限和查看团队动态。'),
      description: '成员、角色与协作'
    },
    {
      id: 'tasks',
      label: '任务管理',
      icon: FiClipboard,
      onClick: () => handleComingSoonFeature('任务管理', <FiClipboard size={42} className="text-amber-500" />, '任务管理功能正在完善中，未来您将能够创建任务、跟踪进度并与团队协作。'),
      description: '任务池与进度推进'
    },
    {
      id: 'analytics',
      label: '统计分析',
      icon: FiBarChart2,
      onClick: () => handleComingSoonFeature('统计分析', <FiBarChart2 size={42} className="text-cyan-500" />, '统计分析功能即将上线，它将为您提供丰富的数据可视化和项目绩效分析工具。'),
      description: '趋势、风险与复盘'
    },
    {
      id: 'settings',
      label: '系统设置',
      icon: FiSettings,
      onClick: () => handleComingSoonFeature('系统设置', <FiSettings size={42} className="text-rose-500" />, '系统设置功能正在构建中，您将能够自定义界面、管理账户和配置全局偏好设置。'),
      description: '偏好与工作流配置'
    },
  ];

  const utilityItems: SidebarItem[] = [
    {id: 'search', label: '搜索任务', icon: FiSearch, onClick: () => router.push('/tasks'), description: '快速定位任务'},
    {
      id: 'notification',
      label: '通知中心',
      icon: FiBell,
      onClick: () => handleComingSoonFeature('通知中心', <FiBell size={42} className="text-orange-500" />, '通知中心功能即将上线，它将帮助您及时了解项目动态、任务更新和系统公告。'),
      description: '查看提醒与动态'
    },
    {
      id: 'theme',
      label: `${isDark ? '切换亮色' : '切换暗色'}${isSystemTheme ? ' · 跟随系统' : ''}`,
      icon: isDark ? FiSun : FiMoon,
      onClick: toggleTheme,
      description: '调整当前界面观感',
    },
    {
      id: 'logout',
      label: isLoggingOut ? '退出中...' : '退出登录',
      icon: FiLogOut,
      onClick: () => logout(undefined, {
        onSuccess: () => {
          addToast('已退出登录', 'success', 2200);
          router.push('/login');
        },
        onError: () => addToast('退出登录失败，请稍后重试', 'error', 3200),
      }),
      description: '结束当前登录会话',
    },
  ];

  const activeMainItem = mainItems.find((item) => item.href && (pathname === item.href || pathname?.startsWith(`${item.href}/`)));

  const summaryItems: SidebarSummaryItem[] = [
    {
      id: 'page',
      label: '当前页面',
      value: activeMainItem?.label || '工作台',
      icon: FiActivity,
    },
    {
      id: 'theme',
      label: '主题模式',
      value: isSystemTheme ? `${isDark ? '暗色' : '亮色'} · 系统` : isDark ? '暗色' : '亮色',
      icon: isDark ? FiMoon : FiSun,
    },
  ];

  const userInitial = useMemo(() => {
    const normalizedName = currentUser.name?.trim();

    if (!normalizedName) {
      return 'TC';
    }

    return normalizedName.slice(0, 2).toUpperCase();
  }, [currentUser.name]);

  const handleItemClick = (item: SidebarItem) => {
    if (item.href) {
      router.push(item.href);
      return;
    }

    item.onClick?.();
  };

  const renderSectionHeader = (label: string, count?: number) => (
    <div className="mb-3 flex items-center justify-between px-1">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </div>
      {typeof count === 'number' && (
        <div className="rounded-full border border-slate-200/80 bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          {count}
        </div>
      )}
    </div>
  );

  const renderItem = (item: SidebarItem, variant: 'main' | 'utility' = 'main') => {
    const Icon = item.icon;
    const active = Boolean(item.href && (pathname === item.href || pathname?.startsWith(`${item.href}/`)));
    const isMain = variant === 'main';

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleItemClick(item)}
        className={[
          'group relative flex w-full items-center gap-3 overflow-hidden rounded-[26px] border text-left transition-all duration-300',
          isMain ? 'px-3.5 py-3.5' : 'px-3 py-3',
          active
            ? 'border-indigo-200/90 bg-gradient-to-r from-indigo-500/[0.14] via-sky-500/[0.07] to-transparent text-slate-900 shadow-[0_18px_40px_rgba(79,70,229,0.12)] dark:border-indigo-900/80 dark:from-indigo-500/20 dark:via-sky-500/10 dark:text-white'
            : 'border-transparent bg-white/55 text-slate-700 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white/88 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)] dark:bg-slate-950/20 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900/50',
        ].join(' ')}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_32%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span
          className={[
            'relative flex items-center justify-center rounded-2xl border transition-all duration-300',
            isMain ? 'h-12 w-12' : 'h-11 w-11',
            active
              ? 'border-white/80 bg-white text-indigo-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-indigo-300'
              : 'border-white/80 bg-slate-100/90 text-slate-500 group-hover:bg-slate-900 group-hover:text-white dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:group-hover:bg-slate-800',
          ].join(' ')}
        >
          <Icon className={isMain ? 'h-[18px] w-[18px]' : 'h-[17px] w-[17px]'} />
        </span>

        <span className="relative min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{item.label}</span>
            {item.tag && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:bg-slate-900/80 dark:text-indigo-300">
                {item.tag}
              </span>
            )}
          </span>
          {item.description && (
            <span className="mt-1 block truncate text-xs leading-5 text-slate-500 dark:text-slate-400">
              {item.description}
            </span>
          )}
        </span>

        <span
          className={[
            'relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
            active
              ? 'bg-white/85 text-indigo-600 dark:bg-slate-900/90 dark:text-indigo-300'
              : 'text-slate-300 opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-slate-600',
          ].join(' ')}
        >
          <FiArrowUpRight className="h-4 w-4" />
        </span>
      </button>
    );
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[320px] overflow-hidden px-4 py-4 lg:flex lg:flex-col">
        <div className="dashboard-surface hide-scrollbar flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden p-4">
        <div className="surface-card-strong p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)]">
                TC
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">Task Client</div>
                <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">任务、项目与协作入口一处直达</div>
              </div>
            </div>

            <div className="flex-shrink-0 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-500/10 dark:text-emerald-300">
              桌面端
            </div>
          </div>

          <div className="mt-4 h-px bg-gradient-to-r from-slate-200/90 via-slate-200/60 to-transparent dark:from-slate-700/80 dark:via-slate-700/40" />

          <div className="mt-4 grid grid-cols-2 gap-2">
            {summaryItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-[16px] border border-white/70 bg-white/76 px-2.5 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10px] font-medium leading-4 text-slate-400 dark:text-slate-500">{item.label}</div>
                    <div className="mt-0.5 truncate text-[13px] font-semibold leading-4 text-slate-700 dark:text-slate-200">{item.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          {renderSectionHeader('主导航', mainItems.length)}
          <div className="space-y-2">{mainItems.map((item) => renderItem(item, 'main'))}</div>
        </div>

        <div className="mt-auto space-y-4 pt-5">
          <div>
            {renderSectionHeader('快捷操作')}
            <div className="space-y-2">{utilityItems.map((item) => renderItem(item, 'utility'))}</div>
          </div>

          <div className="surface-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-slate-900 to-slate-600 text-sm font-semibold text-white dark:from-slate-100 dark:to-slate-400 dark:text-slate-900">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{currentUser.name}</div>
                <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {currentUser.email || '当前账号未设置邮箱'}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </aside>

      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        title={comingSoonFeature.title}
        description={comingSoonFeature.description}
        icon={comingSoonFeature.icon}
      />
    </>
  );
};

export default DesktopSidebarNav;
