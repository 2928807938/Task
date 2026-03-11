package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.EventProcessingLogRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 事件处理日志数据访问接口
 * 提供对活动日志记录表的响应式CRUD操作
 */
@Repository
interface EventProcessingLogMapper : ReactiveCrudRepository<EventProcessingLogRecord, Long> {
}
