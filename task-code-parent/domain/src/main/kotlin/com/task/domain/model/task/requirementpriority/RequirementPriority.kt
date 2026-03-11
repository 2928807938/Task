package com.task.domain.model.task.requirementpriority

import java.time.OffsetDateTime

/**
 * 需求优先级领域模型
 * 存储需求的优先级信息，包括优先级详情、排期信息和因素信息
 */
data class RequirementPriority(
    /**
     * 唯一标识
     */
    val id: Long?,
    
    /**
     * 关联到需求的ID
     */
    val requirementId: Long?,
    
    /**
     * 优先级信息，存储为JSON格式
     */
    val priority: PriorityDetails,
    
    /**
     * 排期信息，存储为JSON格式
     */
    val scheduling: Scheduling,
    
    /**
     * 因素信息，存储为JSON格式
     */
    val factors: Factors,
    
    /**
     * 排期建议理由
     */
    val justification: String?,
    
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
         * 创建新的需求优先级
         */
        fun create(
            priority: PriorityDetails,
            scheduling: Scheduling,
            factors: Factors,
            justification: String? = null
        ): RequirementPriority {
            val now = OffsetDateTime.now()
            return RequirementPriority(
                id = null,
                requirementId = null,
                priority = priority,
                scheduling = scheduling,
                factors = factors,
                justification = justification,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
    
    /**
     * 更新优先级信息
     */
    fun update(
        priority: PriorityDetails,
        scheduling: Scheduling,
        factors: Factors,
        justification: String?
    ): RequirementPriority {
        return this.copy(
            priority = priority,
            scheduling = scheduling,
            factors = factors,
            justification = justification,
            updatedAt = OffsetDateTime.now()
        )
    }
} 