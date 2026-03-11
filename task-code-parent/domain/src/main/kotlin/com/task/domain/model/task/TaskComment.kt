package com.task.domain.model.task

import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 任务评论领域模型
 * 代表任务的一条评论
 */
data class TaskComment(
    /**
     * 评论唯一标识
     */
    val id: Long,

    /**
     * 所属任务ID
     */
    val taskId: Long,

    /**
     * 所属任务
     */
    val task: Task? = null,

    /**
     * 评论内容
     */
    val content: String,

    /**
     * 评论作者ID
     */
    val authorId: Long,

    /**
     * 评论作者
     */
    val author: User? = null,

    /**
     * 父评论ID，用于实现评论回复功能
     */
    val parentCommentId: Long? = null,

    /**
     * 父评论
     */
    val parentComment: TaskComment? = null,

    /**
     * 子评论列表
     */
    val replies: List<TaskComment> = emptyList(),

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
