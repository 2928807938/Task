package com.task.domain.model.notification

import com.task.domain.model.common.EnableStatusEnum
import java.time.OffsetDateTime

/**
 * 通知设置领域模型
 * 用户的通知首选项设置
 */
data class NotificationPreference(
    /**
     * 设置唯一标识
     */
    val id: Long?,

    /**
     * 用户ID
     */
    val userId: Long,

    /**
     * 通知类型
     */
    val notificationType: NotificationTypeEnum,

    /**
     * 是否启用邮件通知
     */
    val emailEnabled: EnableStatusEnum = EnableStatusEnum.ENABLED,

    /**
     * 是否启用应用内通知
     */
    val inAppEnabled: EnableStatusEnum = EnableStatusEnum.ENABLED,

    /**
     * 是否启用移动推送通知
     */
    val pushEnabled: EnableStatusEnum = EnableStatusEnum.ENABLED,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime?,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)
