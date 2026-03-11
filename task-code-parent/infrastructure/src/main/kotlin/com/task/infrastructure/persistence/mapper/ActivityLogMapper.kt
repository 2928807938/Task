package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.ActivityLogRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 活动日志记录数据访问接口
 * 提供对活动日志记录表的响应式CRUD操作
 */
//@Repository
interface ActivityLogMapper : ReactiveCrudRepository<ActivityLogRecord, Long> {
}
