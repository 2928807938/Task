package com.task.domain.model.task.requirementsummaryanalysis

import java.time.OffsetDateTime

/**
 * 需求摘要分析领域模型
 * 存储需求的摘要和任务安排分析
 */
data class RequirementSummaryAnalysis(
    /**
     * 唯一标识
     */
    val id: Long?,
    
    /**
     * 关联到需求的ID
     */
    val requirementId: Long?,
    
    /**
     * 摘要信息，存储为JSON格式
     */
    val summary: Summary,
    
    /**
     * 任务安排信息，存储为JSON格式
     */
    val taskArrangement: TaskArrangement,
    
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
         * 创建新的需求摘要分析
         */
        fun create(
            summary: Summary,
            taskArrangement: TaskArrangement
        ): RequirementSummaryAnalysis {
            val now = OffsetDateTime.now()
            return RequirementSummaryAnalysis(
                id = null,
                requirementId = null,
                summary = summary,
                taskArrangement = taskArrangement,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
    
    /**
     * 更新摘要和任务安排
     */
    fun update(
        summary: Summary,
        taskArrangement: TaskArrangement
    ): RequirementSummaryAnalysis {
        return this.copy(
            summary = summary,
            taskArrangement = taskArrangement,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 更新摘要信息
     */
    fun updateSummary(summary: Summary): RequirementSummaryAnalysis {
        return this.copy(
            summary = summary,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 更新任务安排
     */
    fun updateTaskArrangement(taskArrangement: TaskArrangement): RequirementSummaryAnalysis {
        return this.copy(
            taskArrangement = taskArrangement,
            updatedAt = OffsetDateTime.now()
        )
    }
} 