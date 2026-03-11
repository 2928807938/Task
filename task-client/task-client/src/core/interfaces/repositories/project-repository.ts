import {
    AddProjectMemberRequest,
    ApiResponse,
    CreateProjectRequest,
    ProjectDetailResponse,
    ProjectInfo,
    ProjectMember,
    ProjectPageRequest,
    ProjectPageResponse,
    ProjectTask
} from '@/types/api-types';

/**
 * 项目仓库接口
 * 定义了项目相关的数据操作方法
 */
/**
 * 项目角色项
 */
export interface ProjectRoleItem {
  id: string;       // 角色ID
  name: string;     // 角色名称
  description: string; // 角色描述
  system: boolean;  // 是否为系统预设角色
  [key: string]: any; // 允许其他属性
}

export interface ProjectRepository {
  /**
   * 创建项目
   * @param request 创建项目请求参数
   */
  createProject(request: CreateProjectRequest): Promise<ApiResponse<ProjectInfo>>;

  /**
   * 获取当前用户的项目列表（分页）
   * @param request 分页和筛选参数
   */
  getCurrentUserProjects(request: ProjectPageRequest): Promise<ApiResponse<ProjectPageResponse>>;

  /**
   * 删除项目
   * @param id 项目的ID
   */
  deleteProject(id: string): Promise<ApiResponse<void>>;

  /**
   * 获取项目详情
   * @param id 项目的ID
   */
  getProjectDetail(id: string): Promise<ApiResponse<ProjectDetailResponse>>;

  /**
   * 获取项目任务树
   * @param projectId 项目的ID
   */
  getProjectTaskTree(projectId: string): Promise<ApiResponse<ProjectTask[]>>;

  /**
   * 获取项目成员列表
   * @param projectId 项目的ID
   * @param memberName 成员名称（可选，用于模糊搜索）
   */
  getProjectMembers(projectId: string, memberName?: string): Promise<ApiResponse<ProjectMember[]>>;

  /**
   * 更改项目归档状态（归档或取消归档）
   * @param id 项目的ID
   * @param archived 是否归档
   * @param reason 归档或取消归档的原因
   */
  changeArchiveStatus(id: string, archived: boolean, reason?: string): Promise<ApiResponse<void>>;

  /**
   * 修改项目信息
   * @param id 项目的ID
   * @param name 新的项目名称
   * @param description 新的项目描述
   */
  updateProject(id: string, name: string, description: string): Promise<ApiResponse<void>>;

  /**
   * 添加项目成员
   * @param request 添加成员请求参数
   */
  addProjectMember(request: AddProjectMemberRequest): Promise<ApiResponse<void>>;

  /**
   * 获取项目角色列表
   * @param projectId 项目的ID
   */
  getProjectRoles(projectId: string): Promise<ApiResponse<ProjectRoleItem[]>>;

  /**
   * 创建项目角色
   * @param projectId 项目的ID
   * @param name 角色名称
   * @param description 角色描述
   */
  createProjectRole(projectId: string, name: string, description: string): Promise<ApiResponse<ProjectRoleItem>>;

  /**
   * 移除项目成员
   * @param projectId 项目的ID
   * @param memberId 成员的ID
   */
  removeProjectMember(projectId: string, memberId: string): Promise<ApiResponse<void>>;
}
