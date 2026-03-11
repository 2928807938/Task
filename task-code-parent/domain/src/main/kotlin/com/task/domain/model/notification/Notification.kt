package com.task.domain.model.notification

import com.task.domain.model.activity.ResourceTypeEnum
import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 通知领域模型
 * 代表系统中的一条通知
 */
data class Notification(
    /**
     * 通知唯一标识
     */
    val id: Long,

    /**
     * 通知接收用户ID
     */
    val userId: Long,

    /**
     * 通知接收用户
     */
    val user: User? = null,

    /**
     * 通知类型
     */
    val type: NotificationTypeEnum,

    /**
     * 通知标题
     */
    val title: String,

    /**
     * 通知内容
     */
    val content: String,

    /**
     * 通知状态
     */
    val status: NotificationStatusEnum?,

    /**
     * 关联实体类型
     */
    val entityType: ResourceTypeEnum?,

    /**
     * 关联实体ID
     */
    val entityId: Long? = null,

    /**
     * 通知触发者ID
     */
    val triggeredById: Long? = null,

    /**
     * 通知链接URL
     */
    val actionUrl: String? = null,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime?,

    /**
     * 读取时间
     */
    val readAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
) {
    /**
     * 判断通知是否已读
     */
    fun isRead(): Boolean = status == NotificationStatusEnum.READ || status == NotificationStatusEnum.ARCHIVED
    
    /**
     * 标记通知为已读
     */
    fun markAsRead(): Notification = copy(status = NotificationStatusEnum.READ, readAt = OffsetDateTime.now())
    
    /**
     * 归档通知
     */
    fun archive(): Notification = copy(status = NotificationStatusEnum.ARCHIVED)
}
