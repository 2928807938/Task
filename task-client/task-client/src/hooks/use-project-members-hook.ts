import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/adapters/api';
import { ProjectMember } from '@/types/api-types';

/**
 * 项目成员数据管理 Hook
 * 提供缓存和统一的成员数据管理
 */
export const useProjectMembers = (projectId?: string) => {
  const {
    data: members = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['project', projectId, 'members'],
    queryFn: async () => {
      if (!projectId) return [];
      
      console.log('获取项目成员，projectId:', projectId);
      const response = await projectApi.getProjectMembers(projectId);
      console.log('项目成员响应:', response);
      
      if (response.success && response.data) {
        console.log('项目成员数据:', response.data);
        return response.data;
      }
      return [];
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
    gcTime: 10 * 60 * 1000, // 10分钟缓存时间
  });

  /**
   * 根据用户ID获取成员信息
   * @param userId 用户ID
   * @returns 项目成员信息或null
   */
  const getMemberById = (userId?: string): ProjectMember | null => {
    if (!userId || !members.length) {
      console.log('getMemberById: 无userId或members为空', { userId, membersLength: members.length });
      return null;
    }
    
    console.log('getMemberById: 查找用户', { 
      userId, 
      userIdType: typeof userId,
      members: members.map(m => ({ id: m.id, idType: typeof m.id, name: m.name }))
    });
    
    // 尝试多种匹配方式
    const found = members.find((member: ProjectMember) => {
      // 1. 直接字符串比较
      const directMatch = member.id === userId;
      // 2. 都转为字符串再比较
      const stringMatch = member.id.toString() === userId.toString();
      // 3. 都转为数字再比较（如果都是数字）
      const memberIdNum = Number(member.id);
      const userIdNum = Number(userId);
      const numberMatch = !isNaN(memberIdNum) && !isNaN(userIdNum) && memberIdNum === userIdNum;
      // 4. 去除字符串前后空格后比较
      const trimMatch = member.id.toString().trim() === userId.toString().trim();
      
      const anyMatch = directMatch || stringMatch || numberMatch || trimMatch;
      
      console.log('匹配检查详细:', { 
        memberName: member.name,
        memberId: member.id, 
        memberIdType: typeof member.id,
        userId,
        userIdType: typeof userId,
        directMatch,
        stringMatch,
        numberMatch,
        trimMatch,
        anyMatch
      });
      
      return anyMatch;
    });
    
    console.log('getMemberById: 查找结果', { userId, found: found ? { id: found.id, name: found.name } : null });
    return found || null;
  };

  /**
   * 获取成员映射表，便于快速查找
   * @returns 成员ID到成员信息的映射
   */
  const getMembersMap = (): Record<string, ProjectMember> => {
    const map: Record<string, ProjectMember> = {};
    members.forEach((member: ProjectMember) => {
      map[member.id.toString()] = member;
    });
    return map;
  };

  return {
    members,
    isLoading,
    error,
    refetch,
    getMemberById,
    getMembersMap
  };
};