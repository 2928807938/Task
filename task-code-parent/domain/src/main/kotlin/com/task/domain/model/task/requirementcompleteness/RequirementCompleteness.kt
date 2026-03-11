package com.task.domain.model.task.requirementcompleteness

import java.time.OffsetDateTime

/**
 * 需求完整度检查领域模型
 * 存储需求的完整度检查信息，包括总体完整度、各方面完整度和优化建议
 */
data class RequirementCompleteness(
    /**
     * 唯一标识
     */
    val id: Long?,
    
    /**
     * 关联到需求的ID
     */
    val requirementId: Long?,

    /**
     * 总体完整度
     * 可以是百分比或描述性评估
     */
    val overallCompleteness: String,
    
    /**
     * 各方面完整度，存储为JSON格式
     */
    val aspects: List<Aspect>?,
    
    /**
     * 优化建议，存储为JSON格式
     */
    val optimizationSuggestions: List<OptimizationSuggestion>?,
    
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
         * 创建新的需求完整度检查
         */
        fun create(
            overallCompleteness: String,
            aspects: List<Aspect>? = null,
            optimizationSuggestions: List<OptimizationSuggestion>? = null
        ): RequirementCompleteness {
            val now = OffsetDateTime.now()
            return RequirementCompleteness(
                id = null,
                requirementId = null,
                overallCompleteness = overallCompleteness,
                aspects = aspects,
                optimizationSuggestions = optimizationSuggestions,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
    
    /**
     * 更新完整度检查信息
     */
    fun update(
        overallCompleteness: String,
        aspects: List<Aspect>?,
        optimizationSuggestions: List<OptimizationSuggestion>?
    ): RequirementCompleteness {
        return this.copy(
            overallCompleteness = overallCompleteness,
            aspects = aspects,
            optimizationSuggestions = optimizationSuggestions,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 添加优化建议
     */
    fun addOptimizationSuggestion(suggestion: OptimizationSuggestion): RequirementCompleteness {
        val updatedSuggestions = (this.optimizationSuggestions ?: emptyList()).toMutableList()
        updatedSuggestions.add(suggestion)
        
        return this.copy(
            optimizationSuggestions = updatedSuggestions,
            updatedAt = OffsetDateTime.now()
        )
    }
} 