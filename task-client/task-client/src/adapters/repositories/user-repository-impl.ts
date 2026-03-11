/**
 * 用户仓库接口实现
 */
import {UserRepository} from '@/core/interfaces/repositories/user-repository';
import httpClientImpl from '@/infrastructure/http/http-client-impl';
import {
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    SendEmailVerificationCodeRequest,
    UserInfo,
    UserSearchResult
} from '@/types/api-types';

// API端点常量
const API_ENDPOINTS = {
  REGISTER: '/api/client/user/register',
  LOGIN: '/api/client/user/login',
  LOGOUT: '/api/client/user/logout',
  GET_CURRENT_USER: '/api/client/user/current',
  SEND_EMAIL_VERIFICATION_CODE: '/api/client/user/send-email-verification-code',
  CHANGE_PASSWORD: '/api/client/user/change-password',
  FIND_USER: '/api/client/user/find-user-by-email-or-username'
};

/**
 * 用户仓库实现类
 */
export class UserRepositoryImpl implements UserRepository {
  /**
   * 用户注册
   * @param data 注册信息
   */
  async register(data: RegisterRequest): Promise<ApiResponse<void>> {
    return httpClientImpl.post<void>(API_ENDPOINTS.REGISTER, data);
  }

  /**
   * 用户登录
   * @param data 登录信息
   */
  async login(data: LoginRequest): Promise<ApiResponse<UserInfo>> {
    return httpClientImpl.post<UserInfo>(API_ENDPOINTS.LOGIN, data);
  }

  /**
   * 用户登出
   */
  async logout(): Promise<ApiResponse<void>> {
    return httpClientImpl.post<void>(API_ENDPOINTS.LOGOUT);
  }

  /**
   * 获取当前登录用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    return httpClientImpl.get<UserInfo>(API_ENDPOINTS.GET_CURRENT_USER);
  }

  /**
   * 发送邮箱验证码
   * @param data 请求数据，包含邮箱和验证码类型
   */
  async sendEmailVerificationCode(data: SendEmailVerificationCodeRequest): Promise<ApiResponse<void>> {
    return httpClientImpl.post<void>(API_ENDPOINTS.SEND_EMAIL_VERIFICATION_CODE, data);
  }

  /**
   * 修改密码
   * @param email 用户邮箱
   * @param verificationCode 验证码
   * @param newPassword 新密码
   */
  async changePassword(email: string, verificationCode: string, newPassword: string): Promise<ApiResponse<void>> {
    return httpClientImpl.post<void>(API_ENDPOINTS.CHANGE_PASSWORD, {
      email,
      verificationCode,
      newPassword
    });
  }

  /**
   * 根据邮箱或用户名查找用户
   * @param param 搜索参数（邮箱或用户名）
   * @param projectId 可选项目 ID，如果提供了项目 ID，将返回用户是否已在该项目中
   */
  async findUserByEmailOrUsername(param: string, projectId?: string): Promise<ApiResponse<UserSearchResult>> {
    const url = `${API_ENDPOINTS.FIND_USER}?param=${encodeURIComponent(param)}${projectId ? `&projectId=${projectId}` : ''}`;
    return httpClientImpl.get<UserSearchResult>(url);
  }
}
