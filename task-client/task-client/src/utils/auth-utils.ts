/**
 * 认证工具函数
 * 用于管理用户认证状态、token等
 */
import Cookies from 'js-cookie';
import {UserInfo} from '@/types/api-types';

// Cookie名称常量
export const AUTH_TOKEN_COOKIE = 'auth_token';
export const USER_INFO_COOKIE = 'user_info';

// Cookie过期时间（7天）
const COOKIE_EXPIRES = 7;

/**
 * 设置认证信息
 * @param userInfo 用户信息
 */
export function setAuthInfo(userInfo: UserInfo): void {
  if (!userInfo) {
    console.error('设置认证信息失败：用户信息为空');
    return;
  }

  // 检查是否有JWT令牌
  if (!userInfo.token) {
    console.error('设置认证信息失败：缺少JWT令牌');
    return;
  }

  // 将后端返回的JWT令牌存储在cookie中
  Cookies.set(AUTH_TOKEN_COOKIE, userInfo.token, { expires: COOKIE_EXPIRES, path: '/' });
  // 存储用户基本信息（不包含敏感数据）
  // 转换为JSON字符串后存储
  Cookies.set(USER_INFO_COOKIE, JSON.stringify({
    id: userInfo.id || 'temp-user-id',
    username: userInfo.username || 'guest',
  }), { expires: COOKIE_EXPIRES, path: '/' });
}

/**
 * 清除认证信息
 */
export function clearAuthInfo(): void {
  Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
  Cookies.remove(USER_INFO_COOKIE, { path: '/' });
}

/**
 * 获取认证Token
 */
export function getAuthToken(): string | undefined {
  return Cookies.get(AUTH_TOKEN_COOKIE);
}

/**
 * 获取存储的用户信息
 */
export function getStoredUserInfo(): Partial<UserInfo> | null {
  const userInfoStr = Cookies.get(USER_INFO_COOKIE);
  if (!userInfoStr) return null;

  try {
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('解析用户信息失败:', error);
    return null;
  }
}

/**
 * 检查用户是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
