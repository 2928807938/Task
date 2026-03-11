import {Task} from '@/core/domain/entities/task';
import {TaskRepository} from '@/core/interfaces/repositories/task-repository';
import {ApiResponse, CreateTaskRequest, CreateTaskResponse, ProjectTask} from '@/types/api-types';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

// 内部状态存储
type TaskState = {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
};

const useTaskState = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
      })),
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// 由于仅用于本地存储的实现不需要完整的API功能，我们只实现接口需要的方法
// 但必须提供所有方法的实现以满足TypeScript类型检查
export class TaskRepositoryImpl implements TaskRepository {
  findAll(): Task[] {
    return useTaskState.getState().tasks;
  }

  save(task: Task): Task {
    useTaskState.getState().addTask(task);
    return task;
  }

  update(id: string, updates: Partial<Task>): Task | null {
    const state = useTaskState.getState();
    const task = state.tasks.find(t => t.id === id);

    if (!task) {
      return null;
    }

    state.updateTask(id, updates);
    return { ...task, ...updates };
  }

  remove(id: string): void {
    useTaskState.getState().removeTask(id);
  }

  /**
   * 获取项目任务列表（本地存储版本不需要实际实现，仅为满足接口要求）
   */
  async getProjectTasks(
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
  }>> {
    // 本地实现只返回一个空的成功响应
    return {
      success: true,
      code: '200',
      timestamp: new Date().toISOString(),
      data: {
        content: [],
        current: '1',
        size: 10,
        total: 0,
        pages: 0
      },
      message: '操作成功'
    };
  }

  /**
   * 创建任务（本地存储版本不需要实际实现，仅为满足接口要求）
   */
  async createTask(taskData: CreateTaskRequest): Promise<ApiResponse<CreateTaskResponse>> {
    // 本地实现只返回一个空的成功响应
    return {
      success: true,
      code: '200',
      timestamp: new Date().toISOString(),
      data: {
        taskId: 'local-' + Date.now().toString(),
        subTaskIds: ['1', '2', '3'] // 修复类型错误：将number改为string
      },
      message: '操作成功'
    };
  }

  /**
   * 获取任务及其子任务（本地存储版本不需要实际实现，仅为满足接口要求）
   * @param taskId 任务ID
   * @returns 任务及其子任务信息
   */
  async getTaskWithSubtasks(taskId: string): Promise<ApiResponse<any>> {
    // 本地实现只返回一个空的成功响应
    return {
      success: true,
      code: '200',
      timestamp: new Date().toISOString(),
      data: {
        taskId: taskId,
        title: '测试任务',
        subTasks: []
      },
      message: '操作成功'
    };
  }

  /**
   * 获取任务可用状态列表（本地存储版本不需要实际实现，仅为满足接口要求）
   * @param taskId 任务ID
   * @returns 任务可用的状态列表
   */
  async getTaskStatuses(taskId: string): Promise<ApiResponse<any>> {
    // 本地实现只返回一个空的成功响应
    return {
      success: true,
      code: '200',
      timestamp: new Date().toISOString(),
      data: {
        statuses: []
      },
      message: '操作成功'
    };
  }
}
