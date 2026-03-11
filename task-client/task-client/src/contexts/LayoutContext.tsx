'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LayoutMode = 'compact' | 'comfortable' | 'spacious';

interface LayoutConfig {
  spacing: string;
  cardHeight: string;
  fontSize: string;
  padding: string;
  gap: string;
  statsHeight: string;
}

interface LayoutContextType {
  mode: LayoutMode;
  config: LayoutConfig;
  setMode: (mode: LayoutMode) => void;
}

const layoutConfigs: Record<LayoutMode, LayoutConfig> = {
  compact: {
    spacing: 'space-y-1',
    cardHeight: 'h-16',
    fontSize: 'text-sm',
    padding: 'p-3',
    gap: 'gap-4',
    statsHeight: 'h-20',
  },
  comfortable: {
    spacing: 'space-y-2',
    cardHeight: 'h-20',
    fontSize: 'text-base', 
    padding: 'p-4',
    gap: 'gap-6',
    statsHeight: 'h-24',
  },
  spacious: {
    spacing: 'space-y-3',
    cardHeight: 'h-24',
    fontSize: 'text-lg',
    padding: 'p-6',
    gap: 'gap-8',
    statsHeight: 'h-28',
  },
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
  defaultMode?: LayoutMode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  children,
  defaultMode = 'comfortable'
}) => {
  const [mode, setModeState] = useState<LayoutMode>(defaultMode);
  const [config, setConfig] = useState<LayoutConfig>(layoutConfigs[defaultMode]);

  // 从本地存储加载设置
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('dashboard-layout-mode') as LayoutMode;
      if (savedMode && layoutConfigs[savedMode]) {
        setModeState(savedMode);
        setConfig(layoutConfigs[savedMode]);
      }
    } catch (error) {
      console.warn('Failed to load layout mode from localStorage:', error);
    }
  }, []);

  // 更新模式
  const setMode = (newMode: LayoutMode) => {
    setModeState(newMode);
    setConfig(layoutConfigs[newMode]);
    
    try {
      localStorage.setItem('dashboard-layout-mode', newMode);
    } catch (error) {
      console.warn('Failed to save layout mode to localStorage:', error);
    }
  };

  // 应用CSS变量到文档根元素
  useEffect(() => {
    const root = document.documentElement;
    
    // 设置布局相关的CSS变量
    root.style.setProperty('--layout-card-height', config.cardHeight);
    root.style.setProperty('--layout-spacing', config.spacing);
    root.style.setProperty('--layout-font-size', config.fontSize);
    root.style.setProperty('--layout-padding', config.padding);
    root.style.setProperty('--layout-gap', config.gap);
    root.style.setProperty('--layout-stats-height', config.statsHeight);
    
    // 设置模式类名到body
    document.body.classList.remove('layout-compact', 'layout-comfortable', 'layout-spacious');
    document.body.classList.add(`layout-${mode}`);
    
    return () => {
      // 清理时移除类名
      document.body.classList.remove('layout-compact', 'layout-comfortable', 'layout-spacious');
    };
  }, [mode, config]);

  return (
    <LayoutContext.Provider value={{ mode, config, setMode }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export default LayoutProvider;