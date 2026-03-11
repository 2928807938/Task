import {ProjectRepository, ProjectRoleItem} from '@/core/interfaces/repositories/project-repository';
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
import httpClientImpl from '@/infrastructure/http/http-client-impl';

// API端点常量
const API_ENDPOINTS = {
  CREATE_PROJECT: '/api/client/project/create',
  CURRENT_USER_PROJECTS: '/api/client/project/currentUserPage',
  DELETE_PROJECT: '/api/client/project/delete',
  ARCHIVE_PROJECT: '/api/client/project/{id}/archive-status',
  DELETE_PROJECT_BY_ID: (id: string) => `/api/client/project/delete/${id}`,
  PROJECT_DETAIL: (id: string) => `/api/client/project/detail/${id}`,
  PROJECT_TASK_TREE: (id: string) => `/api/client/project/${id}/tasks/tree`,
  UPDATE_PROJECT: (id: string) => `/api/client/project/${id}/update`,
  PROJECT_MEMBERS: (projectId: string, memberName?: string) => {
    const url = `/api/client/project/members?projectId=${projectId}`;
    return memberName ? `${url}&memberName=${encodeURIComponent(memberName)}` : url;
  },
  ADD_PROJECT_MEMBER: '/api/client/project/member/add',
  REMOVE_PROJECT_MEMBER: (projectId: string) => `/api/client/project/removeMember/${projectId}`,
  // 项目角色列表端点
  PROJECT_ROLES: (projectId: string) => `/api/client/project/${projectId}/roles`,
  // 创建项目角色端点
  CREATE_PROJECT_ROLE: (projectId: string) => `/api/client/project/${projectId}/role/create`
};

/**
 * 项目仓库实现类
 * 实现项目相关的数据操作
 */
export class ProjectRepositoryImpl implements ProjectRepository {
  /**
   * 创建项目仓库实现类实例
   */
  constructor() {}

  /**
   * 创建项目
   * @param request 创建项目请求参数
   */
  async createProject(request: CreateProjectRequest): Promise<ApiResponse<ProjectInfo>> {
    return httpClientImpl.post<ProjectInfo>(API_ENDPOINTS.CREATE_PROJECT, request);
  }

  /**
   * 获取当前用户的项目列表（分页）
   * @param request 分页和筛选参数
   */
  async getCurrentUserProjects(request: ProjectPageRequest): Promise<ApiResponse<ProjectPageResponse>> {
    // 将请求参数转换为URL查询字符串
    const queryParams = new URLSearchParams();
    if(request.pageNum) queryParams.append('pageNum', request.pageNum.toString());
    if(request.pageSize) queryParams.append('pageSize', request.pageSize.toString());
    if(request.name) queryParams.append('name', request.name);
    if(request.sortField) queryParams.append('sortField', request.sortField);
    if(request.sortOrder) queryParams.append('sortOrder', request.sortOrder);

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINTS.CURRENT_USER_PROJECTS}${queryString ? `?${queryString}` : ''}`;

    return httpClientImpl.get<ProjectPageResponse>(url);
  }

  /**
   * 删除项目
   * @param id 项目的ID
   */
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    const url = API_ENDPOINTS.DELETE_PROJECT_BY_ID(id);
    return httpClientImpl.post<void>(url);
  }

  /**
   * 获取项目详情
   * @param id 项目的ID
   */
  async getProjectDetail(id: string): Promise<ApiResponse<ProjectDetailResponse>> {
    const url = API_ENDPOINTS.PROJECT_DETAIL(id);
    return httpClientImpl.get<ProjectDetailResponse>(url);
  }

  /**
   * 获取项目任务树
   * @param projectId 项目的ID
   */
  async getProjectTaskTree(projectId: string): Promise<ApiResponse<ProjectTask[]>> {
    const url = API_ENDPOINTS.PROJECT_TASK_TREE(projectId);
    return httpClientImpl.get<ProjectTask[]>(url);
  }

  /**
   * 获取项目成员列表
   * @param projectId 项目的ID
   * @param memberName 成员名称（可选，用于模糊搜索）
   */
  async getProjectMembers(projectId: string, memberName?: string): Promise<ApiResponse<ProjectMember[]>> {
    const url = API_ENDPOINTS.PROJECT_MEMBERS(projectId, memberName);
    return httpClientImpl.get<ProjectMember[]>(url);
  }

  /**
   * 更改项目归档状态（归档或取消归档）
   * @param id 项目的ID
   * @param archived 是否归档
   * @param reason 归档或取消归档的原因
   */
  async changeArchiveStatus(id: string, archived: boolean, reason?: string): Promise<ApiResponse<void>> {
    const url = API_ENDPOINTS.ARCHIVE_PROJECT.replace('{id}', id);
    return httpClientImpl.post<void>(url, { archived, reason });
  }

  /**
   * 修改项目信息
   * @param id 项目的ID
   * @param name 新的项目名称
   * @param description 新的项目描述
   */
  async updateProject(id: string, name: string, description: string): Promise<ApiResponse<void>> {
    const url = API_ENDPOINTS.UPDATE_PROJECT(id);
    // 将name和description参数放在请求体中
    return httpClientImpl.post<void>(url, { name, description });
  }

  /**
   * 添加项目成员
   * @param request 添加成员请求参数
   */
  async addProjectMember(request: AddProjectMemberRequest): Promise<ApiResponse<void>> {
    // 使用正确的 API 端点格式
    const url = `/api/client/project/addMember/${request.projectId}`;
    return httpClientImpl.post<void>(url, {
      userId: request.userId,
      role: request.role
    });
  }

  /**
   * 获取项目角色列表
   * @param projectId 项目的ID
   */
  async getProjectRoles(projectId: string): Promise<ApiResponse<ProjectRoleItem[]>> {
    const url = API_ENDPOINTS.PROJECT_ROLES(projectId);
    return httpClientImpl.get<ProjectRoleItem[]>(url);
  }

  /**
   * 移除项目成员
   * @param projectId 项目的ID
   * @param memberId 成员的ID
   */
  async removeProjectMember(projectId: string, memberId: string): Promise<ApiResponse<void>> {
    const url = API_ENDPOINTS.REMOVE_PROJECT_MEMBER(projectId);
    return httpClientImpl.post<void>(url, { userId: memberId });
  }

  /**
   * 创建项目角色
   * @param projectId 项目的ID
   * @param name 角色名称
   * @param description 角色描述
   */
  async createProjectRole(projectId: string, name: string, description: string): Promise<ApiResponse<ProjectRoleItem>> {
    const url = API_ENDPOINTS.CREATE_PROJECT_ROLE(projectId);
    return httpClientImpl.post<ProjectRoleItem>(url, { name, description });
  }
}
