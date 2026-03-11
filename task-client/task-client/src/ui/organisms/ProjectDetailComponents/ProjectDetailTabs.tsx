import React from 'react';
import {motion} from 'framer-motion';
import {useTheme} from '@/ui/theme';
import {FiCheckSquare, FiHome, FiUsers} from 'react-icons/fi';

export type TabType = 'overview' | 'tasks' | 'taskTree' | 'team' | 'files' | 'calendar';

interface ProjectDetailTabsProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
  isCompact?: boolean; // 是否使用简洁模式
}

const ProjectDetailTabs: React.FC<ProjectDetailTabsProps> = ({
  selectedTab,
  onTabChange,
  isCompact = false // 默认为非简洁模式
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;

  // 核心标签与图标
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '概览', icon: <FiHome size={16} /> },
    { id: 'tasks', label: '任务', icon: <FiCheckSquare size={16} /> },
    { id: 'team', label: '团队', icon: <FiUsers size={16} /> }
    // 临时隐藏文件标签页
    // { id: 'files', label: '文件', icon: <FiFolder size={16} /> }
  ];

  // 标签下划线动画
  const tabUnderlineVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className={`w-full ${!isCompact ? 'border-b' : ''} ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200/60 bg-white'}`}>
      <div className={`w-full ${!isCompact ? 'px-4 lg:px-6' : 'px-0'}`}>
        <nav
          className="flex overflow-x-auto no-scrollbar"
          aria-label="项目导航"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center ${isCompact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'} px-3 sm:px-4 whitespace-nowrap font-medium 
                  transition-all relative rounded-md mx-0.5 ${isCompact ? 'my-0' : 'my-0.5'}
                  ${isActive 
                    ? isDarkMode 
                      ? 'text-white bg-gray-800/50' 
                      : 'text-gray-900 bg-gray-100/80'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                  }
                `}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
              >
                <span className="flex items-center flex-row flex-nowrap min-w-0">
                  <span className={`flex-shrink-0 ${isCompact ? 'mr-1' : 'mr-1.5'} ${isActive ? (isDarkMode ? 'text-blue-400' : 'text-blue-500') : ''}`}>
                    {tab.icon && <span className={isCompact ? 'scale-90' : ''}>{tab.icon}</span>}
                  </span>
                  <span className="truncate">{tab.label}</span>
                </span>

                {/* 活动标签指示器 */}
                {isActive && (
                  <motion.span
                    className={`absolute bottom-0 left-0 w-full ${isCompact ? 'h-[2px]' : 'h-0.5'} ${isDarkMode ? 'bg-blue-500' : 'bg-blue-500'}`}
                    initial="hidden"
                    animate="visible"
                    variants={tabUnderlineVariants}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* 添加全局样式，隐藏滚动条但保持功能 */}
      <style jsx global>{`
        /* 隐藏滚动条但保持可滚动功能 */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
};

export default ProjectDetailTabs;

