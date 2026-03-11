package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 通知记录类
 * 映射到数据库中的t_notification表，存储用户通知
 */
@Table("t_notification")
data class NotificationRecord(
    /**
     * 通知接收用户ID
     */
    val userId: Long,
    
    /**
     * 通知类型
     */
    val type: Int,
    
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
    val status: Int?,
    
    /**
     * 关联实体类型
     */
    val entityType: Int?,
    
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
     * 读取时间
     */
    val readAt: OffsetDateTime? = null
) : BaseRecord()
