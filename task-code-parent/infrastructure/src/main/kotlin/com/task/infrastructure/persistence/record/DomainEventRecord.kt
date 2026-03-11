package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 领域事件记录
 * 用于将领域事件持久化到数据库
 */
@Table("t_domain_event")
data class DomainEventRecord(

    /**
     * 事件ID，用于唯一标识事件实例
     */
    val eventId: String,

    /**
     * 事件类型
     */
    val eventType: String,

    /**
     * 聚合根ID
     */
    val aggregateId: String,

    /**
     * 聚合根类型
     */
    val aggregateType: String,

    /**
     * 事件发生时间
     */
    val timestamp: OffsetDateTime,

    /**
     * 事件数据，JSON格式
     */
    val eventData: String,

    /**
     * 跟踪ID，用于分布式跟踪
     */
    val traceId: String?,

    /**
     * 用户ID，表示触发事件的用户
     */
    val userId: String?,

    /**
     * 租户ID，用于多租户系统
     */
    val tenantId: String?,

    /**
     * 是否已处理，用于事件处理状态跟踪
     */
    val processed: Boolean
) : BaseRecord()