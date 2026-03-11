import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';

// 公开路由列表，不需要登录即可访问
const publicRoutes = ['/login', '/register', '/terms', '/privacy', '/forgot-password'];

/**
 * 中间件函数，用于路由保护
 * 在Next.js中，中间件会在每个请求到达页面前执行
 */
export function middleware(request: NextRequest) {
  // 获取当前路径
  const path = request.nextUrl.pathname;

  // 检查是否是公开路由
  const isPublicRoute = publicRoutes.some(route =>
    path === route || path.startsWith(`${route}/`)
  );

  // 获取token，判断用户是否已登录
  const token = request.cookies.get('auth_token')?.value;

  // 如果是登录或注册页面，且用户已登录，重定向到首页或redirect参数指定的页面
  if ((path === '/login' || path === '/register') && token) {
    // 获取redirect参数
    const redirectParam = request.nextUrl.searchParams?.get('redirect');

    if (redirectParam) {
      // 如果有redirect参数，重定向到指定页面
      return NextResponse.redirect(new URL(redirectParam, request.url));
    } else {
      // 如果没有redirect参数，重定向到首页
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 如果不是公开路由，且用户未登录，重定向到登录页面
  if (!isPublicRoute && !token) {
    // 构建URL，包括重定向参数
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);

    // 返回重定向响应
    return NextResponse.redirect(url);
  }

  // 继续处理请求
  return NextResponse.next();
}

/**
 * 配置中间件匹配的路由
 * 这里配置为匹配所有路由
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - 静态文件路径 (如 /images/, /fonts/ 等)
     * - API路由 (/api/)
     * - _next 路径 (Next.js内部使用)
     * - favicon.ico 文件
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
