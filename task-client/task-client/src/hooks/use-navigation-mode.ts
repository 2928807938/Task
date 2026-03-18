'use client';

import {useCallback, useEffect, useState} from 'react';

export type NavigationMode = 'radial' | 'sidebar';

const NAVIGATION_MODE_KEY = 'app-navigation-mode';
const DESKTOP_BREAKPOINT = 1024;

export function useNavigationMode(defaultMode: NavigationMode = 'radial') {
  const [navigationMode, setNavigationModeState] = useState<NavigationMode>(defaultMode);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const syncViewport = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    syncViewport();

    try {
      const savedMode = localStorage.getItem(NAVIGATION_MODE_KEY) as NavigationMode | null;
      if (savedMode === 'radial' || savedMode === 'sidebar') {
        setNavigationModeState(savedMode);
      }
    } catch (error) {
      console.warn('Failed to load navigation mode from localStorage:', error);
    }

    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const setNavigationMode = useCallback((nextMode: NavigationMode) => {
    setNavigationModeState(nextMode);

    try {
      localStorage.setItem(NAVIGATION_MODE_KEY, nextMode);
    } catch (error) {
      console.warn('Failed to save navigation mode to localStorage:', error);
    }
  }, []);

  const toggleNavigationMode = useCallback(() => {
    setNavigationMode(navigationMode === 'radial' ? 'sidebar' : 'radial');
  }, [navigationMode, setNavigationMode]);

  return {
    navigationMode,
    setNavigationMode,
    toggleNavigationMode,
    isDesktop,
    isSidebarDesktop: isDesktop && navigationMode === 'sidebar',
  };
}
