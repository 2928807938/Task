package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TimeEntryRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 时间跟踪数据访问接口
 * 提供对时间跟踪表的响应式CRUD操作
 */
@Repository
interface TimeEntryMapper : ReactiveCrudRepository<TimeEntryRecord, Long> {
}
