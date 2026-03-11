/**
 * 用户API服务
 * 提供与用户相关的API操作
 */
import {UserRepositoryImpl} from '@/adapters/repositories/user-repository-impl';
import {UserRepository} from '@/core/interfaces/repositories/user-repository';
import {
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    SendEmailVerificationCodeRequest,
    UserInfo,
    UserSearchResult
} from '@/types/api-types';

/**
 * 用户API服务类
 */
export class UserApi {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
  }

  /**
   * 用户注册
   * @param data 注册信息
   */
  async register(data: RegisterRequest): Promise<ApiResponse<void>> {
    return this.userRepository.register(data);
  }

  /**
   * 用户登录
   * @param data 登录信息
   */
  async login(data: LoginRequest): Promise<ApiResponse<UserInfo>> {
    return this.userRepository.login(data);
  }

  /**
   * 用户登出
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.userRepository.logout();
  }

  /**
   * 获取当前登录用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    return this.userRepository.getCurrentUser();
  }

  /**
   * 发送邮箱验证码
   * @param data 请求数据，包含邮箱和验证码类型
   */
  async sendEmailVerificationCode(data: SendEmailVerificationCodeRequest): Promise<ApiResponse<void>> {
    return this.userRepository.sendEmailVerificationCode(data);
  }

  /**
   * 修改密码
   * @param email 用户邮箱
   * @param verificationCode 验证码
   * @param newPassword 新密码
   */
  async changePassword(email: string, verificationCode: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.userRepository.changePassword(email, verificationCode, newPassword);
  }

  /**
   * 根据邮箱或用户名查找用户
   * @param param 搜索参数（邮箱或用户名）
   * @param projectId 可选项目 ID，如果提供了项目 ID，将返回用户是否已在该项目中
   */
  async findUserByEmailOrUsername(param: string, projectId?: string): Promise<ApiResponse<UserSearchResult>> {
    return this.userRepository.findUserByEmailOrUsername(param, projectId);
  }
}

// 导出单例实例
export const userApi = new UserApi();
