/**
 * 团队API服务
 * 提供与团队相关的API操作
 */
import {TeamRepositoryImpl} from '@/adapters/repositories/team-repository-impl';
import {TeamRepository} from '@/core/interfaces/repositories/team-repository';
import {ApiResponse, CreateTeamRequest, TeamInfo} from '@/types/api-types';

/**
 * 团队API服务类
 */
export class TeamApi {
  private teamRepository: TeamRepository;

  constructor() {
    this.teamRepository = new TeamRepositoryImpl();
  }

  /**
   * 创建团队
   * @param data 团队创建信息
   */
  async createTeam(data: CreateTeamRequest): Promise<ApiResponse<TeamInfo>> {
    return this.teamRepository.createTeam(data);
  }

  /**
   * 获取当前用户的团队列表
   * @param keyword 搜索关键词，可选
   */
  async getMyTeams(keyword?: string): Promise<ApiResponse<TeamInfo[]>> {
    return this.teamRepository.getMyTeams(keyword);
  }

  /**
   * 获取团队详情
   * @param id 团队ID
   */
  async getTeamById(id: string): Promise<ApiResponse<TeamInfo>> {
    return this.teamRepository.getTeamById(id);
  }
}

// 导出单例实例
export const teamApi = new TeamApi();
