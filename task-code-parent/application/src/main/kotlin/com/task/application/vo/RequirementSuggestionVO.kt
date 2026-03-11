package com.task.application.vo

import com.task.domain.model.task.requirementsuggestion.RequirementSuggestion
import com.task.domain.model.task.requirementsuggestion.Suggestion
import java.time.OffsetDateTime

/**
 * 需求智能建议视图对象
 */
data class RequirementSuggestionVO(
    /**
     * 唯一标识
     */
    val id: Long,
    
    /**
     * 关联的需求ID
     */
    val requirementId: Long?,
    
    /**
     * 建议列表
     */
    val suggestions: List<Suggestion>,
    
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
        fun fromDomain(domain: RequirementSuggestion): RequirementSuggestionVO {
            return RequirementSuggestionVO(
                id = domain.id!!,
                requirementId = domain.requirementId,
                suggestions = domain.suggestions,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 