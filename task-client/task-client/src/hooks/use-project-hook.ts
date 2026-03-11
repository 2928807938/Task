import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {projectApi} from '@/adapters/api';
import {
    AddProjectMemberRequest,
    CreateProjectRequest,
    ProjectDetailResponse,
    ProjectInfo,
    ProjectMember,
    ProjectPageRequest,
    ProjectPageResponse,
    ProjectRoleItem,
    ProjectTask
} from '@/types/api-types';
import {useToast} from '@/ui/molecules/Toast';

/**
 * 项目API React Query Hooks
 * 提供项目相关的操作钩子
 */
export const useProjectHook = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  /**
   * 创建项目的Hook
   */
  const useCreateProject = () => {
    return useMutation<ProjectInfo, Error, CreateProjectRequest>({
      mutationFn: async (request: CreateProjectRequest) => {
        const response = await projectApi.createProject(request);
        if (!response.success) {
          throw new Error(response.message || '创建项目失败');
        }
        return response.data!;
      },
      onSuccess: () => {
        // 创建成功后刷新项目列表
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        addToast('项目已成功创建', 'success');
      },
      onError: (error) => {
        addToast(error.message || '创建项目时发生错误', 'error');
      },
    });
  };

  /**
   * 获取当前用户的项目列表（分页）
   * @param request 分页和筛选参数
   */
  const useGetCurrentUserProjects = (request: ProjectPageRequest) => {
    return useQuery<ProjectPageResponse, Error>({
      queryKey: ['projects', request],
      queryFn: async () => {
        const response = await projectApi.getCurrentUserProjects(request);

        if (!response.success) {
          throw new Error(response.message || '获取项目列表失败');
        }

        // 确保数据结构正确
        const responseData = response.data || {};

        // 根据实际返回的数据结构进行转换
        const result: ProjectPageResponse = {
          total: 'total' in responseData ? Number(responseData.total) : 0,
          pages: 'pages' in responseData ? Number(responseData.pages) : 0,
          content: 'content' in responseData && Array.isArray(responseData.content) ? responseData.content : []
        };

        return result;
      },
      staleTime: 0, // 禁用缓存，每次都获取最新数据
    });
  };

  /**
   * 删除项目的Hook
   */
  const useDeleteProject = () => {
    return useMutation<void, Error, string>({
      mutationFn: async (id: string) => {
        const response = await projectApi.deleteProject(id);
        if (!response.success) {
          throw new Error(response.message || '删除项目失败');
        }
      },
      onSuccess: () => {
        // 删除成功后刷新项目列表
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        addToast('项目已成功删除', 'success');
      },
      onError: (error) => {
        addToast(error.message || '删除项目时发生错误', 'error');
      },
    });
  };

  /**
   * 修改项目信息的Hook
   */
  const useUpdateProject = () => {
    return useMutation<void, Error, { id: string; name: string; description: string }>({
      mutationFn: async ({ id, name, description }: { id: string; name: string; description: string }) => {
        // 按照接口文档，使用GET请求并在URL中添加名称和描述参数
        const response = await projectApi.updateProject(id, name, description);
        if (!response.success) {
          throw new Error(response.message || '修改项目信息失败');
        }
      },
      onSuccess: (_, variables) => {
        // 操作成功后刷新项目列表和项目详情
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        // 使指定项目的详情缓存失效，确保下次获取时能看到最新状态
        queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
        addToast('修改项目信息成功', 'success');
      },
      onError: (error: Error) => {
        addToast(error.message || '修改项目信息时发生错误', 'error');
      }
    });
  };

  /**
   * 获取项目详情的Hook
   * @param id 项目ID
   */
  const useGetProjectDetail = (id: string) => {
    return useQuery<ProjectDetailResponse, Error>({
      queryKey: ['project', id],
      queryFn: async () => {
        if (!id) {
          throw new Error('项目ID不能为空');
        }

        const response = await projectApi.getProjectDetail(id);

        if (!response.success) {
          throw new Error(response.message || '获取项目详情失败');
        }

        return response.data!;
      },
      staleTime: 5 * 60 * 1000, // 设置5分钟的缓存时间
      gcTime: 10 * 60 * 1000, // 设置10分钟的垃圾回收时间
      refetchOnWindowFocus: false, // 禁止窗口获取焦点时重新获取
      refetchOnReconnect: false, // 禁止网络重连时重新获取
      enabled: !!id, // 只有当id存在时才执行查询
    });
  };

  /**
   * 获取项目任务树的Hook
   * @param projectId 项目ID
   */
  const useGetProjectTaskTree = (projectId: string) => {
    return useQuery<ProjectTask[], Error>({
      queryKey: ['project', projectId, 'taskTree'],
      queryFn: async () => {
        if (!projectId) {
          throw new Error('项目ID不能为空');
        }

        const response = await projectApi.getProjectTaskTree(projectId);

        if (!response.success) {
          throw new Error(response.message || '获取项目任务树失败');
        }

        return response.data || [];
      },
      staleTime: 0, // 禁用缓存，每次都获取最新数据
      enabled: !!projectId, // 只有当projectId存在时才执行查询
    });
  };

  /**
   * 获取项目成员列表的Hook
   * @param projectId 项目ID
   * @param memberName 成员名称（可选，用于模糊搜索）
   */
  const useGetProjectMembers = (projectId: string, memberName?: string) => {
    return useQuery<ProjectMember[], Error>({
      queryKey: ['project', projectId, 'members', memberName],
      queryFn: async () => {
        if (!projectId) {
          throw new Error('项目ID不能为空');
        }

        const response = await projectApi.getProjectMembers(projectId, memberName);

        if (!response.success) {
          throw new Error(response.message || '获取项目成员列表失败');
        }

        return response.data || [];
      },
      staleTime: 0, // 禁用缓存，每次都获取最新数据
      enabled: !!projectId, // 只有当projectId存在时才执行查询
    });
  };

  /**
   * 更改项目归档状态的Hook
   */
  const useChangeArchiveStatus = () => {
    return useMutation<void, Error, { id: string; archived: boolean; reason?: string }>({
      mutationFn: async ({ id, archived, reason }: { id: string; archived: boolean; reason?: string }) => {
        const response = await projectApi.changeArchiveStatus(id, archived, reason);
        if (!response.success) {
          throw new Error(response.message || (archived ? '归档项目失败' : '取消归档项目失败'));
        }
      },
      onSuccess: (_, variables) => {
        // 操作成功后刷新项目列表和项目详情
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        // 使指定项目的详情缓存失效，确保下次获取时能看到最新状态
        queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
        addToast('修改归档状态成功', 'success');
      },
      onError: (error: Error) => {
        addToast(error.message || '更改项目归档状态时发生错误', 'error');
      }
    });
  };

  /**
   * 移除项目成员的Hook
   */
  const useRemoveProjectMember = () => {
    return useMutation<void, Error, { projectId: string; memberId: string }>({
      mutationFn: async ({ projectId, memberId }) => {
        const response = await projectApi.removeProjectMember(projectId, memberId);
        if (!response.success) {
          throw new Error(response.message || '移除项目成员失败');
        }
      },
      onSuccess: (_, { projectId }) => {
        // 移除成功后刷新项目成员列表
        queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] });
        addToast('成员已成功移除', 'success');
      },
      onError: (error) => {
        addToast(error.message || '移除项目成员时发生错误', 'error');
      },
    });
  };

  /**
   * 添加项目成员的Hook
   */
  const useAddProjectMember = () => {
    return useMutation<void, Error, AddProjectMemberRequest>({
      mutationFn: async (request: AddProjectMemberRequest) => {
        const response = await projectApi.addProjectMember(request);
        if (!response.success) {
          throw new Error(response.message || '添加项目成员失败');
        }
      },
      onSuccess: (_, variables) => {
        // 添加成功后清除项目成员缓存
        queryClient.invalidateQueries({ queryKey: ['project', variables.projectId, 'members'] });
        // 使项目详情缓存失效，确保下次获取时能看到最新的成员信息
        queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
        addToast('添加项目成员成功', 'success');
      },
      onError: (error: Error) => {
        addToast(error.message || '添加项目成员时发生错误', 'error');
      }
    });
  };

  /**
   * 获取项目角色列表的Hook
   * @param projectId 项目ID
   */
  const useGetProjectRoles = (projectId: string) => {
    return useQuery<ProjectRoleItem[], Error>({
      queryKey: ['project', projectId, 'roles'],
      queryFn: async () => {
        if (!projectId) {
          throw new Error('项目ID不能为空');
        }

        const response = await projectApi.getProjectRoles(projectId);

        if (!response.success) {
          throw new Error(response.message || '获取项目角色列表失败');
        }

        return response.data || [];
      },
      staleTime: 0, // 禁用缓存，每次调用都重新获取数据
      gcTime: 0, // 不保存到缓存
      refetchOnMount: 'always', // 组件挂载时总是重新获取
      refetchOnWindowFocus: true, // 窗口获取焦点时重新获取
      enabled: !!projectId, // 只有当projectId存在时才执行查询
    });
  };

  /**
   * 创建项目角色的Hook
   */
  const useCreateProjectRole = () => {
    return useMutation<ProjectRoleItem, Error, {projectId: string; name: string; description: string}>({
      mutationFn: async ({ projectId, name, description }) => {
        if (!projectId) {
          throw new Error('项目ID不能为空');
        }
        if (!name.trim()) {
          throw new Error('角色名称不能为空');
        }

        const response = await projectApi.createProjectRole(projectId, name, description);

        if (!response.success) {
          throw new Error(response.message || '创建角色失败');
        }

        return response.data!;
      },
      onSuccess: (data, variables) => {
        // 创建成功后刷新角色列表
        queryClient.invalidateQueries({ queryKey: ['project', variables.projectId, 'roles'] });
        addToast(`角色 "${data.name}" 创建成功`, 'success');
      },
      onError: (error: Error) => {
        addToast(error.message || '创建角色时发生错误', 'error');
      }
    });
  };

  return {
    useCreateProject,
    useGetCurrentUserProjects,
    useDeleteProject,
    useGetProjectDetail,
    useGetProjectTaskTree,
    useGetProjectRoles,
    useCreateProjectRole,
    useGetProjectMembers,
    useChangeArchiveStatus,
    useUpdateProject,
    useAddProjectMember,
    useRemoveProjectMember,
  };
};

export default useProjectHook;
