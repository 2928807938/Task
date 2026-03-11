package com.task.application.vo

import com.task.domain.model.task.requirementtaskbreakdown.RequirementTaskBreakdown
import com.task.domain.model.task.requirementtaskbreakdown.SubTask
import java.time.OffsetDateTime

/**
 * 需求任务拆分视图对象
 */
data class RequirementTaskBreakdownVO(
    /**
     * 唯一标识
     */
    val id: Long,
    
    /**
     * 关联的需求ID
     */
    val requirementId: Long?,
    
    /**
     * 主任务描述
     */
    val mainTask: String,
    
    /**
     * 子任务列表
     */
    val subTasks: List<SubTask>,
    
    /**
     * 并行度评分
     */
    val parallelismScore: Int?,
    
    /**
     * 并行执行提示
     */
    val parallelExecutionTips: String?,
    
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
        fun fromDomain(domain: RequirementTaskBreakdown): RequirementTaskBreakdownVO {
            return RequirementTaskBreakdownVO(
                id = domain.id!!,
                requirementId = domain.requirementId,
                mainTask = domain.mainTask,
                subTasks = domain.subTasks,
                parallelismScore = domain.parallelismScore,
                parallelExecutionTips = domain.parallelExecutionTips,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 