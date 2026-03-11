package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 时间跟踪表记录类
 * 映射到数据库中的t_time_entry表，存储任务时间跟踪信息
 */
@Table("t_time_entry")
data class TimeEntryRecord(
    /**
     * 任务ID，关联t_task表
     */
    val taskId: Long,

    /**
     * 用户ID，关联t_user表
     */
    val userId: Long,

    /**
     * 开始时间
     */
    val startTime: OffsetDateTime,

    /**
     * 结束时间
     */
    val endTime: OffsetDateTime?,

    /**
     * 持续时间（秒）
     * 如果endTime为空，则此字段也为空
     */
    val duration: Long?,

    /**
     * 描述
     */
    val description: String?,

    /**
     * 计费类型
     * @see
     */
    val billingType: Int
) : BaseRecord()