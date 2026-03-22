import httpClientImpl from '@/infrastructure/http/http-client-impl';
import {ApiResponse} from '@/types/api-types';
import {
  LlmPromptConfig,
  LlmPromptConflictCheckRequest,
  LlmPromptConflictCheckResult,
  LlmPromptHitLog,
  LlmPromptHitLogPageRequest,
  LlmPromptPageData,
  LlmPromptPageRequest,
  LlmPromptPreview,
  LlmPromptPreviewRequest,
  SaveLlmPromptRequest,
} from '@/types/llm-prompt-types';

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const createPromptPageQuery = (request: LlmPromptPageRequest) => buildQueryString({
  pageNumber: request.pageNumber ?? 0,
  pageSize: request.pageSize ?? 10,
  promptName: request.promptName,
  status: request.status,
});

const createHitLogPageQuery = (request: LlmPromptHitLogPageRequest) => buildQueryString({
  pageNumber: request.pageNumber ?? 0,
  pageSize: request.pageSize ?? 10,
  sceneKey: request.sceneKey,
  analysisRequestId: request.analysisRequestId,
});

export const llmPromptApi = {
  getCurrentUserPrompts: async (
    request: LlmPromptPageRequest = {}
  ): Promise<ApiResponse<LlmPromptPageData<LlmPromptConfig>>> => {
    return httpClientImpl.get(`/api/client/llm-prompt/user/page${createPromptPageQuery(request)}`);
  },

  createCurrentUserPrompt: async (
    request: SaveLlmPromptRequest
  ): Promise<ApiResponse<LlmPromptConfig>> => {
    return httpClientImpl.post('/api/client/llm-prompt/user/create', request, {
      showNotification: true,
      fallbackMessage: '创建用户级提示词'
    });
  },

  updateCurrentUserPrompt: async (
    id: string,
    request: SaveLlmPromptRequest
  ): Promise<ApiResponse<LlmPromptConfig>> => {
    return httpClientImpl.post(`/api/client/llm-prompt/user/update/${id}`, request, {
      showNotification: true,
      fallbackMessage: '更新用户级提示词'
    });
  },

  deleteCurrentUserPrompt: async (id: string): Promise<ApiResponse<void>> => {
    return httpClientImpl.post(`/api/client/llm-prompt/user/delete/${id}`, undefined, {
      showNotification: true,
      fallbackMessage: '删除用户级提示词'
    });
  },

  previewCurrentUserPrompt: async (
    request: LlmPromptPreviewRequest
  ): Promise<ApiResponse<LlmPromptPreview>> => {
    return httpClientImpl.post('/api/client/llm-prompt/user/preview', request);
  },

  inspectCurrentUserPromptConflicts: async (
    request: LlmPromptConflictCheckRequest = {}
  ): Promise<ApiResponse<LlmPromptConflictCheckResult>> => {
    return httpClientImpl.post('/api/client/llm-prompt/user/conflicts', request);
  },

  getCurrentUserHitLogs: async (
    request: LlmPromptHitLogPageRequest = {}
  ): Promise<ApiResponse<LlmPromptPageData<LlmPromptHitLog>>> => {
    return httpClientImpl.get(`/api/client/llm-prompt/user/hit-log/page${createHitLogPageQuery(request)}`);
  },

  getProjectPrompts: async (
    projectId: string,
    request: LlmPromptPageRequest = {}
  ): Promise<ApiResponse<LlmPromptPageData<LlmPromptConfig>>> => {
    return httpClientImpl.get(`/api/client/llm-prompt/project/${projectId}/page${createPromptPageQuery(request)}`);
  },

  createProjectPrompt: async (
    projectId: string,
    request: SaveLlmPromptRequest
  ): Promise<ApiResponse<LlmPromptConfig>> => {
    return httpClientImpl.post(`/api/client/llm-prompt/project/${projectId}/create`, request, {
      showNotification: true,
      fallbackMessage: '创建项目级提示词'
    });
  },

  updateProjectPrompt: async (
    projectId: string,
    id: string,
    request: SaveLlmPromptRequest
  ): Promise<ApiResponse<LlmPromptConfig>> => {
    return httpClientImpl.post(`/api/client/llm-prompt/project/${projectId}/update/${id}`, request, {
      showNotification: true,
      fallbackMessage: '更新项目级提示词'
    });
  },

  deleteProjectPrompt: async (projectId: string, id: string): Promise<ApiResponse<void>> => {
    return httpClientImpl.post(`/api/client/llm-prompt/project/${projectId}/delete/${id}`, undefined, {
      showNotification: true,
      fallbackMessage: '删除项目级提示词'
    });
  },

  previewProjectPrompt: async (
    projectId: string,
    request: LlmPromptPreviewRequest
  ): Promise<ApiResponse<LlmPromptPreview>> => {
    return httpClientImpl.post(`/api/client/llm-prompt/project/${projectId}/preview`, request);
  },

  inspectProjectPromptConflicts: async (
    projectId: string,
    request: LlmPromptConflictCheckRequest = {}
  ): Promise<ApiResponse<LlmPromptConflictCheckResult>> => {
    return httpClientImpl.post(`/api/client/llm-prompt/project/${projectId}/conflicts`, request);
  },

  getProjectHitLogs: async (
    projectId: string,
    request: LlmPromptHitLogPageRequest = {}
  ): Promise<ApiResponse<LlmPromptPageData<LlmPromptHitLog>>> => {
    return httpClientImpl.get(`/api/client/llm-prompt/project/${projectId}/hit-log/page${createHitLogPageQuery(request)}`);
  }
};

export default llmPromptApi;
