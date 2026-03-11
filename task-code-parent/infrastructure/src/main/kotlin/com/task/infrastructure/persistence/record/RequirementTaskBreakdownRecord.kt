package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 需求任务拆分记录类
 * 映射到数据库中的t_requirement_task_breakdown表，存储需求任务拆分信息
 */
@Table("t_requirement_task_breakdown")
data class RequirementTaskBreakdownRecord(
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
    val subTasksJson: String,
    
    /**
     * 并行度评分
     * 表示任务可并行执行的程度
     */
    val parallelismScore: Int?,
    
    /**
     * 并行执行提示
     * 对如何安排任务并行执行的建议
     */
    val parallelExecutionTips: String?

) : BaseRecord() 