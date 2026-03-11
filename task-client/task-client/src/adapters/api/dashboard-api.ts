import httpClientImpl from '@/infrastructure/http/http-client-impl';
import Cookies from 'js-cookie';
import {ApiResponse} from '@/types/api-types';

/**
 * 获取认证令牌
 */
const getAuthToken = (): string | undefined => {
  return Cookies.get('auth_token');
};

/**
 * 仪表盘API服务
 */
export const dashboardApi = {
  /**
   * 获取仪表盘数据
   * 包括未完成任务列表等信息
   * @returns 仪表盘数据响应
   */
  getDashboardData: async (): Promise<ApiResponse<any>> => {
    const token = getAuthToken();
    return httpClientImpl.get<any>('/api/client/homepage/dashboard', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  }
};

export default dashboardApi;
