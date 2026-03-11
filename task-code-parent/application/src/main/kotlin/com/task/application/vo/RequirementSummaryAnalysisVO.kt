package com.task.application.vo

import com.task.domain.model.task.requirementsummaryanalysis.RequirementSummaryAnalysis
import com.task.domain.model.task.requirementsummaryanalysis.Summary
import com.task.domain.model.task.requirementsummaryanalysis.TaskArrangement
import java.time.OffsetDateTime

/**
 * 需求总结分析视图对象
 */
data class RequirementSummaryAnalysisVO(
    /**
     * 唯一标识
     */
    val id: Long,
    
    /**
     * 关联的需求ID
     */
    val requirementId: Long?,
    
    /**
     * 总结信息
     */
    val summary: Summary,
    
    /**
     * 任务安排
     */
    val taskArrangement: TaskArrangement,
    
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
        fun fromDomain(domain: RequirementSummaryAnalysis): RequirementSummaryAnalysisVO {
            return RequirementSummaryAnalysisVO(
                id = domain.id!!,
                requirementId = domain.requirementId,
                summary = domain.summary,
                taskArrangement = domain.taskArrangement,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 