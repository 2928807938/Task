package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 任务表记录类
 * 映射到数据库中的t_task表，存储任务信息
 */
@Table("t_task")
data class TaskRecord(

    /**
     * 任务标题
     */
    val title: String,

    /**
     * 任务描述
     */
    val description: String?,

    /**
     * 所属项目ID，关联t_projects表
     */
    val projectId: Long,

    /**
     * 父任务ID，关联t_tasks表，用于实现任务层级结构
     */
    val parentTaskId: Long?,

    /**
     * 任务状态ID，关联t_task_status表
     */
    val statusId: Long,

    /**
     * 任务优先级ID，关联t_priorities表
     */
    val priorityId: Long,

    /**
     * 任务创建者ID，关联t_users表
     */
    val creatorId: Long,

    /**
     * 任务负责人ID，关联t_users表
     */
    val assigneeId: Long?,

    /**
     * 任务开始时间
     */
    val startTime: OffsetDateTime?,

    /**
     * 任务截止日期
     */
    val dueDate: OffsetDateTime?,

    ) : BaseRecord()
