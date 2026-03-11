// 完整度分析的方面类型
export interface CompletenessAspect {
  name: string;
  completeness: string;
  suggestions?: string;
}

// 优化建议类型
export interface OptimizationSuggestion {
  icon: string;
  content: string;
}

// 建议类型
export interface Suggestion {
  type: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

// 完整度分析数据类型
export interface CompletenessAnalysis {
  overallCompleteness: string;
  aspects: CompletenessAspect[];
  optimizationSuggestions: OptimizationSuggestion[];
}

// 子任务类型
export interface SubTask {
  id: string;
  name?: string; // 添加可选的name属性
  description: string;
  dependency: string[];
  priority: string;
  parallel_group: string;
  extraInfo?: string; // 添加可选的extraInfo属性
}

// 任务拆分数据类型
export interface TaskSplitData {
  main_task: {
    name: string;
    description: string;
    endTime?: string; // 添加截止时间字段，使用ISO-8601格式
  };
  sub_tasks: SubTask[];
  parallelism_score: number;
  parallel_execution_tips: string;
}

// 分析数据类型
export interface AnalysisData {
  overallScore: number;
  requirementScore: number;
  riskScore: number;
  progressScore: number;
  keyFindings: string[];
  risks: string[];
  suggestions: string[] | Suggestion[];
  tags: string[];
  colors: string[]; // 标签对应的颜色数组
  isStreaming?: boolean; // 是否正在流式分析
  streamingError?: string | null; // 流式分析错误
  streamingComplete?: boolean; // 流式分析是否完成
  priorityLevel: string; // 优先级等级
  priorityScore?: number; // 优先级分数
  priorityAnalysis?: string; // 优先级分析内容
  priorityData?: any; // 新增的优先级数据字段
  priorityDataOld?: any; // 旧的优先级数据字段
  completenessAnalysis?: CompletenessAnalysis; // 完整度分析数据
  taskSplitData?: TaskSplitData; // 任务拆分数据
  workloadData?: any; // 工作量分析数据
  pertWorkloadData?: any; // PERT三点估算工作量分析数据
  comprehensiveAnalysis?: ComprehensiveAnalysis; // 综合分析数据
}

// 风险管理项目
export interface RiskItem {
  risk: string;
  impact: string;
  mitigation: string;
}

// 项目任务
export interface TaskItem {
  name: string;
  priority: string;
  estimatedWorkload: string;
  dependencies: string[];
  assignmentSuggestion: string;
}

// 项目阶段
export interface PhaseItem {
  name: string;
  description: string;
  estimatedWorkload: string;
  suggestedTimeframe: string;
  tasks: TaskItem[];
}

// 资源推荐
export interface ResourceRecommendations {
  personnel: string;
  skills: string[];
  tools: string[];
}

// 任务安排
export interface TaskArrangement {
  phases: PhaseItem[];
  resourceRecommendations: ResourceRecommendations;
  riskManagement: RiskItem[];
}

// 需求摘要
export interface RequirementSummary {
  title: string;
  overview: string;
  keyPoints: string[];
  challenges: string[];
  opportunities: string[];
}

// 综合分析数据类型
export interface ComprehensiveAnalysis {
  content: string; // 原始内容，用于兼容
  summary?: RequirementSummary; // 需求摘要
  taskArrangement?: TaskArrangement; // 任务安排
  recommendations?: string[]; // 兼容旧版的建议列表
}

// 消息类型
export interface ChatMessage {
  content: string;
  isAi: boolean;
  type?: number; // 添加消息类型字段，用于区分不同类型的分析结果
  isThinking?: boolean; // 思考中状态
  isError?: boolean; // 错误消息
  isLoading?: boolean; // 加载状态，表示正在处理中
  isComprehensiveAnalysis?: boolean; // 是否为综合分析
  structuredData?: any; // 结构化数据，用于综合分析等需要展示结构化信息的地方
  isStreaming?: boolean; // 流式生成标记，表示数据正在生成中
}
