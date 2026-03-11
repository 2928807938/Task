package com.task.application.vo

import com.task.domain.model.task.requirementpriority.Factors
import com.task.domain.model.task.requirementpriority.PriorityDetails
import com.task.domain.model.task.requirementpriority.RequirementPriority
import com.task.domain.model.task.requirementpriority.Scheduling
import java.time.OffsetDateTime

/**
 * 需求优先级视图对象
 */
data class RequirementPriorityVO(
    /**
     * 唯一标识
     */
    val id: Long,
    
    /**
     * 关联的需求ID
     */
    val requirementId: Long?,
    
    /**
     * 优先级详情
     */
    val priority: PriorityDetails,
    
    /**
     * 排期信息
     */
    val scheduling: Scheduling,
    
    /**
     * 各种影响因素
     */
    val factors: Factors,
    
    /**
     * 优先级说明
     */
    val justification: String?,
    
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
        fun fromDomain(domain: RequirementPriority): RequirementPriorityVO {
            return RequirementPriorityVO(
                id = domain.id!!,
                requirementId = domain.requirementId,
                priority = domain.priority,
                scheduling = domain.scheduling,
                factors = domain.factors,
                justification = domain.justification,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 