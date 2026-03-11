'use client';

import React, {createContext, useContext, useEffect, useState} from 'react';
import {ThemeContextType, ThemeDefinition, ThemeMode} from './themeTypes';
import {lightTheme} from './lightTheme';
import {darkTheme} from './darkTheme';


// 创建主题上下文
const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  mode: 'light',
  toggleTheme: () => {},
  resetToSystemTheme: () => {},
  isDark: false,
  isSystemTheme: true,
});

// 主题提供者组件
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 使用空值作为初始状态，避免在服务端和客户端之间的状态不匹配
  const [mode, setMode] = useState<ThemeMode | null>(null);
  const [theme, setTheme] = useState<ThemeDefinition | null>(null);
  const [mounted, setMounted] = useState(false);

  // 切换主题函数
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    setTheme(newMode === 'light' ? lightTheme : darkTheme);

    // 保存到localStorage - 一旦用户手动设置，就不再跟随系统
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', newMode);
    }

    // 更新HTML元素的类
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  // 重置为系统主题函数
  const resetToSystemTheme = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('theme-mode');
      
      // 检测当前系统主题
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemMode = systemIsDark ? 'dark' : 'light';
      
      setMode(systemMode);
      setTheme(systemMode === 'dark' ? darkTheme : lightTheme);
      
      // 更新DOM
      if (systemMode === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark-theme');
        document.documentElement.style.colorScheme = 'light';
      }
    }
  };

  // 初始加载时，同步状态与预加载脚本应用的主题
  useEffect(() => {
    // 获取当前应用的主题模式
    const isDarkApplied = document.documentElement.classList.contains('dark-theme');
    const initialMode = isDarkApplied ? 'dark' : 'light';

    // 同步React状态与DOM
    setMode(initialMode);
    setTheme(initialMode === 'dark' ? darkTheme : lightTheme);
    setMounted(true);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才跟随系统
      const savedTheme = localStorage.getItem('theme-mode');
      if (!savedTheme) {
        const systemMode = e.matches ? 'dark' : 'light';
        setMode(systemMode);
        setTheme(systemMode === 'dark' ? darkTheme : lightTheme);
        
        // 更新DOM
        if (systemMode === 'dark') {
          document.documentElement.classList.add('dark-theme');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark-theme');
          document.documentElement.style.colorScheme = 'light';
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // 检查是否使用系统主题
  const isSystemTheme = typeof window !== 'undefined' ? !localStorage.getItem('theme-mode') : true;

  // 提供主题上下文值 - 确保已经有值
  const contextValue: ThemeContextType = {
    theme: theme || lightTheme,
    mode: mode || 'light',
    toggleTheme,
    resetToSystemTheme,
    isDark: mode === 'dark',
    isSystemTheme,
  };

  // 避免服务器端渲染时的样式闪烁问题
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义钩子，方便在组件中使用主题
export const useTheme = () => useContext(ThemeContext);

// 导出上下文，以便在需要时直接使用
export default ThemeContext;
