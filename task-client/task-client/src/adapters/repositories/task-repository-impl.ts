import {TaskRepository} from '@/core/interfaces/repositories/task-repository';
import {Task} from '@/core/domain/entities/task';
import {
    ApiResponse,
    CreateTaskRequest,
    CreateTaskResponse,
    ProjectTask,
    TaskStatusesResponse,
    TaskWithSubtasks
} from '@/types/api-types';
import httpClientImpl from '@/infrastructure/http/http-client-impl';

// API端点常量
const API_ENDPOINTS = {
  PROJECT_TASKS: (projectId: string) => `/api/client/task/${projectId}`,
  CREATE_TASK: '/api/client/task/create',
  TASK_WITH_SUBTASKS: (taskId: string) => `/api/client/task/${taskId}/with-subtasks`,
  TASK_STATUSES: (taskId: string) => `/api/client/task/${taskId}/statuses`,
};

/**
 * 任务仓库实现类
 * 实现任务相关的数据操作
 */
export class TaskRepositoryImpl implements TaskRepository {
  /**
   * 创建任务仓库实现类实例
   */
  constructor() {}

  /**
   * 查找所有任务
   * @returns 任务列表
   */
  findAll(): Task[] {
    // 这里应该是从API获取数据，但目前只返回空数组
    return [];
  }

  /**
   * 保存任务
   * @param task 要保存的任务
   * @returns 保存后的任务
   */
  save(task: Task): Task {
    // 这里应该是调用API保存任务，但目前只返回传入的任务
    return task;
  }

  /**
   * 更新任务
   * @param id 任务ID
   * @param updates 要更新的任务字段
   * @returns 更新后的任务，如果任务不存在则返回null
   */
  update(id: string, updates: Partial<Task>): Task | null {
    // 这里应该是调用API更新任务，但目前只返回null
    return null;
  }

  /**
   * 删除任务
   * @param id 要删除的任务ID
   */
  remove(id: string): void {
    // 这里应该是调用API删除任务
  }

  /**
   * 获取项目任务列表
   * @param projectId 项目ID
   * @param priority 优先级筛选条件（可选）
   * @param pageNumber 页码，从1开始（可选）
   * @param pageSize 每页记录数（可选）
   * @param taskType 任务类型，main: 只查询主任务，sub: 只查询子任务，all: 查询所有任务（可选）
   * @returns 项目任务列表响应
   */
  async getProjectTasks(
    projectId: string,
    priority?: string,
    pageNumber?: number,
    pageSize?: number,
    taskType?: 'main' | 'sub' | 'all'
  ): Promise<ApiResponse<{
    content: ProjectTask[];
    current: string;
    size: number;
    total: number;
    pages: number;
  }>> {
    // 构建URL查询参数
    const queryParams = new URLSearchParams();
    if (priority) queryParams.append('priority', priority);
    if (pageNumber) queryParams.append('pageNumber', pageNumber.toString());
    if (pageSize) queryParams.append('pageSize', pageSize.toString());
    if (taskType) queryParams.append('taskType', taskType);

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINTS.PROJECT_TASKS(projectId)}${queryString ? `?${queryString}` : ''}`;

    return httpClientImpl.get<{
      content: ProjectTask[];
      current: string;
      size: number;
      total: number;
      pages: number;
    }>(url);
  }

  /**
   * 创建任务
   * @param taskData 创建任务请求数据
   * @returns 创建任务响应
   */
  async createTask(taskData: CreateTaskRequest): Promise<ApiResponse<CreateTaskResponse>> {
    return httpClientImpl.post<CreateTaskResponse>(API_ENDPOINTS.CREATE_TASK, taskData);
  }

  /**
   * 获取任务及其子任务
   * @param taskId 任务ID
   * @returns 任务及其子任务信息
   */
  async getTaskWithSubtasks(taskId: string): Promise<ApiResponse<TaskWithSubtasks>> {
    return httpClientImpl.get<TaskWithSubtasks>(API_ENDPOINTS.TASK_WITH_SUBTASKS(taskId));
  }

  /**
   * 获取任务可用状态列表
   * @param taskId 任务ID
   * @returns 任务可用的状态列表
   */
  async getTaskStatuses(taskId: string): Promise<ApiResponse<TaskStatusesResponse>> {
    return httpClientImpl.get<TaskStatusesResponse>(API_ENDPOINTS.TASK_STATUSES(taskId));
  }
}
