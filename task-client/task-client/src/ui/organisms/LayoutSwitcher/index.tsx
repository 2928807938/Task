'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiSettings,
  FiMinimize,
  FiMaximize,
  FiSquare,
  FiCheck
} from 'react-icons/fi';

export type LayoutMode = 'compact' | 'comfortable' | 'spacious';

interface LayoutSwitcherProps {
  className?: string;
  currentMode?: LayoutMode;
  onModeChange?: (mode: LayoutMode) => void;
  showLabel?: boolean;
}

interface LayoutOption {
  id: LayoutMode;
  name: string;
  description: string;
  icon: React.ElementType;
  spacing: string;
  cardHeight: string;
  fontSize: string;
}

/**
 * 布局切换器组件
 * 提供紧凑、舒适、宽松三种布局模式
 */
export const LayoutSwitcher: React.FC<LayoutSwitcherProps> = ({
  className = '',
  currentMode = 'comfortable',
  onModeChange,
  showLabel = false
}) => {
  const [selectedMode, setSelectedMode] = useState<LayoutMode>(currentMode);
  const [isOpen, setIsOpen] = useState(false);

  // 布局选项定义
  const layoutOptions: LayoutOption[] = [
    {
      id: 'compact',
      name: '紧凑',
      description: '最大化信息密度，适合处理大量任务',
      icon: FiMinimize,
      spacing: 'space-y-1',
      cardHeight: 'h-16',
      fontSize: 'text-sm',
    },
    {
      id: 'comfortable',
      name: '舒适',
      description: '平衡的信息密度和可读性',
      icon: FiSquare,
      spacing: 'space-y-2',
      cardHeight: 'h-20',
      fontSize: 'text-base',
    },
    {
      id: 'spacious',
      name: '宽松',
      description: '优化可读性和视觉舒适度',
      icon: FiMaximize,
      spacing: 'space-y-3',
      cardHeight: 'h-24',
      fontSize: 'text-lg',
    },
  ];

  // 处理模式切换
  const handleModeChange = useCallback((mode: LayoutMode) => {
    setSelectedMode(mode);
    onModeChange?.(mode);
    setIsOpen(false);
    
    // 保存到本地存储
    localStorage.setItem('dashboard-layout-mode', mode);
  }, [onModeChange]);

  // 从本地存储加载设置
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('dashboard-layout-mode') as LayoutMode;
      if (savedMode && layoutOptions.some(opt => opt.id === savedMode)) {
        setSelectedMode(savedMode);
        onModeChange?.(savedMode);
      }
    } catch (error) {
      console.warn('Failed to load layout mode from localStorage:', error);
    }
  }, [onModeChange]);

  const currentOption = layoutOptions.find(opt => opt.id === selectedMode) || layoutOptions[1];

  return (
    <div className={`relative ${className}`}>
      {/* 触发按钮 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-sm"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-card-border)',
          color: 'var(--theme-neutral-600)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <currentOption.icon className="h-4 w-4" />
        {showLabel && (
          <>
            <span className="ml-2 text-sm font-medium">{currentOption.name}</span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2"
            >
              <FiGrid className="h-3 w-3" />
            </motion.div>
          </>
        )}
      </motion.button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩层 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* 菜单面板 */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 right-0 z-50 min-w-72 rounded-xl border shadow-xl overflow-hidden"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-card-border)',
                boxShadow: 'var(--theme-shadow-lg)',
              }}
            >
              {/* 标题 */}
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--theme-card-border)' }}>
                <div className="flex items-center">
                  <FiSettings className="h-4 w-4 mr-2" style={{ color: 'var(--theme-primary-500)' }} />
                  <h3 className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    布局设置
                  </h3>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--theme-neutral-500)' }}>
                  选择适合您的工作方式的布局密度
                </p>
              </div>

              {/* 布局选项 */}
              <div className="p-2">
                {layoutOptions.map((option, index) => {
                  const isSelected = selectedMode === option.id;
                  const Icon = option.icon;
                  
                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: index * 0.05 }}
                      onClick={() => handleModeChange(option.id)}
                      className={`
                        w-full flex items-start p-3 rounded-lg text-left transition-all duration-200
                        ${isSelected ? 'shadow-sm' : 'hover:shadow-sm'}
                      `}
                      style={{
                        backgroundColor: isSelected 
                          ? 'var(--theme-primary-50)' 
                          : 'transparent',
                        border: isSelected 
                          ? '1px solid var(--theme-primary-200)' 
                          : '1px solid transparent',
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {/* 图标和选择指示器 */}
                      <div className="flex items-center mt-0.5">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                          style={{
                            backgroundColor: isSelected 
                              ? 'var(--theme-primary-100)' 
                              : 'var(--theme-neutral-100)',
                          }}
                        >
                          <Icon 
                            className="h-4 w-4" 
                            style={{
                              color: isSelected 
                                ? 'var(--theme-primary-600)' 
                                : 'var(--theme-neutral-500)',
                            }}
                          />
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute left-3 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--theme-primary-500)' }}
                          >
                            <FiCheck className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                      </div>

                      {/* 文字信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 
                            className="font-medium text-sm"
                            style={{
                              color: isSelected 
                                ? 'var(--theme-primary-700)' 
                                : 'var(--foreground)',
                            }}
                          >
                            {option.name}布局
                          </h4>
                        </div>
                        <p 
                          className="text-xs mt-1 leading-relaxed"
                          style={{ color: 'var(--theme-neutral-500)' }}
                        >
                          {option.description}
                        </p>
                        
                        {/* 预览示例 */}
                        <div className="mt-2 flex items-center space-x-1">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`rounded border ${option.cardHeight.replace('h-', 'w-')} ${option.cardHeight}`}
                              style={{
                                backgroundColor: 'var(--theme-neutral-50)',
                                borderColor: 'var(--theme-neutral-200)',
                                width: '12px',
                                height: option.id === 'compact' ? '8px' : 
                                        option.id === 'comfortable' ? '10px' : '12px',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* 底部提示 */}
              <div 
                className="px-4 py-2 border-t text-xs text-center"
                style={{ 
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-neutral-400)',
                  backgroundColor: 'var(--theme-neutral-25)',
                }}
              >
                您的布局偏好会自动保存
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LayoutSwitcher;