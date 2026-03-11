package com.task.application.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

/**
 * 需求分析请求DTO
 */
data class RequirementAnalysisRequest(
    /**
     * 需求描述文本
     */
    @NotBlank(message = "需求不能为空")
    val content: String,
    
    /**
     * 项目ID
     */
    @NotNull(message = "项目id不能为空")
    val projectId: Long,

    /**
     * 需求会话列表ID（多轮会话锚点）
     * 建议在同一需求会话内始终复用同一个conversationListId
     */
    val conversationListId: Long? = null,
    
    /**
     * 分析类型：FULL(全面分析), QUICK(快速分析)
     */
    val analysisType: String = "FULL",
    
    /**
     * 自定义标签（可选）
     */
    val tags: List<String> = emptyList(),

    /**
     * 需求对话ID（可选）
     * 用于将分析结果与后续任务创建流程精确关联
     */
    val requirementConversationId: Long? = null
)
