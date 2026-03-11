'use client'

import React from 'react';
import dynamic from 'next/dynamic';

// 动态导入GlobalLoader组件，减少初始加载时间
const GlobalLoader = dynamic(() => import('@/ui/molecules/GlobalLoader'), {
  ssr: false,
});

/**
 * 加载指示器包装组件
 * 用于在客户端环境中加载全局加载指示器
 */
const LoaderWrapper: React.FC = () => {
  return <GlobalLoader />;
};

export default LoaderWrapper;
