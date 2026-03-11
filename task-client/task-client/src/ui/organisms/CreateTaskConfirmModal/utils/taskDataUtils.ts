// 直接定义类型，避免从index导入
interface MainTaskResponse {
  name: string;
  description: string;
  assigneeId?: string | number;
  totalHours?: number;
  priorityScore?: number;
}

interface SubTaskResponse {
  id: string;
  name: string;
  description: string;
  assigneeId?: string | number;
  hours?: number;
  priorityScore?: number;
  dependencies?: string[];
  order?: number;
}

interface TaskSplitData {
  mainTask?: MainTaskResponse;
  subTasks?: SubTaskResponse[];
  main_task?: MainTaskResponse;
  sub_tasks?: SubTaskResponse[];
  parallelism_score?: number;
  parallel_execution_tips?: string;
}

/**
 * 转换API响应到组件需要的格式
 */
export const transformInitialData = (data: TaskSplitData) => {
  const isNew = !!data.mainTask;
  const main = ((isNew ? data.mainTask : data.main_task) ?? {}) as Partial<MainTaskResponse>;
  const subs = (isNew ? data.subTasks : data.sub_tasks) ?? [];
  
  console.log('transformInitialData - 原始数据:', {
    isNew,
    main,
    subs,
    mainAssigneeId: main.assigneeId,
    mainAssigneeIdType: typeof main.assigneeId
  });
  
  const transformedSubTasks = subs.map((s, i) => {
    console.log(`transformInitialData - 子任务 ${i}:`, {
      name: s.name,
      assigneeId: s.assigneeId,
      assigneeIdType: typeof s.assigneeId
    });
    return { ...s, dependencies: s.dependencies || [], order: i + 1 };
  });
  
  const result = {
    mainTaskName: main.name ?? '',
    mainTaskDescription: main.description ?? '',
    mainTaskAssigneeId: main.assigneeId,
    mainTaskTotalHours: main.totalHours ?? 0,
    mainTaskPriorityScore: main.priorityScore ?? 50,
    subTasks: transformedSubTasks
  };
  
  console.log('transformInitialData - 转换结果:', result);
  return result;
};

/**
 * 提取任务数据工具函数
 */
export const extractTaskData = (data: any): { mainTask: any, subTasksList: any[] } => {
  // 初始化返回值
  let mainTask: any = null;
  let subTasksList: any[] = [];
  
  // 处理可能的字符串格式
  let processedData = data;
  if (typeof data === 'string') {
    try {
      processedData = JSON.parse(data);
    } catch (e) {
      console.error('解析字符串数据失败:', e);
      return { mainTask, subTasksList };
    }
  }
  
  // 检查新API格式
  if (processedData.mainTask && Array.isArray(processedData.subTasks)) {
    mainTask = processedData.mainTask;
    subTasksList = processedData.subTasks;
  }
  // 检查旧API格式
  else if (processedData.main_task && Array.isArray(processedData.sub_tasks)) {
    mainTask = processedData.main_task;
    subTasksList = processedData.sub_tasks;
  }
  
  return { mainTask, subTasksList };
};

/**
 * 格式化子任务工具函数
 */
export const formatSubTasks = (subTasksList: any[]): SubTaskResponse[] => {
  return subTasksList.map((task, index) => ({
    id: task.id || `T${index + 1}`,
    name: task.name || '',
    description: task.description || '',
    assigneeId: task.assigneeId ? String(task.assigneeId) : undefined,
    hours: task.hours ? Number(task.hours) : 0,
    priorityScore: task.priorityScore ? Number(task.priorityScore) : 50,
    dependencies: task.dependencies || [],
    order: index + 1
  }));
};
