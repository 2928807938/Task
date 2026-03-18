import React from 'react';
import {motion} from 'framer-motion';
import {FiFileText, FiLayers, FiMessageCircle} from 'react-icons/fi';

interface TaskDetailTabsProps {
  activeTab: 'details' | 'subtasks' | 'comments';
  onTabChange: (tab: 'details' | 'subtasks' | 'comments') => void;
  subtasksCount?: number;
  commentsCount?: number;
}

const tabs = [
  { key: 'details' as const, label: '详情', icon: FiFileText },
  { key: 'subtasks' as const, label: '子任务', icon: FiLayers },
  { key: 'comments' as const, label: '讨论', icon: FiMessageCircle }
];

const TaskDetailTabs: React.FC<TaskDetailTabsProps> = ({
  activeTab,
  onTabChange,
  subtasksCount = 0,
  commentsCount = 0
}) => {
  const counts = {
    details: 0,
    subtasks: subtasksCount,
    comments: commentsCount
  };

  return (
    <div className="border-b border-card-border/70 bg-white/70 px-5 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/60 sm:px-6">
      <div className="app-segmented">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          const count = counts[key];

          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`app-segmented-item relative ${isActive ? 'app-segmented-item-active' : ''}`}
              type="button"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                <Icon className="text-[13px]" />
                {label}
                {count > 0 ? (
                  <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    isActive
                      ? 'bg-white/70 text-primary-700 dark:bg-slate-900/60 dark:text-primary-200'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-slate-800 dark:text-neutral-400'
                  }`}>
                    {count}
                  </span>
                ) : null}
              </span>
              {isActive ? (
                <motion.span
                  layoutId="task-detail-tab"
                  className="absolute inset-0 rounded-full"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TaskDetailTabs;
