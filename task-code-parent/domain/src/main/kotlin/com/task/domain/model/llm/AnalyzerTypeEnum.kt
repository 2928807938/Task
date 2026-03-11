package com.task.domain.model.llm

/**
 * 分析器类型枚举
 */
enum class AnalyzerTypeEnum(
    val beanName: String,
    val resultType: LlmResultTypeEnum) {

    /**
     * 类型分析器
     */
    REQUIREMENT_TYPE("requirementTypeAnalyzer", LlmResultTypeEnum.TYPE_ANALYSIS),

    /**
     * 优先级分析器
     */
    PRIORITY("priorityAnalyzer", LlmResultTypeEnum.PRIORITY_ANALYSIS),

    /**
     * 完整度分析器
     */
    COMPLETENESS("completenessAnalyzer", LlmResultTypeEnum.COMPLETENESS_ANALYSIS),

    /**
     * 建议分析器
     */
    SUGGESTION("suggestionAnalyzer", LlmResultTypeEnum.SUGGESTION_ANALYSIS),

    /**
     * 任务拆分分析器
     */
    TASK_BREAKDOWN("taskBreakdownAnalyzer", LlmResultTypeEnum.TASK_BREAKDOWN_ANALYSIS),

    /**
     * 工作量分析器
     */
    WORKLOAD("workloadAnalyzer", LlmResultTypeEnum.WORKLOAD_ANALYSIS)
}