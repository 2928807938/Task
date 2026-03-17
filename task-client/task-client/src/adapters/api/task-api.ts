import httpClientImpl, { API_BASE_URL, createUrl } from '@/infrastructure/http/http-client-impl';
import Cookies from 'js-cookie';
import {
    ApiResponse,
    CreateTaskRequest,
    CreateTaskResponse,
    EditTaskRequest,
    PriorityItem,
    ProjectTask,
    StatusItem,
    TaskDistributionData,
    TaskStatusesResponse,
    TaskWithSubtasks
} from '@/types/api-types';
import {
    TaskIOSVO,
    TaskIOSStatisticsVO,
    GetUserTasksParams,
    TaskFilterRequest,
    PageData,
    mapTaskToCreateRequest
} from '@/types/task-ios-types';
import {TaskRepositoryImpl} from '../repositories/task-repository-impl';

type StreamAnalyzeRequestBody = {
  projectId: string;
  content: string;
  conversationListId?: string;
};

type EventListenerMap = Record<string, EventListener[]>;

type PostEventSource = EventSource & {
  listeners: EventListenerMap;
  abortController?: AbortController;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onopen: ((event: Event) => void) | null;
};

type EventHandlerKey = 'onmessage' | 'onerror' | 'onopen';

const eventHandlerMap: Record<string, EventHandlerKey> = {
  message: 'onmessage',
  error: 'onerror',
  open: 'onopen'
};

/**
 * 获取认证令牌
 */
const getAuthToken = (): string | undefined => {
  return Cookies.get('auth_token');
};

// 创建任务仓库实例
const taskRepository = new TaskRepositoryImpl();

/**
 * 任务API服务
 */
export const taskApi = {
  /**
   * 流式分析任务需求
   * 使用POST请求支持更长上下文与多轮会话参数
   * @param projectId 项目ID
   * @param content 需求内容
   * @param conversationListId 会话ID（可选，多轮分析时复用）
   * @returns 返回一个EventSource实例
   */
  streamAnalyzeTask: (projectId: string, content: string, conversationListId?: string | null): EventSource => {
    // 获取认证令牌
    const token = getAuthToken();

    // 构建请求URL，仅将token放在query中保持兼容
    const endpoint = `/api/client/task/analyze/stream${token ? `?token=${token}` : ''}`;
    const baseUrl = createUrl(endpoint);

    // 注意：conversationListId 可能超过 JS 安全整数范围，必须按字符串透传，避免精度丢失
    const requestBody: StreamAnalyzeRequestBody = {
      projectId,
      content
    };

    if (conversationListId && String(conversationListId).trim()) {
      requestBody.conversationListId = String(conversationListId).trim();
    }

    return taskApi._createPostEventSource(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(requestBody)
    }) as EventSource;
  },

  /**
   * 创建一个类似EventSource的对象，支持POST请求
   * 这是一个私有辅助方法，用于内部实现
   * @param url 请求URL
   * @param options 请求选项
   * @returns 返回一个类似EventSource的对象
   */
  _createPostEventSource(url: string, options: RequestInit = {}): PostEventSource {
    // 创建一个自定义对象，模拟EventSource的API
    const eventSource = {
      listeners: {} as EventListenerMap,
      addEventListener: function(type: string, listener: EventListener) {
        if (!this.listeners[type]) {
          this.listeners[type] = [];
        }
        this.listeners[type].push(listener);
      },
      removeEventListener: function(type: string, listener: EventListener) {
        if (!this.listeners[type]) {
          return;
        }
        const index = this.listeners[type].indexOf(listener);
        if (index !== -1) {
          this.listeners[type].splice(index, 1);
        }
      },
      dispatchEvent: function(event: Event) {
        const listeners = this.listeners[event.type] || [];
        for (const listener of listeners) {
          listener(event);
        }
        const handlerKey = eventHandlerMap[event.type];
        const onHandler = handlerKey ? this[handlerKey] : null;
        if (onHandler && typeof onHandler === 'function') {
          onHandler(event);
        }
        return !event.defaultPrevented;
      },
      close: function() {
        if (this.abortController) {
          this.abortController.abort();
        }
        const closeEvent = new Event('close');
        this.dispatchEvent(closeEvent);
        this.listeners = {};
        this.onmessage = null;
        this.onerror = null;
        this.onopen = null;
        this.readyState = 2; // CLOSED
      },
      readyState: 0, // CONNECTING
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      onopen: null as ((event: Event) => void) | null,
      CONNECTING: 0,
      OPEN: 1,
      CLOSED: 2
    } as PostEventSource;

    // 创建AbortController来控制取消请求
    const abortController = new AbortController();
    eventSource.abortController = abortController;

    // 执行fetch请求
    fetch(url, {
      ...options,
      signal: abortController.signal,
      headers: {
        ...options.headers,
        'Accept': 'text/event-stream',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      eventSource.readyState = 1; // OPEN
      const openEvent = new Event('open');
      eventSource.dispatchEvent(openEvent);

      // 读取流式响应
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      function readStream() {
        reader.read().then(({ done, value }) => {
          if (done) {
            eventSource.readyState = 2; // CLOSED
            const closeEvent = new Event('close');
            eventSource.dispatchEvent(closeEvent);
            return;
          }

          // 解码数据并添加到缓冲区
          buffer += decoder.decode(value, { stream: true });

          // 处理收到的数据
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 最后一行可能不完整，保留到缓冲区

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue; // 忽略空行

            // 检查是否是数据行
            if (trimmedLine.startsWith('data:')) {
              const data = trimmedLine.slice(5).trim();
              // 创建MessageEvent
              const messageEvent = new MessageEvent('message', { data });
              eventSource.dispatchEvent(messageEvent);
            }
          }

          // 继续读取数据
          readStream();
        }).catch(err => {
          // 只在非用户取消时报错
          if (err.name !== 'AbortError') {
            const errorEvent = new Event('error');
            eventSource.dispatchEvent(errorEvent);
            eventSource.readyState = 2; // CLOSED
          }
        });
      }

      readStream();
    })
    .catch(err => {
      // 只在非用户取消时报错
      if (err.name !== 'AbortError') {
        const errorEvent = new Event('error');
        eventSource.dispatchEvent(errorEvent);
        eventSource.readyState = 2; // CLOSED
      }
    });

    return eventSource;
  },

  /**
   * 流式分配任务 (使用POST请求)
   * 注意：由于参数较长，我们使用POST请求，并将参数放在请求体中
   * @param projectId 项目ID
   * @param description 任务分配描述，字符串或对象
   * @returns 返回一个类似EventSource的对象
   */
  streamAssignTask: (projectId: string, description: string | object): EventSource => {
    // 获取认证令牌
    const token = getAuthToken();

    // 处理description参数，确保它是一个字符串
    const descriptionStr = typeof description === 'object'
      ? JSON.stringify(description)
      : description;

    // 构建请求URL，只将token作为查询参数
    const endpoint = `/api/client/task/assign/stream${token ? `?token=${token}` : ''}`;
    const baseUrl = createUrl(endpoint);

    // 创建请求体，使用JSON格式
    const requestBody = {
      projectId: projectId,
      description: descriptionStr
    };

    // 使用自定义的_createPostEventSource方法创建支持POST的EventSource
    return taskApi._createPostEventSource(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
  },

  /**
   * 使用主任务描述内容进行流式任务分配
   * 这是一个便捷方法，专门用于处理主任务描述对象格式
   * @param projectId 项目ID
   * @param mainTaskDescription 主任务描述
   * @returns 返回一个EventSource实例
   */
  streamAssignTaskWithMainTaskDescription: (projectId: string, mainTaskDescription: string): EventSource => {
    const descriptionObj = {
      content: mainTaskDescription.trim()
    };
    return taskApi.streamAssignTask(projectId, descriptionObj);
  },

  /**
   * 使用原始任务描述进行流式任务分配
   * 这是一个便捷方法，专门用于处理原始任务描述文本
   * @param projectId 项目ID
   * @param rawDescription 原始任务描述文本
   * @returns 返回一个EventSource实例
   */
  streamAssignTaskWithRawDescription: (projectId: string, rawDescription: string): EventSource => {
    // 直接使用去除前后空格的原始描述文本
    return taskApi.streamAssignTask(projectId, rawDescription.trim());
  },

  /**
   * 获取项目任务列表
   * @param projectId 项目ID
   * @param priority 优先级筛选条件（可选）
   * @param pageNumber 页码，从1开始（可选）
   * @param pageSize 每页记录数（可选）
   * @param taskType 任务类型，main: 只查询主任务，sub: 只查询子任务，all: 查询所有任务（可选）
   * @returns 项目任务列表响应
   */
  getProjectTasks: async (
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
  }>> => {
    return taskRepository.getProjectTasks(projectId, priority, pageNumber, pageSize, taskType);
  },

  /**
   * 创建任务
   * @param taskData 创建任务请求数据
   * @returns 创建任务响应
   */
  createTask: async (taskData: CreateTaskRequest): Promise<ApiResponse<CreateTaskResponse>> => {
    return taskRepository.createTask(taskData);
  },

  /**
   * 获取项目任务分布数据
   * @param projectId 项目ID
   * @returns 任务分布数据响应
   */
  getTaskDistribution: async (projectId: string): Promise<ApiResponse<TaskDistributionData>> => {
    const token = getAuthToken();
    return httpClientImpl.get<TaskDistributionData>(`/api/client/project/${projectId}/task-distribution`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  },

  /**
   * 获取项目状态列表
   * @param projectId 项目ID
   * @returns 项目状态列表响应
   */
  getProjectStatusList: async (projectId: string): Promise<ApiResponse<StatusItem[]>> => {
    const token = getAuthToken();
    return httpClientImpl.get<StatusItem[]>(`/api/client/project/${projectId}/status/list`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  },

  /**
   * 获取项目优先级列表
   * @param projectId 项目ID
   * @returns 项目优先级列表响应
   */
  getProjectPriorityList: async (projectId: string): Promise<ApiResponse<PriorityItem[]>> => {
    const token = getAuthToken();
    return httpClientImpl.get<PriorityItem[]>(`/api/client/project/${projectId}/priority/list`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  },

  /**
   * 获取任务及其子任务
   * @param taskId 任务ID
   * @returns 任务及其子任务信息
   */
  getTaskWithSubtasks: async (taskId: string): Promise<ApiResponse<TaskWithSubtasks>> => {
    return taskRepository.getTaskWithSubtasks(taskId);
  },

  /**
   * 更新任务信息
   * @param taskId 任务ID
   * @param taskData 更新的任务数据
   * @returns 更新结果
   */
  updateTask: async (taskId: string, taskData: Partial<ProjectTask>): Promise<ApiResponse<ProjectTask>> => {
    const token = getAuthToken();
    // 直接使用httpClient.put方法，并启用通知功能
    return httpClientImpl.put<ProjectTask>(`/api/client/task/${taskId}`, taskData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      showNotification: true,
      fallbackMessage: '任务更新操作'
    });
  },

  /**
   * 编辑任务信息
   * @param taskData 编辑任务请求数据
   * @returns 编辑结果
   */
  editTask: async (taskData: EditTaskRequest): Promise<ApiResponse<null>> => {
    const token = getAuthToken();
    // 直接使用httpClient.post方法，并启用通知功能
    return httpClientImpl.post<null>(`/api/client/task/edit`, taskData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      showNotification: true,
      fallbackMessage: '任务编辑操作'
    });
  },

  /**
   * 获取任务可用状态列表
   * @param taskId 任务ID
   * @returns 任务可用的状态列表
   */
  getTaskStatuses: async (taskId: string): Promise<ApiResponse<TaskStatusesResponse>> => {
    return taskRepository.getTaskStatuses(taskId);
  },

  /**
   * 更新任务状态
   * @param taskId 任务ID
   * @param statusId 新的状态ID
   * @returns 更新结果
   */
  updateTaskStatus: async (taskId: string, statusId: string): Promise<ApiResponse<null>> => {
    const token = getAuthToken();
    return httpClientImpl.post<null>(`/api/client/task/${taskId}/status`, { statusId }, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      showNotification: true, // 显示操作结果通知
      fallbackMessage: '任务状态更新'
    });
  },

};
