/**
 * 团队API的React Query Hooks
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {teamApi} from '@/adapters/api/team-api';
import {CreateTeamRequest} from '@/types/api-types';
import {ResponseCode} from '@/types/response-code';

/**
 * 团队数据查询键
 */
export const teamKeys = {
  all: ['teams'] as const,
  myTeams: () => [...teamKeys.all, 'my-teams'] as const,
  myTeamsList: (keyword?: string) => [...teamKeys.myTeams(), { keyword }] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

/**
 * Hook: 创建团队
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamRequest) => teamApi.createTeam(data),
    onSuccess: (response) => {
      // 请求成功并且响应成功
      if (response.success && (response.code === ResponseCode.OK.toString() || response.code === ResponseCode.CREATED.toString())) {
        // 创建成功后刷新团队列表
        queryClient.invalidateQueries({ queryKey: teamKeys.myTeams() });
      }
    }
  });
};

/**
 * Hook: 获取当前用户的团队列表
 * @param keyword 搜索关键词，可选
 */
export const useMyTeams = (keyword?: string) => {
  return useQuery({
    queryKey: teamKeys.myTeamsList(keyword),
    queryFn: () => teamApi.getMyTeams(keyword),
    select: (data) => data.data || [],
    // 禁用缓存，确保每次都获取最新数据
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};
