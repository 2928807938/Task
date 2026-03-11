/**
 * API模块入口文件
 * 导出所有API服务
 */
import {userApi} from './user-api';
import {ProjectApi} from './project-api';
import {teamApi} from './team-api';
import {dashboardApi} from './dashboard-api';
import {commentApi} from './comment-api';
import {ProjectRepositoryImpl} from '../repositories/project-repository-impl';

// 创建项目仓库实例
const projectRepository = new ProjectRepositoryImpl();
// 创建项目API服务实例
export const projectApi = new ProjectApi(projectRepository);

// 导出所有API服务
export const api = {
  user: userApi,
  project: projectApi,
  team: teamApi,
  dashboard: dashboardApi,
  comment: commentApi,
};

export default api;
