import type {
  RequirementConversationHistoryDetail,
  RequirementConversationHistoryConversation,
  RequirementConversationHistoryTurn,
} from '@/adapters/api/requirement-conversation-api';
import type {AnalysisData, ChatMessage, Suggestion, TaskSplitData} from './types';

const welcomeMessage = '您好，我是AI助手。我可以帮助您分析项目需求、拆分任务、评估工作量。请告诉我您需要什么帮助？';

type JsonRecord = Record<string, unknown>;
type ComprehensiveSummary = NonNullable<AnalysisData['comprehensiveAnalysis']>['summary'];
type ComprehensiveTaskArrangement = NonNullable<AnalysisData['comprehensiveAnalysis']>['taskArrangement'];

const isObject = (value: unknown): value is JsonRecord => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const toStringArray = (value: unknown): string[] => (
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []
);

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const matched = value.match(/-?\d+(\.\d+)?/);
    if (matched) {
      return Number(matched[0]);
    }
  }

  return fallback;
};

const toPercentage = (value: unknown, fallback = '0%'): string => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}%`;
  }

  if (typeof value === 'string' && value.trim()) {
    return value.includes('%') ? value : `${value}%`;
  }

  return fallback;
};

const normalizeSuggestions = (value: unknown): string[] | Suggestion[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value.reduce<Array<string | Suggestion>>((result, item) => {
    if (typeof item === 'string') {
      result.push(item);
      return result;
    }

    if (!isObject(item)) {
      return result;
    }

    result.push({
      type: typeof item.type === 'string' ? item.type : 'info',
      title: typeof item.title === 'string' ? item.title : '优化建议',
      icon: typeof item.icon === 'string' ? item.icon : '💡',
      color: typeof item.color === 'string' ? item.color : '#4CAF50',
      description: typeof item.description === 'string'
        ? item.description
        : typeof item.content === 'string'
          ? item.content
          : ''
    });

    return result;
  }, []);

  return normalized.every((item): item is string => typeof item === 'string')
    ? normalized
    : normalized.filter((item): item is Suggestion => typeof item !== 'string');
};

const parseSnapshotJson = (snapshotJson?: string): JsonRecord | null => {
  if (!snapshotJson || !snapshotJson.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(snapshotJson);
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const parseEmbeddedJsonValue = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    return value;
  }

  if (!value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const parseEmbeddedJsonRecord = (value: unknown): JsonRecord | null => {
  const parsed = parseEmbeddedJsonValue(value);
  return isObject(parsed) ? parsed : null;
};

const normalizeSuggestionPayload = (value: JsonRecord | null): JsonRecord | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value.suggestions)) {
    return value;
  }

  if (Array.isArray(value.items)) {
    return {
      suggestions: value.items,
    };
  }

  return {
    suggestions: [value],
  };
};

const mergeRequirementAnalysisSummary = (
  summary: JsonRecord | null,
  taskPlanning: JsonRecord | null,
): JsonRecord | null => {
  const normalizedSummary = summary ? { ...summary } : {};

  if (taskPlanning) {
    if (isObject(normalizedSummary.taskArrangement)) {
      normalizedSummary.taskArrangement = {
        ...normalizedSummary.taskArrangement,
        ...taskPlanning,
      };
    } else {
      normalizedSummary.taskArrangement = taskPlanning;
    }
  }

  return Object.keys(normalizedSummary).length > 0 ? normalizedSummary : null;
};

const normalizeStoredSnapshot = (snapshot: JsonRecord | null): JsonRecord | null => {
  if (!snapshot) {
    return null;
  }

  const parsedTaskBreakdown = parseEmbeddedJsonValue(snapshot.taskBreakdown) ?? parseEmbeddedJsonValue(snapshot.latestTaskBreakdownJson);
  const taskBreakdown = Array.isArray(parsedTaskBreakdown)
    ? {
        main_task: typeof snapshot.rootMainTask === 'string'
          ? snapshot.rootMainTask
          : typeof snapshot.title === 'string'
            ? snapshot.title
            : '历史任务',
        sub_tasks: parsedTaskBreakdown,
      }
    : isObject(parsedTaskBreakdown)
      ? parsedTaskBreakdown
      : null;
  const requirementCategory = parseEmbeddedJsonRecord(snapshot.requirementCategory) ?? parseEmbeddedJsonRecord(snapshot.requirementTypeJson);
  const priorityAnalysis = parseEmbeddedJsonRecord(snapshot.priorityAnalysis) ?? parseEmbeddedJsonRecord(snapshot.priorityJson);
  const workloadEstimation = parseEmbeddedJsonRecord(snapshot.workloadEstimation) ?? parseEmbeddedJsonRecord(snapshot.workloadJson);
  const requirementCompleteness = parseEmbeddedJsonRecord(snapshot.requirementCompleteness) ?? parseEmbeddedJsonRecord(snapshot.completenessJson);
  const requirementSuggestions = normalizeSuggestionPayload(
    parseEmbeddedJsonRecord(snapshot.requirementSuggestions) ?? parseEmbeddedJsonRecord(snapshot.suggestionJson)
  );
  const requirementAnalysisSummary = mergeRequirementAnalysisSummary(
    parseEmbeddedJsonRecord(snapshot.requirementAnalysisSummary)
      ?? parseEmbeddedJsonRecord(snapshot.analysisSummaryJson)
      ?? parseEmbeddedJsonRecord(snapshot.finalSummaryJson),
    parseEmbeddedJsonRecord(snapshot.taskPlanningJson)
  );

  const normalizedSnapshot: JsonRecord = {
    ...snapshot,
  };

  if (taskBreakdown) {
    normalizedSnapshot.taskBreakdown = taskBreakdown;
  }

  if (requirementCategory) {
    normalizedSnapshot.requirementCategory = requirementCategory;
  }

  if (priorityAnalysis) {
    normalizedSnapshot.priorityAnalysis = priorityAnalysis;
  }

  if (workloadEstimation) {
    normalizedSnapshot.workloadEstimation = workloadEstimation;
  }

  if (requirementCompleteness) {
    normalizedSnapshot.requirementCompleteness = requirementCompleteness;
  }

  if (requirementSuggestions) {
    normalizedSnapshot.requirementSuggestions = requirementSuggestions;
  }

  if (requirementAnalysisSummary) {
    normalizedSnapshot.requirementAnalysisSummary = requirementAnalysisSummary;
  }

  return normalizedSnapshot;
};

const getSnapshotTitle = (snapshot: JsonRecord | null, fallback: string): string => {
  const normalizedSnapshot = normalizeStoredSnapshot(snapshot);

  if (!normalizedSnapshot) {
    return fallback;
  }

  const taskBreakdown = isObject(normalizedSnapshot.taskBreakdown) ? normalizedSnapshot.taskBreakdown : null;
  const requirementAnalysisSummary = isObject(normalizedSnapshot.requirementAnalysisSummary)
    ? normalizedSnapshot.requirementAnalysisSummary
    : null;
  const analysisData = isObject(normalizedSnapshot.analysisData) ? normalizedSnapshot.analysisData : null;
  const analysisTaskSplitData = analysisData && isObject(analysisData.taskSplitData)
    ? analysisData.taskSplitData
    : null;
  const analysisComprehensive = analysisData && isObject(analysisData.comprehensiveAnalysis)
    ? analysisData.comprehensiveAnalysis
    : null;
  const analysisSummary = analysisComprehensive && isObject(analysisComprehensive.summary)
    ? analysisComprehensive.summary
    : null;
  const requirementSummary = requirementAnalysisSummary && isObject(requirementAnalysisSummary.summary)
    ? requirementAnalysisSummary.summary
    : null;

  const candidates = [
    normalizedSnapshot.title,
    normalizedSnapshot.rootMainTask,
    taskBreakdown?.main_task,
    requirementSummary?.title,
    isObject(analysisTaskSplitData?.main_task) ? analysisTaskSplitData.main_task.name : undefined,
    analysisSummary?.title,
  ];

  const title = candidates.find((item) => typeof item === 'string' && item.trim().length > 0);
  return typeof title === 'string' ? title : fallback;
};

export const createInitialMessages = (): ChatMessage[] => [
  {
    content: welcomeMessage,
    isAi: true,
  }
];

export const createInitialAnalysisData = (): AnalysisData => ({
  overallScore: 0,
  requirementScore: 0,
  riskScore: 0,
  progressScore: 0,
  keyFindings: [],
  risks: [],
  suggestions: [],
  tags: [],
  colors: [],
  isStreaming: false,
  streamingError: null,
  streamingComplete: false,
  priorityLevel: '',
  priorityScore: 0,
  priorityAnalysis: '',
  priorityData: undefined,
  completenessAnalysis: undefined,
  taskSplitData: undefined,
  workloadData: undefined,
  pertWorkloadData: undefined,
  comprehensiveAnalysis: undefined,
});

const normalizeMessages = (value: unknown): ChatMessage[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<ChatMessage[]>((result, item) => {
    if (!isObject(item) || typeof item.content !== 'string' || !item.content.trim()) {
      return result;
    }

    result.push({
      content: item.content,
      isAi: Boolean(item.isAi),
      type: typeof item.type === 'number' ? item.type : undefined,
      isThinking: Boolean(item.isThinking),
      isError: Boolean(item.isError),
      isLoading: Boolean(item.isLoading),
      isComprehensiveAnalysis: Boolean(item.isComprehensiveAnalysis),
      structuredData: item.structuredData,
      isStreaming: Boolean(item.isStreaming),
    });

    return result;
  }, []);
};

const mapPayloadSnapshotToAnalysisData = (snapshot: JsonRecord): Partial<AnalysisData> => {
  const requirementCategory = isObject(snapshot.requirementCategory) ? snapshot.requirementCategory : {};
  const priorityAnalysis = isObject(snapshot.priorityAnalysis) ? snapshot.priorityAnalysis : {};
  const priority = isObject(priorityAnalysis.priority) ? priorityAnalysis.priority : {};
  const requirementCompleteness = isObject(snapshot.requirementCompleteness) ? snapshot.requirementCompleteness : {};
  const taskBreakdown = isObject(snapshot.taskBreakdown) ? snapshot.taskBreakdown : {};
  const workloadEstimation = isObject(snapshot.workloadEstimation) ? snapshot.workloadEstimation : {};
  const requirementSuggestions = isObject(snapshot.requirementSuggestions) ? snapshot.requirementSuggestions : {};
  const requirementAnalysisSummary = isObject(snapshot.requirementAnalysisSummary) ? snapshot.requirementAnalysisSummary : {};
  const summary = isObject(requirementAnalysisSummary.summary) ? requirementAnalysisSummary.summary : undefined;
  const taskArrangement = isObject(requirementAnalysisSummary.taskArrangement)
    ? requirementAnalysisSummary.taskArrangement
    : undefined;

  const taskSplitData: TaskSplitData | undefined = Object.keys(taskBreakdown).length > 0
    ? {
        main_task: {
          name: typeof taskBreakdown.main_task === 'string' ? taskBreakdown.main_task : '',
          description: typeof summary?.overview === 'string' ? summary.overview : '',
        },
        sub_tasks: Array.isArray(taskBreakdown.sub_tasks)
          ? taskBreakdown.sub_tasks.map((task, index: number) => {
              const currentTask = isObject(task) ? task : {};

              return {
              id: typeof currentTask.id === 'string' ? currentTask.id : `T${index + 1}`,
              name: typeof currentTask.name === 'string' ? currentTask.name : undefined,
              description: typeof currentTask.description === 'string'
                ? currentTask.description
                : typeof currentTask.name === 'string'
                  ? currentTask.name
                  : `子任务${index + 1}`,
              dependency: Array.isArray(currentTask.dependency) ? toStringArray(currentTask.dependency) : [],
              priority: typeof currentTask.priority === 'string' ? currentTask.priority : '中',
              parallel_group: typeof currentTask.parallel_group === 'string' ? currentTask.parallel_group : 'G1',
            };
          })
          : [],
        parallelism_score: toNumber(taskBreakdown.parallelism_score),
        parallel_execution_tips: typeof taskBreakdown.parallel_execution_tips === 'string'
          ? taskBreakdown.parallel_execution_tips
          : '',
      }
    : undefined;

  return {
    tags: toStringArray(requirementCategory.tags),
    colors: toStringArray(requirementCategory.colors),
    priorityLevel: typeof priority.level === 'string' ? priority.level : '',
    priorityScore: toNumber(priority.score),
    priorityAnalysis: typeof priority.analysis === 'string' ? priority.analysis : '',
    priorityData: Object.keys(priorityAnalysis).length > 0 ? priorityAnalysis : undefined,
    completenessAnalysis: Object.keys(requirementCompleteness).length > 0
      ? {
          overallCompleteness: toPercentage(requirementCompleteness.overallCompleteness),
          aspects: Array.isArray(requirementCompleteness.aspects)
            ? requirementCompleteness.aspects.map((aspect) => {
                const currentAspect = isObject(aspect) ? aspect : {};

                return {
                  name: typeof currentAspect.name === 'string' ? currentAspect.name : '未命名方面',
                  completeness: toPercentage(currentAspect.completeness),
                };
              })
            : [],
          optimizationSuggestions: Array.isArray(requirementCompleteness.optimizationSuggestions)
            ? requirementCompleteness.optimizationSuggestions.map((item) => {
                const currentItem = isObject(item) ? item : {};

                return {
                  icon: typeof currentItem.icon === 'string' ? currentItem.icon : '💡',
                  content: typeof currentItem.content === 'string' ? currentItem.content : '',
                };
              })
            : [],
        }
      : undefined,
    taskSplitData,
    suggestions: normalizeSuggestions(requirementSuggestions.suggestions),
    pertWorkloadData: Object.keys(workloadEstimation).length > 0
      ? {
          optimistic: toNumber(workloadEstimation.optimistic),
          most_likely: toNumber(workloadEstimation.most_likely),
          pessimistic: toNumber(workloadEstimation.pessimistic),
          expected: toNumber(workloadEstimation.expected),
          standard_deviation: toNumber(workloadEstimation.standard_deviation),
        }
      : undefined,
    comprehensiveAnalysis: summary || taskArrangement
      ? {
          content: JSON.stringify(requirementAnalysisSummary),
          summary: summary as ComprehensiveSummary,
          taskArrangement: taskArrangement as ComprehensiveTaskArrangement,
        }
      : undefined,
  };
};

const mapDirectSnapshotToAnalysisData = (snapshot: JsonRecord): Partial<AnalysisData> => {
  if (isObject(snapshot.analysisData)) {
    return mapDirectSnapshotToAnalysisData(snapshot.analysisData);
  }

  const messages = normalizeMessages(snapshot.messages || snapshot.chatMessages || snapshot.conversationMessages);
  const taskSplitData = isObject(snapshot.taskSplitData) ? snapshot.taskSplitData as unknown as TaskSplitData : undefined;

  return {
    tags: toStringArray(snapshot.tags),
    colors: toStringArray(snapshot.colors),
    keyFindings: toStringArray(snapshot.keyFindings),
    risks: toStringArray(snapshot.risks),
    suggestions: normalizeSuggestions(snapshot.suggestions),
    priorityLevel: typeof snapshot.priorityLevel === 'string' ? snapshot.priorityLevel : '',
    priorityScore: toNumber(snapshot.priorityScore),
    priorityAnalysis: typeof snapshot.priorityAnalysis === 'string' ? snapshot.priorityAnalysis : '',
    priorityData: isObject(snapshot.priorityData) ? snapshot.priorityData : undefined,
    completenessAnalysis: isObject(snapshot.completenessAnalysis)
      ? snapshot.completenessAnalysis as unknown as AnalysisData['completenessAnalysis']
      : undefined,
    taskSplitData,
    workloadData: isObject(snapshot.workloadData) ? snapshot.workloadData : undefined,
    pertWorkloadData: isObject(snapshot.pertWorkloadData) ? snapshot.pertWorkloadData : undefined,
    comprehensiveAnalysis: isObject(snapshot.comprehensiveAnalysis)
      ? snapshot.comprehensiveAnalysis as unknown as AnalysisData['comprehensiveAnalysis']
      : undefined,
    streamingComplete: messages.length > 0 || Boolean(snapshot.taskSplitData || snapshot.comprehensiveAnalysis),
  };
};

const mapSnapshotToAnalysisData = (snapshot: JsonRecord | null): Partial<AnalysisData> => {
  const normalizedSnapshot = normalizeStoredSnapshot(snapshot);

  if (!normalizedSnapshot) {
    return {};
  }

  if (
    normalizedSnapshot.requirementCategory ||
    normalizedSnapshot.priorityAnalysis ||
    normalizedSnapshot.taskBreakdown ||
    normalizedSnapshot.requirementCompleteness ||
    normalizedSnapshot.requirementSuggestions ||
    normalizedSnapshot.requirementAnalysisSummary
  ) {
    return mapPayloadSnapshotToAnalysisData(normalizedSnapshot);
  }

  return mapDirectSnapshotToAnalysisData(normalizedSnapshot);
};

const buildFallbackAiMessage = (turn: RequirementConversationHistoryTurn, totalTurns: number, snapshot: JsonRecord | null): ChatMessage => {
  const snapshotTitle = getSnapshotTitle(snapshot, '需求分析');
  const suffix = turn.turnNo === totalTurns ? '当前分析快照已同步到左侧面板。' : '该轮分析已归档。';

  return {
    content: `第${turn.turnNo}轮分析已完成：${snapshotTitle}。${suffix}`,
    isAi: true,
  };
};

export const restoreConversationFromHistoryDetail = (detail: RequirementConversationHistoryDetail): {
  messages: ChatMessage[];
  analysisData: AnalysisData;
  title: string;
} => {
  const turns = [...(detail.turns || [])].sort((left, right) => left.turnNo - right.turnNo);
  const latestTurn = turns[turns.length - 1];
  const latestTurnSnapshot = parseSnapshotJson(latestTurn?.snapshotJson);
  const latestConversationSnapshot = normalizeStoredSnapshot(detail.conversation as unknown as JsonRecord | null);
  const normalizedTurnSnapshot = normalizeStoredSnapshot(latestTurnSnapshot);
  const latestSnapshot = latestConversationSnapshot || normalizedTurnSnapshot
    ? {
        ...(latestConversationSnapshot || {}),
        ...(normalizedTurnSnapshot || {}),
      }
    : null;
  const embeddedMessages = normalizeMessages(
    latestTurnSnapshot?.messages || latestTurnSnapshot?.chatMessages || latestTurnSnapshot?.conversationMessages
  );

  const messages = createInitialMessages();

  if (embeddedMessages.length > 0) {
    messages.push(...embeddedMessages.filter((message) => message.content !== welcomeMessage));
  } else {
    turns.forEach((turn) => {
      if (turn.userInput?.trim()) {
        messages.push({
          content: turn.userInput,
          isAi: false,
        });
      }

      messages.push(buildFallbackAiMessage(turn, detail.conversation?.currentTurnNo || turns.length, parseSnapshotJson(turn.snapshotJson)));
    });
  }

  if (messages.length === 1) {
    messages.push({
      content: `已为您恢复历史会话「${detail.conversation?.title || '需求分析'}」，您可以继续追问。`,
      isAi: true,
    });
  }

  return {
    title: detail.conversation?.title || getSnapshotTitle(latestSnapshot, '历史会话'),
    messages,
    analysisData: {
      ...createInitialAnalysisData(),
      ...mapSnapshotToAnalysisData(latestSnapshot),
      isStreaming: false,
      streamingError: null,
      streamingComplete: true,
    },
  };
};
