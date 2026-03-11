package com.task.domain.model.task.requirementconversationlist

import java.time.OffsetDateTime

/**
 * 需求对话列表领域模型
 * 存储需求的对话信息及关联的各分析结果ID
 */
data class RequirementConversation(
    /**
     * 唯一标识
     */
    val id: Long?,

    /**
     * 需求对话列表基础记录ID
     * 关联 t_requirement_conversation_list.id
     */
    val conversationListId: Long?,
    
    /**
     * 对话列表标题
     */
    val title: String,
    
    /**
     * 开始状态
     */
    val startStatus: String?,
    
    /**
     * 开始分析状态
     */
    val analysisStartStatus: String?,
    
    /**
     * 分析完成状态
     */
    val analysisCompleteStatus: String?,
    
    /**
     * 需求分类ID
     */
    val requirementCategoryId: Long?,
    
    /**
     * 需求优先级ID
     */
    val requirementPriorityId: Long?,
    
    /**
     * 需求工作量ID
     */
    val requirementWorkloadId: Long?,
    
    /**
     * 任务拆分ID
     */
    val requirementTaskBreakdownId: Long?,
    
    /**
     * 需求完整度检查ID
     */
    val requirementCompletenessId: Long?,
    
    /**
     * 智能建议ID
     */
    val requirementSuggestionId: Long?,
    
    /**
     * 总结分析ID
     */
    val requirementSummaryAnalysisId: Long?,

    /**
     * 会话根主任务（仅首轮写入，后续只读）
     */
    val rootMainTask: String? = null,

    /**
     * 当前会话轮次
     */
    val currentTurnNo: Int = 0,

    /**
     * 最近一次任务拆分结果JSON
     */
    val latestTaskBreakdownJson: String? = null,

    /**
     * 需求分类分析结果JSON
     */
    val requirementTypeJson: String? = null,

    /**
     * 优先级分析结果JSON
     */
    val priorityJson: String? = null,

    /**
     * 工作量分析结果JSON
     */
    val workloadJson: String? = null,

    /**
     * 完整度分析结果JSON
     */
    val completenessJson: String? = null,

    /**
     * 智能建议结果JSON
     */
    val suggestionJson: String? = null,

    /**
     * 分析摘要结果JSON
     */
    val analysisSummaryJson: String? = null,

    /**
     * 分析总结结果JSON
     */
    val finalSummaryJson: String? = null,

    /**
     * 任务规划结果JSON
     */
    val taskPlanningJson: String? = null,
    
    /**
     * 是否删除
     */
    val deleted: Int = 0,
    
    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,
    
    /**
     * 最后更新时间
     */
    val updatedAt: OffsetDateTime?,
    
    /**
     * 乐观锁版本号
     */
    val version: Int = 0
) {
    companion object {
        /**
         * 创建新的需求对话列表
         */
    fun create(
        title: String,
        startStatus: String? = null,
        conversationListId: Long? = null
    ): RequirementConversation {
        val now = OffsetDateTime.now()
        return RequirementConversation(
            id = null,
            conversationListId = conversationListId,
            title = title,
            startStatus = startStatus,
            analysisStartStatus = null,
                analysisCompleteStatus = null,
                requirementCategoryId = null,
                requirementPriorityId = null,
                requirementWorkloadId = null,
                requirementTaskBreakdownId = null,
                requirementCompletenessId = null,
                requirementSuggestionId = null,
                requirementSummaryAnalysisId = null,
                rootMainTask = null,
                currentTurnNo = 0,
                latestTaskBreakdownJson = null,
                requirementTypeJson = null,
                priorityJson = null,
                workloadJson = null,
                completenessJson = null,
                suggestionJson = null,
                analysisSummaryJson = null,
                finalSummaryJson = null,
                taskPlanningJson = null,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
    
    /**
     * 更新标题
     */
    fun updateTitle(title: String): RequirementConversation {
        return this.copy(
            title = title,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 更新状态
     */
    fun updateStatus(
        startStatus: String? = this.startStatus,
        analysisStartStatus: String? = this.analysisStartStatus,
        analysisCompleteStatus: String? = this.analysisCompleteStatus
    ): RequirementConversation {
        return this.copy(
            startStatus = startStatus,
            analysisStartStatus = analysisStartStatus,
            analysisCompleteStatus = analysisCompleteStatus,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 关联需求分类
     */
    fun linkRequirementCategory(categoryId: Long): RequirementConversation {
        return this.copy(
            requirementCategoryId = categoryId,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 关联需求优先级
     */
    fun linkRequirementPriority(priorityId: Long): RequirementConversation {
        return this.copy(
            requirementPriorityId = priorityId,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 关联需求工作量
     */
    fun linkRequirementWorkload(workloadId: Long): RequirementConversation {
        return this.copy(
            requirementWorkloadId = workloadId,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 关联任务拆分
     */
    fun linkRequirementTaskBreakdown(taskBreakdownId: Long): RequirementConversation {
        return this.copy(
            requirementTaskBreakdownId = taskBreakdownId,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 关联需求完整度检查
     */
    fun linkRequirementCompleteness(completenessId: Long): RequirementConversation {
        return this.copy(
            requirementCompletenessId = completenessId,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 关联智能建议
     */
    fun linkRequirementSuggestion(suggestionId: Long): RequirementConversation {
        return this.copy(
            requirementSuggestionId = suggestionId,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 关联总结分析
     */
    fun linkRequirementSummaryAnalysis(summaryAnalysisId: Long): RequirementConversation {
        return this.copy(
            requirementSummaryAnalysisId = summaryAnalysisId,
            updatedAt = OffsetDateTime.now()
        )
    }
} 
