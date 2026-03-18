'use client';

import React, {ReactNode} from 'react';
import {useNavigationMode} from '@/hooks/use-navigation-mode';
import DesktopSidebarNav from '../../organisms/DesktopSidebarNav';
import RadialMenu from '../../organisms/RadialMenu';

interface MainLayoutProps {
  children: ReactNode;
  title: string; // 保留title参数以保持接口兼容性，但不再使用
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const {navigationMode, setNavigationMode, isSidebarDesktop} = useNavigationMode('radial');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {isSidebarDesktop && <DesktopSidebarNav mode={navigationMode} onModeChange={setNavigationMode} />}

      <div className={`relative flex min-h-screen flex-col overflow-hidden ${isSidebarDesktop ? 'lg:pl-[336px]' : ''}`}>
        <div
          className={`flex-1 overflow-auto p-4 sm:p-6 md:p-8 ${isSidebarDesktop ? '' : 'pb-24 md:pb-8'}`}
          style={{ color: 'var(--foreground)' }}
        >
          {children}
        </div>

        {!isSidebarDesktop && <RadialMenu />}
      </div>
    </div>
  );
};

export default MainLayout;
