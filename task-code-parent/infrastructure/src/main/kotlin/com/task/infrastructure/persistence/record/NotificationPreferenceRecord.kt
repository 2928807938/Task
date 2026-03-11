package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 通知设置记录类
 * 映射到数据库中的t_notification_preference表，存储用户通知首选项
 */
@Table("t_notification_preference")
data class NotificationPreferenceRecord(
    /**
     * 用户ID
     */
    val userId: Long,
    
    /**
     * 通知类型
     */
    val notificationType: String,
    
    /**
     * 是否启用邮件通知
     */
    val emailEnabled: Int,
    
    /**
     * 是否启用应用内通知
     */
    val inAppEnabled: Int,
    
    /**
     * 是否启用移动推送通知
     */
    val pushEnabled: Int
) : BaseRecord()
