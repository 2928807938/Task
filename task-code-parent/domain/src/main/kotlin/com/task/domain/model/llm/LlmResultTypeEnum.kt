package com.task.domain.model.llm

/**
 * LLM结果类型枚举
 */
enum class LlmResultTypeEnum(val code: Int, val description: String) {
    ANALYSIS_ERROR(-3, "分析错误"),
    ANALYSIS_COMPLETED(-2, "分析完成"),
    ANALYSIS_STARTED(-1, "分析开始"),
    UNKNOWN(0, "未知类型"),
    TYPE_ANALYSIS(2, "类型分析"),
    PRIORITY_ANALYSIS(3, "优先级分析"),
    COMPLETENESS_ANALYSIS(4, "完整度分析"),
    SUGGESTION_ANALYSIS(5, "建议"),
    TASK_BREAKDOWN_ANALYSIS(6, "任务拆分分析"),
    WORKLOAD_ANALYSIS(7, "工作量分析"),
    SUMMARY_ANALYSIS(8, "综合分析"),
    ASSIGN_TASK(9, "综合分析");

    companion object {
        fun fromCode(code: Int): LlmResultTypeEnum {
            return entries.find { it.code == code } ?: UNKNOWN
        }
    }
}