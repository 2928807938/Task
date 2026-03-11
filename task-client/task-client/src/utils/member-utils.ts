import {ProjectMember} from '@/types/api-types';
import type {TeamMember} from '@/ui/organisms/ProjectDetailComponents/ProjectTeamPanelAppleStyle';

/**
 * 将ProjectMember类型转换为TeamMember类型
 * @param projectMember 项目成员信息
 * @returns 适配后的团队成员信息
 */
export const projectMemberToTeamMember = (projectMember: ProjectMember): TeamMember => {
  return {
    id: projectMember.id,
    name: projectMember.name,
    role: projectMember.role || '', // 确保role有值
    email: projectMember.email,
    avatar: projectMember.avatar,
    joinDate: projectMember.joinedAt,
    status: 'active', // 默认设置为活跃状态
    // department未在ProjectMember中定义，设为空值
  };
};

/**
 * 将ProjectMember数组转换为TeamMember数组
 * @param projectMembers 项目成员列表
 * @returns 适配后的团队成员列表
 */
export const projectMembersToTeamMembers = (projectMembers: ProjectMember[]): TeamMember[] => {
  if (!projectMembers || !Array.isArray(projectMembers)) {
    return [];
  }

  return projectMembers.map(projectMemberToTeamMember);
};
