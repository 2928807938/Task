package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 事件处理日志记录
 * 用于记录事件处理的状态和结果
 */
@Table("t_event_processing_log")
data class EventProcessingLogRecord(

    /**
     * 事件ID，关联到领域事件
     */
    val eventId: String,
    
    /**
     * 处理器名称，用于标识处理事件的组件
     */
    val handlerName: String,
    
    /**
     * 处理状态
     */
    val status: String,
    
    /**
     * 错误信息，如果处理失败
     */
    val errorMessage: String?,
    
    /**
     * 重试次数
     */
    val retryCount: Int,
    
    /**
     * 最后处理时间
     */
    val lastProcessedAt: OffsetDateTime
) : BaseRecord()
