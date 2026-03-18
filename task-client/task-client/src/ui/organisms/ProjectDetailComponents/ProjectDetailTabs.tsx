import React from 'react';
import {motion} from 'framer-motion';
import {useTheme} from '@/ui/theme';
import {FiCheckSquare, FiHome, FiUsers} from 'react-icons/fi';

export type TabType = 'overview' | 'tasks' | 'taskTree' | 'team' | 'files' | 'calendar';

interface ProjectDetailTabsProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
  isCompact?: boolean;
}

const ProjectDetailTabs: React.FC<ProjectDetailTabsProps> = ({
  selectedTab,
  onTabChange,
  isCompact = false
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'overview', label: '概览', icon: <FiHome size={16} />, description: '项目全局信息' },
    { id: 'tasks', label: '任务', icon: <FiCheckSquare size={16} />, description: '查看和管理任务' },
    { id: 'team', label: '团队', icon: <FiUsers size={16} />, description: '成员与协作角色' }
  ];

  return (
    <div className={`${isCompact ? '' : 'pt-1'}`}>
      <div
        className={`no-scrollbar flex w-full gap-2 overflow-x-auto rounded-2xl p-1.5 ${
          isDarkMode ? 'bg-white/[0.04]' : 'bg-slate-100/90'
        }`}
        aria-label="项目导航"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              className={`relative flex min-w-fit flex-1 items-center gap-2 rounded-[14px] px-3 py-2.5 text-left transition-all sm:px-4 ${
                isActive
                  ? isDarkMode
                    ? 'bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.28)]'
                    : 'bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)]'
                  : isDarkMode
                    ? 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  isActive
                    ? isDarkMode
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'bg-white/[0.05] text-slate-400'
                      : 'bg-slate-200/80 text-slate-500'
                }`}
              >
                {tab.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{tab.label}</span>
                {!isCompact && (
                  <span className={`hidden truncate text-xs sm:block ${isActive ? (isDarkMode ? 'text-slate-300' : 'text-slate-500') : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                    {tab.description}
                  </span>
                )}
              </span>

              {isActive && (
                <motion.span
                  layoutId="project-detail-tab-indicator"
                  className="absolute inset-0 rounded-[14px] ring-1 ring-inset ring-blue-500/10"
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProjectDetailTabs;
