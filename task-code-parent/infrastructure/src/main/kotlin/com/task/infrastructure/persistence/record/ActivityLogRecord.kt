package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 活动日志记录类
 * 映射到数据库中的t_activity_log表，存储系统活动日志
 */
@Table("t_activity_log")
data class ActivityLogRecord(
    /**
     * 活动类型
     * 存储ActivityTypeEnum枚举的整数编码
     */
    val activityType: Int,

    /**
     * 活动描述
     */
    val description: String,

    /**
     * 活动执行者ID
     */
    val actorId: Long,

    /**
     * 活动主要对象类型
     * 存储ResourceTypeEnum枚举的整数编码
     */
    val objectType: Int,

    /**
     * 活动主要对象ID
     */
    val objectId: Long,

    /**
     * 活动相关对象类型
     * 存储ResourceTypeEnum枚举的整数编码
     */
    val relatedObjectType: Int? = null,

    /**
     * 活动相关对象ID
     */
    val relatedObjectId: Long? = null,

    /**
     * 活动元数据
     */
    val metadata: String? = null

) : BaseRecord()