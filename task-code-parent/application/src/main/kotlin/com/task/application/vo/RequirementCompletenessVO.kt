package com.task.application.vo

import com.task.domain.model.task.requirementcompleteness.Aspect
import com.task.domain.model.task.requirementcompleteness.OptimizationSuggestion
import com.task.domain.model.task.requirementcompleteness.RequirementCompleteness
import java.time.OffsetDateTime

/**
 * 需求完整度检查视图对象
 */
data class RequirementCompletenessVO(
    /**
     * 唯一标识
     */
    val id: Long,
    
    /**
     * 关联的需求ID
     */
    val requirementId: Long?,
    
    /**
     * 总体完整度
     */
    val overallCompleteness: String,
    
    /**
     * 各方面的完整度
     */
    val aspects: List<Aspect>?,
    
    /**
     * 优化建议
     */
    val optimizationSuggestions: List<OptimizationSuggestion>?,
    
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
        fun fromDomain(domain: RequirementCompleteness): RequirementCompletenessVO {
            return RequirementCompletenessVO(
                id = domain.id!!,
                requirementId = domain.requirementId,
                overallCompleteness = domain.overallCompleteness,
                aspects = domain.aspects,
                optimizationSuggestions = domain.optimizationSuggestions,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 