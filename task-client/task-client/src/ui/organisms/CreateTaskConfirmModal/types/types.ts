/**
 * CreateTaskConfirmModal组件类型定义
 * 统一管理组件相关的类型定义，避免重复定义导致的类型冲突
 */

// 主任务响应类型
export interface MainTaskResponse {
  name: string;
  description: string;
  assigneeId?: string; // 统一使用字符串类型，避免精度丢失
  totalHours?: number;
  priorityScore?: number;
}

// 子任务响应类型
export interface SubTaskResponse {
  id: string;
  name: string;
  description: string;
  assigneeId?: string; // 统一使用字符串类型，避免精度丢失
  hours?: number;
  priorityScore?: number;
  dependencies?: string[];
}

// 子任务扩展类型（包含顺序信息）
export interface SubTaskWithOrder extends SubTaskResponse {
  order?: number;
}

// 任务拆分数据结构
export interface TaskSplitData {
  mainTask?: MainTaskResponse;         // 新接口
  subTasks?: SubTaskResponse[];        // 新接口
  main_task?: MainTaskResponse;        // 旧接口兼容
  sub_tasks?: SubTaskResponse[];       // 旧接口兼容
  parallelism_score?: number;
  parallel_execution_tips?: string;
}

// 创建任务的数据结构
export interface CreateTaskData {
  name: string;
  description: string;
  assigneeId?: string;
  totalHours: number;
  priorityScore: number;
  endTime?: string; // 截止时间 (ISO-8601格式)
  subTasks?: SubTaskResponse[];
}

// 模态框属性
export interface CreateTaskConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (data: CreateTaskData) => Promise<void> | void;
  projectId?: string;
  initialData?: TaskSplitData;
  onAnalysisComplete?: (data: any) => void;
}

// 表单钩子属性
export interface UseTaskFormProps {
  streamingData: TaskSplitData | null;
  streamingComplete: boolean;
  onConfirm: (data: CreateTaskData) => Promise<void> | void;
  onClose: () => void;
}
