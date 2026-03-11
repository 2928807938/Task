package com.task.domain.event.core

import java.time.OffsetDateTime

/**
 * 事件处理日志
 * 用于记录事件处理的状态和结果
 */
class EventProcessingLog(
    /**
     * 日志ID
     */
    var id: Long?,
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
    val status: Status,
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
) {

    /**
     * 处理状态枚举
     */
    enum class Status {
        SUCCESS,
        FAILED,
        RETRYING
    }
    
    /**
     * 增加重试次数
     */
    fun incrementRetryCount(): EventProcessingLog {
        return EventProcessingLog(
            id = this.id,
            eventId = this.eventId,
            handlerName = this.handlerName,
            status = Status.RETRYING,
            errorMessage = this.errorMessage,
            retryCount = this.retryCount + 1,
            lastProcessedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 标记为成功
     */
    fun markAsSuccess(): EventProcessingLog {
        return EventProcessingLog(
            id = this.id,
            eventId = this.eventId,
            handlerName = this.handlerName,
            status = Status.SUCCESS,
            errorMessage = null,
            retryCount = this.retryCount,
            lastProcessedAt = OffsetDateTime.now()
        )
    }
    
    /**
     * 标记为失败
     */
    fun markAsFailed(errorMessage: String?): EventProcessingLog {
        return EventProcessingLog(
            id = this.id,
            eventId = this.eventId,
            handlerName = this.handlerName,
            status = Status.FAILED,
            errorMessage = errorMessage,
            retryCount = this.retryCount,
            lastProcessedAt = OffsetDateTime.now()
        )
    }
}
