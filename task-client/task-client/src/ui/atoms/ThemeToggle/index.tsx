'use client';

import React from 'react';
import {FiMoon, FiSun} from 'react-icons/fi';
import {useTheme} from '@/ui/theme'; // 使用我们新的主题系统钩子

interface ThemeToggleProps {
  compact?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  // 使用新的主题上下文钩子
  const { isDark, toggleTheme, isSystemTheme, resetToSystemTheme } = useTheme();

  // 紧凑模式（用于顶部导航栏等小空间）
  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-200 text-neutral-700 dark:text-neutral-800 hover:bg-primary-100 hover:text-primary-600 transition-colors duration-normal"
        aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
      >
        {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
      </button>
    );
  }

  // 完整模式（用于侧边栏等）
  return (
    <div className="space-y-1">
      <button
        onClick={toggleTheme}
        className="flex items-center w-full px-4 py-3 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-normal"
        aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
      >
        <span className="w-5 h-5 mr-3">
          {isDark ? <FiSun /> : <FiMoon />}
        </span>
        <span className="flex-1 text-left">{isDark ? '亮色模式' : '暗色模式'}</span>
        {isSystemTheme && (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">系统</span>
        )}
      </button>
      
      {!isSystemTheme && (
        <button
          onClick={resetToSystemTheme}
          className="flex items-center w-full px-4 py-2 ml-4 text-sm rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-normal"
          aria-label="重置为系统主题"
        >
          <span className="text-xs">跟随系统</span>
        </button>
      )}
    </div>
  );
};

export default ThemeToggle;
