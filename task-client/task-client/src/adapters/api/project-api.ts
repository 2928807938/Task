/**
 * 项目API服务
 * 提供项目相关的API操作
 */
import {ProjectRepository, ProjectRoleItem} from '@/core/interfaces/repositories/project-repository';
import {ProjectRepositoryImpl} from '../repositories/project-repository-impl';
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
 * 项目API服务类
 */
export class ProjectApi {
  private projectRepository: ProjectRepository;

  constructor(projectRepository?: ProjectRepository) {
    this.projectRepository = projectRepository || new ProjectRepositoryImpl();
  }

  /**
   * 创建项目
   * @param request 创建项目请求参数
   */
  async createProject(request: CreateProjectRequest): Promise<ApiResponse<ProjectInfo>> {
    return this.projectRepository.createProject(request);
  }

  /**
   * 获取当前用户的项目列表（分页）
   * @param request 分页和筛选参数
   */
  async getCurrentUserProjects(request: ProjectPageRequest): Promise<ApiResponse<ProjectPageResponse>> {
    return this.projectRepository.getCurrentUserProjects(request);
  }

  /**
   * 删除项目
   * @param id 项目的ID
   */
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.projectRepository.deleteProject(id);
  }

  /**
   * 获取项目详情
   * @param id 项目的ID
   */
  async getProjectDetail(id: string): Promise<ApiResponse<ProjectDetailResponse>> {
    return this.projectRepository.getProjectDetail(id);
  }

  /**
   * 获取项目任务树
   * @param projectId 项目的ID
   */
  async getProjectTaskTree(projectId: string): Promise<ApiResponse<ProjectTask[]>> {
    return this.projectRepository.getProjectTaskTree(projectId);
  }

  /**
   * 获取项目成员列表
   * @param projectId 项目的ID
   * @param memberName 成员名称（可选，用于模糊搜索）
   */
  async getProjectMembers(projectId: string, memberName?: string): Promise<ApiResponse<ProjectMember[]>> {
    return this.projectRepository.getProjectMembers(projectId, memberName);
  }

  /**
   * 更改项目归档状态（归档或取消归档）
   * @param id 项目的ID
   * @param archived 是否归档
   * @param reason 归档或取消归档的原因（可选）
   */
  async changeArchiveStatus(id: string, archived: boolean, reason?: string): Promise<ApiResponse<void>> {
    return this.projectRepository.changeArchiveStatus(id, archived, reason);
  }

  /**
   * 修改项目信息
   * @param id 项目的ID
   * @param name 新的项目名称
   * @param description 新的项目描述
   */
  async updateProject(id: string, name: string, description: string): Promise<ApiResponse<void>> {
    return this.projectRepository.updateProject(id, name, description);
  }

  /**
   * 添加项目成员
   * @param request 添加成员请求参数
   */
  async addProjectMember(request: AddProjectMemberRequest): Promise<ApiResponse<void>> {
    return this.projectRepository.addProjectMember(request);
  }

  /**
   * 获取项目角色列表
   * @param projectId 项目的ID
   */
  async getProjectRoles(projectId: string): Promise<ApiResponse<ProjectRoleItem[]>> {
    return this.projectRepository.getProjectRoles(projectId);
  }

  /**
   * 移除项目成员
   * @param projectId 项目的ID
   * @param memberId 成员的ID
   */
  async removeProjectMember(projectId: string, memberId: string): Promise<ApiResponse<void>> {
    return this.projectRepository.removeProjectMember(projectId, memberId);
  }

  /**
   * 创建项目角色
   * @param projectId 项目的ID
   * @param name 角色名称
   * @param description 角色描述
   */
  async createProjectRole(projectId: string, name: string, description: string): Promise<ApiResponse<ProjectRoleItem>> {
    return this.projectRepository.createProjectRole(projectId, name, description);
  }
}
