package com.task.domain.model.task

import java.time.OffsetDateTime

/**
 * 任务标签关联领域模型
 * 代表任务与标签之间的多对多关系
 */
data class TaskTag(
    /**
     * 关联唯一标识
     */
    val id: Long,

    /**
     * 任务ID
     */
    val taskId: Long,

    /**
     * 任务
     */
    val task: Task? = null,

    /**
     * 标签ID
     */
    val tagId: Long,

    /**
     * 标签
     */
    val tag: Tag? = null,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)
