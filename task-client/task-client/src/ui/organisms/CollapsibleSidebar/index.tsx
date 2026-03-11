'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiSettings,
  FiFilter,
  FiSearch,
  FiPlus,
  FiBookmark,
  FiClock
} from 'react-icons/fi';
import TaskCalendarPanel from '@/ui/organisms/DashboardComponents/TaskCalendarPanel';
import { TodoTask } from '@/types/dashboard-types';

interface CollapsibleSidebarProps {
  tasks: TodoTask[];
  className?: string;
  defaultCollapsed?: boolean;
  onQuickAction?: (action: string) => void;
}

type SidebarTab = 'calendar' | 'shortcuts' | 'filters';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  action: string;
}

/**
 * 可折叠侧边栏组件
 * 包含日历、快捷操作和筛选功能
 */
export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  tasks,
  className = '',
  defaultCollapsed = false,
  onQuickAction
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [activeTab, setActiveTab] = useState<SidebarTab>('calendar');

  // 快捷操作定义
  const quickActions: QuickAction[] = [
    {
      id: 'new-task',
      label: '新建任务',
      icon: FiPlus,
      color: 'var(--theme-primary-500)',
      action: 'create-task'
    },
    {
      id: 'search',
      label: '搜索任务',
      icon: FiSearch,
      color: 'var(--theme-info-500)',
      action: 'search-tasks'
    },
    {
      id: 'bookmarks',
      label: '我的收藏',
      icon: FiBookmark,
      color: 'var(--theme-warning-500)',
      action: 'show-bookmarks'
    },
    {
      id: 'recent',
      label: '最近访问',
      icon: FiClock,
      color: 'var(--theme-success-500)',
      action: 'show-recent'
    }
  ];

  // 切换折叠状态
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // 处理快捷操作点击
  const handleQuickAction = useCallback((action: string) => {
    onQuickAction?.(action);
  }, [onQuickAction]);

  // 渲染标签页按钮
  const renderTabButton = (tab: SidebarTab, icon: React.ElementType, label: string) => {
    const Icon = icon;
    const isActive = activeTab === tab;

    return (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`
          flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${isCollapsed ? 'justify-center' : 'justify-start'}
          ${isActive ? 'shadow-sm' : 'hover:bg-opacity-80'}
        `}
        style={{
          backgroundColor: isActive ? 'var(--theme-primary-100)' : 'transparent',
          color: isActive ? 'var(--theme-primary-700)' : 'var(--theme-neutral-600)'
        }}
        title={isCollapsed ? label : undefined}
      >
        <Icon className="h-4 w-4" />
        {!isCollapsed && <span className="ml-2">{label}</span>}
      </button>
    );
  };

  // 渲染快捷操作按钮
  const renderQuickAction = (action: QuickAction) => (
    <motion.button
      key={action.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleQuickAction(action.action)}
      className={`
        flex items-center p-3 rounded-lg transition-all duration-200 hover:shadow-sm
        ${isCollapsed ? 'justify-center' : 'justify-start'}
      `}
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-card-border)',
        color: 'var(--theme-neutral-700)'
      }}
      title={isCollapsed ? action.label : undefined}
    >
      <action.icon className="h-5 w-5" style={{ color: action.color }} />
      {!isCollapsed && (
        <div className="ml-3">
          <div className="text-sm font-medium">{action.label}</div>
        </div>
      )}
    </motion.button>
  );

  // 渲染日历视图
  const renderCalendarView = () => (
    <div className="flex-1 overflow-hidden">
      <TaskCalendarPanel 
        tasks={tasks} 
        compact={isCollapsed}
        className="h-full"
      />
    </div>
  );

  // 渲染快捷操作视图
  const renderShortcutsView = () => (
    <div className="space-y-3">
      {quickActions.map(renderQuickAction)}
      
      {!isCollapsed && (
        <div className="mt-6">
          <h4 
            className="text-xs font-semibold mb-3"
            style={{ color: 'var(--theme-neutral-500)' }}
          >
            常用功能
          </h4>
          <div className="space-y-2">
            {[
              { label: '今日任务', count: tasks.filter(t => {
                if (!t.dueDate) return false;
                const today = new Date();
                const dueDate = new Date(t.dueDate);
                return dueDate.toDateString() === today.toDateString();
              }).length },
              { label: '本周任务', count: tasks.filter(t => {
                if (!t.dueDate) return false;
                const now = new Date();
                const dueDate = new Date(t.dueDate);
                const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                return dueDate >= weekStart && dueDate <= weekEnd;
              }).length },
              { label: '逾期任务', count: tasks.filter(t => {
                if (!t.dueDate) return false;
                return new Date(t.dueDate) < new Date();
              }).length },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-2 rounded hover:bg-opacity-50"
                style={{ backgroundColor: 'var(--theme-neutral-50)' }}
              >
                <span 
                  className="text-sm"
                  style={{ color: 'var(--theme-neutral-600)' }}
                >
                  {item.label}
                </span>
                <span 
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ 
                    backgroundColor: 'var(--theme-primary-100)', 
                    color: 'var(--theme-primary-700)' 
                  }}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 渲染筛选器视图
  const renderFiltersView = () => (
    <div className="space-y-4">
      {!isCollapsed && (
        <>
          <div>
            <h4 
              className="text-xs font-semibold mb-2"
              style={{ color: 'var(--theme-neutral-500)' }}
            >
              状态筛选
            </h4>
            <div className="space-y-1">
              {['待处理', '进行中', '已完成', '已逾期'].map(status => (
                <label key={status} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    defaultChecked
                  />
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--theme-neutral-600)' }}
                  >
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 
              className="text-xs font-semibold mb-2"
              style={{ color: 'var(--theme-neutral-500)' }}
            >
              优先级筛选
            </h4>
            <div className="space-y-1">
              {['高', '中', '低'].map(priority => (
                <label key={priority} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    defaultChecked
                  />
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--theme-neutral-600)' }}
                  >
                    {priority}优先级
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 64 : 320 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`
        relative flex flex-col h-full border-l bg-background/50 backdrop-blur-sm
        ${className}
      `}
      style={{ 
        borderColor: 'var(--theme-card-border)',
        backgroundColor: 'var(--theme-card-bg)'
      }}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--theme-card-border)' }}>
        {!isCollapsed && (
          <h3 
            className="font-semibold text-sm"
            style={{ color: 'var(--foreground)' }}
          >
            工具面板
          </h3>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-lg hover:bg-opacity-80 transition-colors"
          style={{ backgroundColor: 'var(--theme-neutral-100)' }}
        >
          {isCollapsed ? (
            <FiChevronLeft className="h-4 w-4" style={{ color: 'var(--theme-neutral-600)' }} />
          ) : (
            <FiChevronRight className="h-4 w-4" style={{ color: 'var(--theme-neutral-600)' }} />
          )}
        </button>
      </div>

      {/* 标签页导航 */}
      <div className={`p-3 border-b ${isCollapsed ? 'space-y-2' : 'flex space-x-1'}`} style={{ borderColor: 'var(--theme-card-border)' }}>
        {renderTabButton('calendar', FiCalendar, '日历')}
        {renderTabButton('shortcuts', FiPlus, '快捷')}
        {renderTabButton('filters', FiFilter, '筛选')}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-3 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: isCollapsed ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isCollapsed ? 0 : -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'calendar' && renderCalendarView()}
            {activeTab === 'shortcuts' && renderShortcutsView()}
            {activeTab === 'filters' && renderFiltersView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部工具 */}
      {!isCollapsed && (
        <div className="p-3 border-t" style={{ borderColor: 'var(--theme-card-border)' }}>
          <button
            onClick={() => handleQuickAction('settings')}
            className="w-full flex items-center p-2 rounded-lg text-sm transition-colors hover:bg-opacity-80"
            style={{
              backgroundColor: 'var(--theme-neutral-50)',
              color: 'var(--theme-neutral-600)'
            }}
          >
            <FiSettings className="h-4 w-4 mr-2" />
            设置面板
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CollapsibleSidebar;