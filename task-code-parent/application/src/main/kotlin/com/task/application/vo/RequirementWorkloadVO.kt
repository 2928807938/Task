package com.task.application.vo

import com.task.domain.model.task.requirementworkload.RequirementWorkload
import java.time.OffsetDateTime

/**
 * 需求工作量视图对象
 */
data class RequirementWorkloadVO(
    /**
     * 唯一标识
     */
    val id: Long,
    
    /**
     * 关联的需求ID
     */
    val requirementId: Long?,
    
    /**
     * 乐观估计工作量
     */
    val optimistic: String,
    
    /**
     * 最可能工作量
     */
    val mostLikely: String,
    
    /**
     * 悲观估计工作量
     */
    val pessimistic: String,
    
    /**
     * 期望工作量（自动计算）
     */
    val expected: String,
    
    /**
     * 标准差（自动计算）
     */
    val standardDeviation: String,
    
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
        fun fromDomain(domain: RequirementWorkload): RequirementWorkloadVO {
            return RequirementWorkloadVO(
                id = domain.id!!,
                requirementId = domain.requirementId,
                optimistic = domain.optimistic,
                mostLikely = domain.mostLikely,
                pessimistic = domain.pessimistic,
                expected = domain.expected,
                standardDeviation = domain.standardDeviation,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 