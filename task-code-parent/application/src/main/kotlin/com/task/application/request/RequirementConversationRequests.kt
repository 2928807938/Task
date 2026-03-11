package com.task.application.request

import com.fasterxml.jackson.annotation.JsonProperty

/**
 * 创建需求对话列表请求
 */
data class CreateRequirementConversationRequest(
    /**
     * 对话列表标题
     */
    val title: String,

    /**
     * 需求对话列表基础记录ID
     * 来自 /api/client/requirement-conversation-list/create 接口
     */
    val conversationListId: Long,

    /**
     * 需求分类
     */
    val requirementCategory: RequirementCategory,
    
    /**
     * 优先级分析
     */
    val priorityAnalysis: PriorityAnalysis,
    
    /**
     * 工作量分析
     */
    val workloadEstimation: WorkloadEstimation,
    
    /**
     * 任务拆分
     */
    val taskBreakdown: TaskBreakdown,
    
    /**
     * 需求完整度检查
     */
    val requirementCompleteness: RequirementCompleteness,
    
    /**
     * 智能建议
     */
    val requirementSuggestions: RequirementSuggestions,
    
    /**
     * 需求分析总结
     */
    val requirementAnalysisSummary: RequirementAnalysisSummary
)

/**
 * 需求分类对象
 * 包含需求标签和对应的颜色
 */
data class RequirementCategory(
    /**
     * 需求标签列表
     */
    val tags: List<String>,

    /**
     * 标签对应的颜色列表（十六进制颜色代码）
     */
    val colors: List<String>
)

/**
 * 优先级分析对象
 * 包含优先级评估和排期建议
 */
data class PriorityAnalysis(
    /**
     * 优先级评估
     */
    val priority: Priority,
    
    /**
     * 排期建议
     */
    val scheduling: Scheduling
)

/**
 * 优先级评估
 */
data class Priority(
    /**
     * 项目优先级体系中的级别
     */
    val level: String,
    
    /**
     * 优先级评分（0-100）
     */
    val score: Int,
    
    /**
     * 优先级评估理由
     */
    val analysis: String
)

/**
 * 排期建议
 */
data class Scheduling(
    /**
     * 建议排期
     * 可选值：CURRENT_ITERATION（当前迭代）、NEXT_ITERATION（下个迭代）、FUTURE_PLANNING（未来规划）
     */
    val recommendation: String,
    
    /**
     * 排期因素分析
     */
    val factors: SchedulingFactors,
    
    /**
     * 排期建议理由
     */
    val justification: String
)

/**
 * 排期因素分析
 */
data class SchedulingFactors(
    /**
     * 实施难度分析
     */
    val difficulty: String,
    
    /**
     * 资源匹配情况
     */
    val resourceMatch: String,
    
    /**
     * 依赖关系分析
     */
    val dependencies: String
)

/**
 * 工作量分析
 * 基于PERT（项目评估和审查技术）方法的工作量估算
 */
data class WorkloadEstimation(
    /**
     * 乐观估计（工作量的最小值）
     */
    val optimistic: String,
    
    /**
     * 最可能估计（最可能的工作量）
     */
    @JsonProperty("most_likely")
    val mostLikely: String,
    
    /**
     * 悲观估计（工作量的最大值）
     */
    val pessimistic: String,
    
    /**
     * 期望工作量（PERT公式计算结果）
     */
    val expected: String,
    
    /**
     * 标准偏差
     */
    @JsonProperty("standard_deviation")
    val standardDeviation: String
)

/**
 * 子任务
 * 表示主任务拆分后的单个子任务
 */
data class SubTask(
    /**
     * 子任务标识符
     */
    val id: String,
    
    /**
     * 子任务描述
     */
    val description: String,
    
    /**
     * 依赖关系（依赖的其他子任务ID列表）
     */
    val dependency: List<String> = emptyList(),
    
    /**
     * 优先级（高/中/低）
     */
    val priority: String,
    
    /**
     * 并行组标识
     * 相同并行组的任务可以并行执行
     */
    @JsonProperty("parallel_group")
    val parallelGroup: String
)

/**
 * 任务拆分
 * 将需求拆分为多个子任务，并提供并行执行的建议
 */
data class TaskBreakdown(
    /**
     * 主任务名称
     */
    @JsonProperty("main_task")
    val mainTask: String,
    
    /**
     * 子任务列表
     */
    @JsonProperty("sub_tasks")
    val subTasks: List<SubTask>,
    
    /**
     * 并行度评分（0-100）
     * 表示子任务可并行执行的程度，越高表示并行性越好
     */
    @JsonProperty("parallelism_score")
    val parallelismScore: Int,
    
    /**
     * 并行执行建议
     * 具体说明哪些任务可以并行执行及原因
     */
    @JsonProperty("parallel_execution_tips")
    val parallelExecutionTips: String
)

/**
 * 需求方面评估
 * 评估需求在特定方面的完整度
 */
data class RequirementAspect(
    /**
     * 名称
     */
    val name: String,
    
    /**
     * 完整度百分比
     */
    val completeness: String
)

/**
 * 优化建议
 * 提供提高需求完整度的建议
 */
data class OptimizationSuggestion(
    /**
     * 图标
     */
    val icon: String,
    
    /**
     * 建议内容
     */
    val content: String
)

/**
 * 需求完整度检查
 * 分析需求的完整性并提供优化建议
 */
data class RequirementCompleteness(
    /**
     * 总体完整度百分比
     */
    val overallCompleteness: String,
    
    /**
     * 各个方面的完整度评估
     */
    val aspects: List<RequirementAspect>,
    
    /**
     * 优化建议列表
     */
    val optimizationSuggestions: List<OptimizationSuggestion>
)

/**
 * 智能建议
 * 提供基于上下文的具体改进建议
 */
data class RequirementSuggestion(
    /**
     * 建议类型
     * 例如：timePlanning（时间规划）、resourceAllocation（资源分配）等
     */
    val type: String,
    
    /**
     * 建议标题
     */
    val title: String,
    
    /**
     * 图标（Emoji或其他图标代码）
     */
    val icon: String,
    
    /**
     * 背景色（十六进制颜色代码）
     */
    val color: String,
    
    /**
     * 建议详细描述
     */
    val description: String
)

/**
 * 需求智能建议集
 * 包含多个智能建议
 */
data class RequirementSuggestions(
    /**
     * 建议列表
     */
    val suggestions: List<RequirementSuggestion>
)

/**
 * 需求总结
 * 提供需求的概述、要点、挑战和机会
 */
data class RequirementSummary(
    /**
     * 需求标题
     */
    val title: String,
    
    /**
     * 总体概述
     */
    val overview: String,
    
    /**
     * 关键要点
     */
    val keyPoints: List<String>,
    
    /**
     * 挑战
     */
    val challenges: List<String>,
    
    /**
     * 机会
     */
    val opportunities: List<String>
)

/**
 * 需求任务
 * 需求分解后的具体任务
 */
data class RequirementTask(
    /**
     * 任务名称
     */
    val name: String,
    
    /**
     * 优先级
     */
    val priority: String,
    
    /**
     * 估计工作量
     */
    val estimatedWorkload: String,
    
    /**
     * 依赖任务
     */
    val dependencies: List<String>,
    
    /**
     * 分配建议
     */
    val assignmentSuggestion: String
)

/**
 * 需求阶段
 * 需求实现的各个阶段
 */
data class RequirementPhase(
    /**
     * 阶段名称
     */
    val name: String,
    
    /**
     * 阶段描述
     */
    val description: String,
    
    /**
     * 估计工作量
     */
    val estimatedWorkload: String,
    
    /**
     * 建议时间范围
     */
    val suggestedTimeframe: String,
    
    /**
     * 阶段内任务
     */
    val tasks: List<RequirementTask>
)

/**
 * 资源推荐
 * 需求实现所需的资源建议
 */
data class ResourceRecommendations(
    /**
     * 人员配置建议
     */
    val personnel: List<String>,
    
    /**
     * 所需技能
     */
    val skills: List<String>,
    
    /**
     * 建议工具
     */
    val tools: List<String>
)

/**
 * 风险项
 * 需求实现过程中的风险及应对策略
 */
data class RiskItem(
    /**
     * 风险描述
     */
    val risk: String,
    
    /**
     * 影响程度
     */
    val impact: String,
    
    /**
     * 缓解措施
     */
    val mitigation: String
)

/**
 * 需求任务安排
 * 包含实现阶段、资源推荐和风险管理
 */
data class TaskArrangement(
    /**
     * 实现阶段
     */
    val phases: List<RequirementPhase>,
    
    /**
     * 资源推荐
     */
    val resourceRecommendations: ResourceRecommendations,
    
    /**
     * 风险管理
     */
    val riskManagement: List<RiskItem>
)

/**
 * 需求分析总结
 * 包含需求总结和任务安排
 */
data class RequirementAnalysisSummary(
    /**
     * 需求总结
     */
    val summary: RequirementSummary,
    
    /**
     * 任务安排
     */
    val taskArrangement: TaskArrangement
)
