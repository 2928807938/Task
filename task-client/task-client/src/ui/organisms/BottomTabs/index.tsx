'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity,
  FiMessageSquare,
  FiUsers,
  FiTrendingUp,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi';
import { CollaborationTimeline } from '@/ui/organisms/CollaborationTimeline';
import RecentCommunications from '@/ui/organisms/RecentCommunications';
import { CollaborationActivity } from '@/types/dashboard-types';

interface BottomTabsProps {
  className?: string;
  onActivityClick?: (activity: CollaborationActivity) => void;
  onCommunicationClick?: (communication: any) => void;
  defaultTab?: BottomTabType;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

type BottomTabType = 'activities' | 'communications' | 'analytics' | 'team';

interface TabItem {
  id: BottomTabType;
  label: string;
  icon: React.ElementType;
  badge?: number;
  color: string;
}

/**
 * 底部标签页组件
 * 显示活动时间线、沟通记录等信息，支持折叠
 */
export const BottomTabs: React.FC<BottomTabsProps> = ({
  className = '',
  onActivityClick,
  onCommunicationClick,
  defaultTab = 'activities',
  collapsible = true,
  defaultCollapsed = false
}) => {
  const [activeTab, setActiveTab] = useState<BottomTabType>(defaultTab);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // 标签页定义
  const tabs: TabItem[] = [
    {
      id: 'activities',
      label: '活动时间线',
      icon: FiActivity,
      color: 'var(--theme-primary-500)',
    },
    {
      id: 'communications',
      label: '最近沟通',
      icon: FiMessageSquare,
      color: 'var(--theme-success-500)',
    },
    {
      id: 'analytics',
      label: '数据分析',
      icon: FiTrendingUp,
      color: 'var(--theme-info-500)',
    },
    {
      id: 'team',
      label: '团队状态',
      icon: FiUsers,
      color: 'var(--theme-warning-500)',
    },
  ];

  // 切换折叠状态
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // 切换标签页
  const switchTab = useCallback((tabId: BottomTabType) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    setActiveTab(tabId);
  }, [isCollapsed]);

  // 渲染标签按钮
  const renderTabButton = (tab: TabItem) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;

    return (
      <motion.button
        key={tab.id}
        onClick={() => switchTab(tab.id)}
        className={`
          relative flex items-center px-4 py-3 rounded-lg transition-all duration-200
          ${isActive ? 'shadow-sm' : 'hover:bg-opacity-80'}
        `}
        style={{
          backgroundColor: isActive ? 'var(--theme-card-bg)' : 'transparent',
          color: isActive ? tab.color : 'var(--theme-neutral-600)',
          border: isActive ? '1px solid var(--theme-card-border)' : '1px solid transparent'
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">{tab.label}</span>
        
        {/* 活跃指示器 */}
        {isActive && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
            style={{ backgroundColor: tab.color }}
          />
        )}

        {/* 徽章 */}
        {tab.badge && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: tab.color }}
          >
            {tab.badge > 99 ? '99+' : tab.badge}
          </motion.div>
        )}
      </motion.button>
    );
  };

  // 渲染活动时间线内容
  const renderActivitiesContent = () => (
    <div className="h-full">
      <CollaborationTimeline
        maxItems={15}
        showHeader={false}
        className="h-full"
        onActivityClick={onActivityClick}
      />
    </div>
  );

  // 渲染沟通记录内容
  const renderCommunicationsContent = () => (
    <div className="h-full">
      <RecentCommunications
        maxItems={10}
        className="h-full"
        onCommunicationClick={onCommunicationClick}
      />
    </div>
  );

  // 渲染数据分析内容
  const renderAnalyticsContent = () => (
    <div className="p-6 text-center">
      <FiTrendingUp 
        className="h-12 w-12 mx-auto mb-4 opacity-50" 
        style={{ color: 'var(--theme-neutral-400)' }}
      />
      <h3 
        className="text-lg font-medium mb-2"
        style={{ color: 'var(--foreground)' }}
      >
        数据分析
      </h3>
      <p 
        className="text-sm max-w-md mx-auto"
        style={{ color: 'var(--theme-neutral-500)' }}
      >
        详细的任务和团队数据分析功能正在开发中，敬请期待。
      </p>
    </div>
  );

  // 渲染团队状态内容
  const renderTeamContent = () => (
    <div className="p-6 text-center">
      <FiUsers 
        className="h-12 w-12 mx-auto mb-4 opacity-50" 
        style={{ color: 'var(--theme-neutral-400)' }}
      />
      <h3 
        className="text-lg font-medium mb-2"
        style={{ color: 'var(--foreground)' }}
      >
        团队状态
      </h3>
      <p 
        className="text-sm max-w-md mx-auto"
        style={{ color: 'var(--theme-neutral-500)' }}
      >
        实时团队成员状态和协作信息功能正在开发中。
      </p>
    </div>
  );

  // 渲染内容区域
  const renderContent = () => {
    switch (activeTab) {
      case 'activities':
        return renderActivitiesContent();
      case 'communications':
        return renderCommunicationsContent();
      case 'analytics':
        return renderAnalyticsContent();
      case 'team':
        return renderTeamContent();
      default:
        return renderActivitiesContent();
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ 
        height: isCollapsed ? 'auto' : 400,
        minHeight: isCollapsed ? 'auto' : 400
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`
        relative overflow-hidden border-t bg-background/80 backdrop-blur-sm
        ${className}
      `}
      style={{ 
        borderColor: 'var(--theme-card-border)',
        backgroundColor: 'var(--theme-card-bg)'
      }}
    >
      {/* 标签页头部 */}
      <div className="flex items-center justify-between p-4">
        {/* 标签页按钮 */}
        <div className="flex items-center space-x-2">
          {tabs.map(renderTabButton)}
        </div>

        {/* 折叠按钮 */}
        {collapsible && (
          <motion.button
            onClick={toggleCollapsed}
            className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
            style={{ backgroundColor: 'var(--theme-neutral-100)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCollapsed ? (
              <FiChevronUp 
                className="h-4 w-4" 
                style={{ color: 'var(--theme-neutral-600)' }} 
              />
            ) : (
              <FiChevronDown 
                className="h-4 w-4" 
                style={{ color: 'var(--theme-neutral-600)' }} 
              />
            )}
          </motion.button>
        )}
      </div>

      {/* 内容区域 */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t"
            style={{ borderColor: 'var(--theme-card-border)' }}
          >
            <div className="h-80 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 拖拽指示器 */}
      {collapsible && (
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
          <div 
            className="w-8 h-1 rounded-full"
            style={{ backgroundColor: 'var(--theme-neutral-300)' }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default BottomTabs;