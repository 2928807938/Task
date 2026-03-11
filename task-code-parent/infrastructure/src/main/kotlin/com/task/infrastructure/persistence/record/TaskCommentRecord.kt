package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 任务评论表记录类
 * 映射到数据库中的t_task_comment表，存储任务评论信息
 */
@Table("t_task_comment")
data class TaskCommentRecord(
    /**
     * 任务ID，关联t_task表
     */
    val taskId: Long,

    /**
     * 评论作者ID，关联t_user表
     */
    val authorId: Long,

    /**
     * 评论内容
     */
    val content: String,

    /**
     * 父评论ID，用于实现评论回复功能，可为空
     */
    val parentCommentId: Long? = null
) : BaseRecord()
