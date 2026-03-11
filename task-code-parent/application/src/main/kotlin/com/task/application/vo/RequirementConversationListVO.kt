 package com.task.application.vo

import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import java.time.OffsetDateTime

/**
 * 需求对话列表视图对象
 */
data class RequirementConversationListVO(
    /**
     * 唯一标识
     */
    val id: Long,
    
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
     * 创建时间
     */
    val createdAt: OffsetDateTime,
    
    /**
     * 最后更新时间
     */
    val updatedAt: OffsetDateTime?
) {
    companion object {
        /**
         * 从领域模型转换为视图对象
         */
        fun fromDomain(domain: RequirementConversation): RequirementConversationListVO {
            return RequirementConversationListVO(
                id = domain.id!!,
                title = domain.title,
                startStatus = domain.startStatus,
                analysisStartStatus = domain.analysisStartStatus,
                analysisCompleteStatus = domain.analysisCompleteStatus,
                requirementCategoryId = domain.requirementCategoryId,
                requirementPriorityId = domain.requirementPriorityId,
                requirementWorkloadId = domain.requirementWorkloadId,
                requirementTaskBreakdownId = domain.requirementTaskBreakdownId,
                requirementCompletenessId = domain.requirementCompletenessId,
                requirementSuggestionId = domain.requirementSuggestionId,
                requirementSummaryAnalysisId = domain.requirementSummaryAnalysisId,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
}