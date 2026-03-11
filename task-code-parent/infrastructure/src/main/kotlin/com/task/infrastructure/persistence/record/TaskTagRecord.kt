package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 任务标签关联表记录类
 * 映射到数据库中的t_task_tags表，存储任务与标签的关联关系
 */
@Table("t_task_tag")
data class TaskTagRecord(

    /**
     * 任务ID，关联t_tasks表
     */
    val taskId: Long,

    /**
     * 标签ID，关联t_tags表
     */
    val tagId: Long,

) : BaseRecord()
