'use client';

import React from 'react';
import {useIsAuthenticated} from '@/hooks/use-user-hook';
import Dashboard from './index'; // 引入Dashboard组件

/**
 * 新版Dashboard页面
 * 使用模块化组件结构，专注于个人任务和协作功能
 */
export default function DashboardPage() {
  // 在这里可以添加页面级别的逻辑，如权限验证等
  const { isAuthenticated, user } = useIsAuthenticated();

  // 直接渲染Dashboard组件，所有组件逻辑已经封装在Dashboard组件中
  return <Dashboard />;
}
