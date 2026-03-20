import httpClientImpl from '@/infrastructure/http/http-client-impl';
import {ApiResponse} from '@/types/api-types';

interface RequirementCategory {
  tags: string[];
  colors: string[];
}

interface PriorityAnalysis {
  priority: {
    level: string;
    score: number;
    analysis: string;
  };
  scheduling: {
    recommendation: string;
    factors: {
      difficulty: string;
      resourceMatch: string;
      dependencies: string;
    };
    justification: string;
  };
}

interface WorkloadEstimation {
  optimistic: string;
  most_likely: string;
  pessimistic: string;
  expected: string;
  standard_deviation: string;
}

interface TaskBreakdown {
  main_task: string;
  sub_tasks: Array<{
    id: string;
    description: string;
    dependency: string[];
    priority: string;
    parallel_group: string;
  }>;
  parallelism_score: number;
  parallel_execution_tips: string;
}

interface RequirementCompleteness {
  overallCompleteness: string;
  aspects: Array<{
    name: string;
    completeness: string;
  }>;
  optimizationSuggestions: Array<{
    icon: string;
    content: string;
  }>;
}

interface RequirementSuggestions {
  suggestions: Array<{
    type: string;
    title: string;
    icon: string;
    color: string;
    description: string;
  }>;
}

interface RequirementAnalysisSummary {
  summary: {
    title: string;
    overview: string;
    keyPoints: string[];
    challenges: string[];
    opportunities: string[];
  };
  taskArrangement: {
    phases: Array<{
      name: string;
      description: string;
      estimatedWorkload: string;
      suggestedTimeframe: string;
      tasks: Array<{
        name: string;
        priority: string;
        estimatedWorkload: string;
        dependencies: string[];
        assignmentSuggestion: string;
      }>;
    }>;
    resourceRecommendations: {
      personnel: string[];
      skills: string[];
      tools: string[];
    };
    riskManagement: Array<{
      risk: string;
      impact: string;
      mitigation: string;
    }>;
  };
}

export interface CreateRequirementConversationRequest {
  conversationListId: string;
  title: string;
  requirementCategory: RequirementCategory;
  priorityAnalysis: PriorityAnalysis;
  workloadEstimation: WorkloadEstimation;
  taskBreakdown: TaskBreakdown;
  requirementCompleteness: RequirementCompleteness;
  requirementSuggestions: RequirementSuggestions;
  requirementAnalysisSummary: RequirementAnalysisSummary;
}

export interface CreateRequirementConversationListRequest {
  projectId: string;
}

export interface RequirementConversationHistorySummary {
  conversationListId: string;
  projectId: string;
  conversationId: string;
  title: string;
  rootMainTask: string;
  currentTurnNo: number;
  analysisStartStatus: string;
  analysisCompleteStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementConversationHistoryConversation {
  id: string;
  conversationListId: string;
  title: string;
  startStatus?: string;
  analysisStartStatus?: string;
  rootMainTask: string;
  currentTurnNo: number;
  analysisCompleteStatus: string;
  latestTaskBreakdownJson?: string | null;
  requirementTypeJson?: string | null;
  priorityJson?: string | null;
  workloadJson?: string | null;
  completenessJson?: string | null;
  suggestionJson?: string | null;
  analysisSummaryJson?: string | null;
  finalSummaryJson?: string | null;
  taskPlanningJson?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequirementConversationHistoryTurn {
  id: string;
  conversationListId: string;
  turnNo: number;
  userInput: string;
  analysisStartStatus?: string;
  analysisCompleteStatus?: string;
  snapshotJson: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequirementConversationHistoryDetail {
  conversationListId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  conversation: RequirementConversationHistoryConversation;
  turns: RequirementConversationHistoryTurn[];
}

export const requirementConversationApi = {
  createRequirementConversation: async (
    payload: CreateRequirementConversationRequest
  ): Promise<ApiResponse<number>> => {
    return httpClientImpl.post<number>('/api/client/requirement-conversation/create', payload);
  },

  /**
   * 创建需求对话列表基础记录
   * @returns 新创建的 conversation_list_id
   */
  createRequirementConversationList: async (
    payload: CreateRequirementConversationListRequest
  ): Promise<ApiResponse<string>> => {
    return httpClientImpl.post<string>('/api/client/requirement-conversation-list/create', payload);
  },

  getProjectRequirementConversationHistories: async (
    projectId: string
  ): Promise<ApiResponse<RequirementConversationHistorySummary[]>> => {
    return httpClientImpl.get<RequirementConversationHistorySummary[]>(`/api/client/requirement-conversation/project/${projectId}/history`);
  },

  getRequirementConversationHistoryDetail: async (
    conversationListId: string
  ): Promise<ApiResponse<RequirementConversationHistoryDetail>> => {
    return httpClientImpl.get<RequirementConversationHistoryDetail>(`/api/client/requirement-conversation/history/${conversationListId}`);
  }
};

export default requirementConversationApi;
