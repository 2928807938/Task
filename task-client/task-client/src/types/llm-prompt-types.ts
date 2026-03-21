export type LlmPromptScopeType = 'USER' | 'PROJECT';

export type LlmPromptStatus = 'ENABLED' | 'DISABLED';

export interface LlmPromptPageRequest {
  pageNumber?: number;
  pageSize?: number;
  promptName?: string;
  status?: LlmPromptStatus;
}

export interface SaveLlmPromptRequest {
  promptName: string;
  promptContent: string;
  allSceneEnabled: boolean;
  sceneKeys: string[];
  status: LlmPromptStatus;
  priority: number;
}

export interface LlmPromptPreviewRequest {
  sceneKey: string;
}

export interface LlmPromptHitLogPageRequest {
  pageNumber?: number;
  pageSize?: number;
  sceneKey?: string;
  analysisRequestId?: string;
}

export interface LlmPromptConfig {
  id: string;
  scopeType: LlmPromptScopeType;
  scopeObjectId: string;
  promptName: string;
  promptContent: string;
  allSceneEnabled: boolean;
  sceneKeys: string[];
  status: LlmPromptStatus;
  priority: number;
  createdAt: string;
  updatedAt?: string | null;
  version: number;
}

export interface LlmPromptMatchedItem {
  id?: string | null;
  scopeType: LlmPromptScopeType;
  promptName: string;
  originalContent: string;
  normalizedContent: string;
  filteredLines: string[];
}

export interface LlmPromptPreview {
  sceneKey: string;
  projectId?: string | null;
  userId?: string | null;
  analysisRequestId: string;
  hitPromptIds: string[];
  projectPrompts: LlmPromptMatchedItem[];
  userPrompts: LlmPromptMatchedItem[];
  projectPromptContext: string;
  userPromptContext: string;
  effectivePromptProfile: string;
  finalPromptPreview?: string | null;
}

export interface LlmPromptHitLog {
  id: string;
  analysisRequestId: string;
  sceneKey: string;
  projectId?: string | null;
  userId?: string | null;
  hitPromptIds: string[];
  finalPromptPreview?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface LlmPromptPageData<T> {
  content: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
}

export interface LlmPromptSceneOption {
  key: string;
  label: string;
  description: string;
}

export const LLM_PROMPT_SCENE_OPTIONS: LlmPromptSceneOption[] = [
  {
    key: '任务拆分',
    label: '任务拆分',
    description: '偏向拆解执行步骤、依赖关系和并行机会。'
  },
  {
    key: '需求分类',
    label: '需求分类',
    description: '帮助模型先判断需求类型与上下文归类。'
  },
  {
    key: '优先级分析',
    label: '优先级分析',
    description: '强调业务价值、紧急度与排期建议。'
  },
  {
    key: '工作量分析',
    label: '工作量分析',
    description: '强调估时口径、风险缓冲和可执行性。'
  },
  {
    key: '需求完整度检查',
    label: '完整度检查',
    description: '优先识别缺失信息、模糊边界与关键前提。'
  },
  {
    key: '智能建议',
    label: '智能建议',
    description: '输出更偏方案补充、优化建议和扩展方向。'
  },
  {
    key: '分析摘要',
    label: '分析摘要',
    description: '用于压缩多阶段分析结果，保留关键信息。'
  }
];

