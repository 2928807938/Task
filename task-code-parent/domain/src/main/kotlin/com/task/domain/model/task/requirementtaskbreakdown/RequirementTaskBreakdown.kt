package com.task.domain.model.task.requirementtaskbreakdown

import java.time.OffsetDateTime

/**
 * 需求任务拆分领域模型
 * 存储需求的任务拆分信息，包括主任务描述、子任务列表等
 */
data class RequirementTaskBreakdown(
    /**
     * 唯一标识
     */
    val id: Long?,
    
    /**
     * 关联到需求的ID
     */
    val requirementId: Long?,
    
    /**
     * 主任务描述
     */
    val mainTask: String,
    
    /**
     * 子任务列表，存储为JSON格式
     */
    val subTasks: List<SubTask>,
    
    /**
     * 并行度评分
     * 表示任务可并行执行的程度
     */
    val parallelismScore: Int?,
    
    /**
     * 并行执行提示
     * 对如何安排任务并行执行的建议
     */
    val parallelExecutionTips: String?,
    
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
         * 创建新的需求任务拆分
         */
        fun create(
            mainTask: String,
            subTasks: List<SubTask>,
            parallelismScore: Int? = null,
            parallelExecutionTips: String? = null
        ): RequirementTaskBreakdown {
            val now = OffsetDateTime.now()
            return RequirementTaskBreakdown(
                id = null,
                requirementId = null,
                mainTask = mainTask,
                subTasks = subTasks,
                parallelismScore = parallelismScore,
                parallelExecutionTips = parallelExecutionTips,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
    
    /**
     * 更新任务拆分信息
     */
    fun update(
        mainTask: String,
        subTasks: List<SubTask>,
        parallelismScore: Int?,
        parallelExecutionTips: String?
    ): RequirementTaskBreakdown {
        return this.copy(
            mainTask = mainTask,
            subTasks = subTasks,
            parallelismScore = parallelismScore,
            parallelExecutionTips = parallelExecutionTips,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 添加子任务
     */
    fun addSubTask(subTask: SubTask): RequirementTaskBreakdown {
        val updatedSubTasks = this.subTasks.toMutableList()
        updatedSubTasks.add(subTask)
        
        return this.copy(
            subTasks = updatedSubTasks,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 移除子任务
     */
    fun removeSubTask(subTaskId: Long): RequirementTaskBreakdown {
        val updatedSubTasks = this.subTasks.filter { it.id != subTaskId }
        
        return this.copy(
            subTasks = updatedSubTasks,
            updatedAt = OffsetDateTime.now()
        )
    }
} 