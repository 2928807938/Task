package com.task.domain.model.task.requirementworkload

import java.time.OffsetDateTime

/**
 * 需求工作量领域模型
 * 存储需求的工作量评估信息，包括乐观估计、最可能估计、悲观估计等
 */
data class RequirementWorkload(
    /**
     * 唯一标识
     */
    val id: Long?,
    
    /**
     * 关联到需求的ID
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
     * 期望工作量
     * 通常使用PERT公式计算: (optimistic + 4 * mostLikely + pessimistic) / 6
     */
    val expected: String,
    
    /**
     * 标准差
     * 通常计算为: (pessimistic - optimistic) / 6
     */
    val standardDeviation: String,
    
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
         * 创建新的需求工作量评估
         */
        fun create(
            optimistic: String,
            mostLikely: String,
            pessimistic: String,
            expected: String,
            standardDeviation: String
        ): RequirementWorkload {
            val now = OffsetDateTime.now()
            
            // 不需要计算，直接使用传入的值
            return RequirementWorkload(
                id = null,
                requirementId = null,
                optimistic = optimistic,
                mostLikely = mostLikely,
                pessimistic = pessimistic,
                expected = expected,
                standardDeviation = standardDeviation,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
    
    /**
     * 更新工作量评估
     */
    fun update(
        optimistic: String,
        mostLikely: String,
        pessimistic: String,
        expected: String,
        standardDeviation: String
    ): RequirementWorkload {
        // 直接使用传入的值，不需要再计算
        return this.copy(
            optimistic = optimistic,
            mostLikely = mostLikely,
            pessimistic = pessimistic,
            expected = expected,
            standardDeviation = standardDeviation,
            updatedAt = OffsetDateTime.now()
        )
    }
}