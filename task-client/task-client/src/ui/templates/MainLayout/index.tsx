'use client';

import React, {ReactNode} from 'react';
import RadialMenu from '../../organisms/RadialMenu';

interface MainLayoutProps {
  children: ReactNode;
  title: string; // 保留title参数以保持接口兼容性，但不再使用
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* 内容区域 - 全屏布局，采用 */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* 内容区域 - 优化内边距，提供更多呼吸空间 */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto" style={{ color: 'var(--foreground)' }}>
          {children}
        </div>

        {/* 环形菜单 - 使用fixed定位，完全负责导航功能 */}
        <RadialMenu />
      </div>
    </div>
  );
};

export default MainLayout;
