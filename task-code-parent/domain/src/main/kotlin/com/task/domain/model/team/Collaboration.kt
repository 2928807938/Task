package com.task.domain.model.team

import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 协作领域模型
 * 用于记录任务协作过程中的消息和互动
 */
data class Collaboration(
    /**
     * 记录ID
     */
    val id: Long?,
    
    /**
     * 所属任务ID
     */
    val taskId: Long,

    /**
     * 发送者ID
     */
    val senderId: Long,

    /**
     * 发送者
     */
    val sender: User? = null,

    /**
     * 提及的用户ID
     * 如果消息中@了某个用户，这里记录被@的用户ID
     */
    val mentionedUserId: Long? = null,

    /**
     * 被提及的用户
     */
    val mentionedUser: User? = null,

    /**
     * 消息内容
     */
    val content: String,

    /**
     * 消息类型
     * MENTION - @消息
     * NORMAL - 普通消息
     */
    val type: CollaborationType = CollaborationType.NORMAL,

    /**
     * 逻辑删除标志
     */
    val deleted: Int = 0,

    /**
     * 记录创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 记录更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号
     */
    val version: Int = 0
) {
    companion object {
        /**
         * 创建新的协作消息
         */
        fun create(
            taskId: Long,
            senderId: Long,
            content: String,
            mentionedUserId: Long? = null,
            type: CollaborationType = if (mentionedUserId != null) CollaborationType.MENTION else CollaborationType.NORMAL
        ): Collaboration {
            val now = OffsetDateTime.now()
            return Collaboration(
                id = null,
                taskId = taskId,
                senderId = senderId,
                content = content,
                mentionedUserId = mentionedUserId,
                type = type,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
    
    /**
     * 更新协作消息内容
     */
    fun updateContent(newContent: String): Collaboration {
        return this.copy(
            content = newContent,
            updatedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 标记为已删除
     */
    fun markDeleted(): Collaboration {
        return this.copy(
            deleted = 1,
            updatedAt = OffsetDateTime.now()
        )
    }
}
