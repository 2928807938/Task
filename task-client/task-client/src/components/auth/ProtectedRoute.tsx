"use client";

import React, {ReactNode} from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * 当前组件仅仅是一个容器，实际的路由保护逻辑在各个页面组件中实现
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}
