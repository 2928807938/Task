import {
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    SendEmailVerificationCodeRequest,
    UserInfo,
    UserSearchResult
} from '@/types/api-types';

/**
 * 用户仓库接口
 * 定义与用户相关的数据操作方法
 */
export interface UserRepository {
  /**
   * 用户注册
   * @param data 注册信息
   */
  register(data: RegisterRequest): Promise<ApiResponse<void>>;

  /**
   * 用户登录
   * @param data 登录信息
   */
  login(data: LoginRequest): Promise<ApiResponse<UserInfo>>;

  /**
   * 用户登出
   */
  logout(): Promise<ApiResponse<void>>;

  /**
   * 获取当前登录用户信息
   */
  getCurrentUser(): Promise<ApiResponse<UserInfo>>;

  /**
   * 发送邮箱验证码
   * @param data 请求数据，包含邮箱和验证码类型
   */
  sendEmailVerificationCode(data: SendEmailVerificationCodeRequest): Promise<ApiResponse<void>>;

  /**
   * 修改密码
   * @param email 用户邮箱
   * @param verificationCode 验证码
   * @param newPassword 新密码
   */
  changePassword(email: string, verificationCode: string, newPassword: string): Promise<ApiResponse<void>>;

  /**
   * 根据邮箱或用户名查找用户
   * @param param 搜索参数（邮箱或用户名）
   * @param projectId 可选项目 ID，如果提供了项目 ID，将返回用户是否已在该项目中
   */
  findUserByEmailOrUsername(param: string, projectId?: string): Promise<ApiResponse<UserSearchResult>>;
}
