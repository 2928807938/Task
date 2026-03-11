import {ApiResponse, CreateTeamRequest, TeamInfo} from '@/types/api-types';

/**
 * 团队仓库接口
 * 定义与团队相关的数据操作方法
 */
export interface TeamRepository {
  /**
   * 创建团队
   * @param data 团队创建信息
   */
  createTeam(data: CreateTeamRequest): Promise<ApiResponse<TeamInfo>>;

  /**
   * 获取当前用户的团队列表
   * @param keyword 搜索关键词，可选
   */
  getMyTeams(keyword?: string): Promise<ApiResponse<TeamInfo[]>>;

  /**
   * 获取团队详情
   * @param id 团队ID
   */
  getTeamById(id: string): Promise<ApiResponse<TeamInfo>>;
}
