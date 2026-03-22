"use client";

import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
}

const publicRoutes = ['/login', '/register', '/terms', '/privacy', '/forgot-password'];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  const token = useMemo(() => Cookies.get('auth_token'), [pathname]);
  const isPublicRoute = useMemo(
    () => publicRoutes.some((route) => pathname === route || pathname?.startsWith(`${route}/`)),
    [pathname]
  );

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
    const currentPath = `${pathname}${currentSearch}`;
    const searchParams = new URLSearchParams(currentSearch);

    if ((pathname === '/login' || pathname === '/register') && token) {
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      window.location.replace(redirectUrl);
      return;
    }

    if (!isPublicRoute && !token) {
      window.location.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setIsReady(true);
  }, [isPublicRoute, pathname, token]);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
