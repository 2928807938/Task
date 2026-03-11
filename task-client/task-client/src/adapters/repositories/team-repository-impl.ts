/**
 * 团队仓库接口实现
 */
import {TeamRepository} from '@/core/interfaces/repositories/team-repository';
import httpClientImpl from '@/infrastructure/http/http-client-impl';
import {ApiResponse, CreateTeamRequest, TeamInfo} from '@/types/api-types';

// API端点常量
const API_ENDPOINTS = {
  CREATE_TEAM: '/api/client/team/create',
  GET_MY_TEAMS: '/api/client/team/my-teams',
  GET_TEAM_BY_ID: '/api/client/team'
};

/**
 * 团队仓库实现类
 */
export class TeamRepositoryImpl implements TeamRepository {
  /**
   * 创建团队
   * @param data 团队创建信息
   */
  async createTeam(data: CreateTeamRequest): Promise<ApiResponse<TeamInfo>> {
    return httpClientImpl.post<TeamInfo>(API_ENDPOINTS.CREATE_TEAM, data);
  }

  /**
   * 获取当前用户的团队列表
   * @param keyword 搜索关键词，可选
   */
  async getMyTeams(keyword?: string): Promise<ApiResponse<TeamInfo[]>> {
    const queryParams = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    return httpClientImpl.get<TeamInfo[]>(`${API_ENDPOINTS.GET_MY_TEAMS}${queryParams}`);
  }

  /**
   * 获取团队详情
   * @param id 团队ID
   */
  async getTeamById(id: string): Promise<ApiResponse<TeamInfo>> {
    return httpClientImpl.get<TeamInfo>(`${API_ENDPOINTS.GET_TEAM_BY_ID}/${id}`);
  }
}
