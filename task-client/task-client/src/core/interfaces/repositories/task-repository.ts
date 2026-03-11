import {Task} from '@/core/domain/entities/task';
import {
    ApiResponse,
    CreateTaskRequest,
    CreateTaskResponse,
    ProjectTask,
    TaskStatusesResponse,
    TaskWithSubtasks
} from '@/types/api-types';

export interface TaskRepository {
  findAll(): Task[];
  save(task: Task): Task;
  update(id: string, updates: Partial<Task>): Task | null;
  remove(id: string): void;

  /**
   * 获取项目任务列表
   * @param projectId 项目ID
   * @param priority 优先级筛选条件（可选）
   * @param pageNumber 页码，从1开始（可选）
   * @param pageSize 每页记录数（可选）
   */
  getProjectTasks(
    projectId: string,
    priority?: string,
    pageNumber?: number,
    pageSize?: number
  ): Promise<ApiResponse<{
    content: ProjectTask[];
    current: string;
    size: number;
    total: number;
    pages: number;
  }>>;

  /**
   * 创建任务
   * @param taskData 创建任务请求数据
   * @returns 创建任务响应
   */
  createTask(taskData: CreateTaskRequest): Promise<ApiResponse<CreateTaskResponse>>;

  /**
   * 获取任务及其子任务
   * @param taskId 任务ID
   * @returns 任务及其子任务信息
   */
  getTaskWithSubtasks(taskId: string): Promise<ApiResponse<TaskWithSubtasks>>;

  /**
   * 获取任务可用状态列表
   * @param taskId 任务ID
   * @returns 任务可用的状态列表
   */
  getTaskStatuses(taskId: string): Promise<ApiResponse<TaskStatusesResponse>>;
}
