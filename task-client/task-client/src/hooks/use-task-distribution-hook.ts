import {useQuery} from '@tanstack/react-query';
import {taskApi} from '@/adapters/api/task-api';
import {TaskDistributionData} from '@/types/api-types';

/**
 * 获取项目任务分布数据的Hook
 * @param projectId 项目ID
 * @returns 任务分布数据查询结果
 */
export function useTaskDistributionHook(projectId: string | undefined) {
  return useQuery<TaskDistributionData>({
    queryKey: ['taskDistribution', projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error('项目ID未提供');
      }

      const response = await taskApi.getTaskDistribution(projectId);

      if (!response.success || !response.data) {
        throw new Error(response.message || '获取任务分布数据失败');
      }

      return response.data;
    },
    enabled: !!projectId, // 只有在projectId存在时才执行查询
    staleTime: 60 * 1000, // 1分钟后数据过期
  });
}
