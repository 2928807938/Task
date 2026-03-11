package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.ChangeLogRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 变更历史记录访问接口
 * 提供对变更历史记录表的响应式CRUD操作
 */
@Repository
interface ChangeLogMapper : ReactiveCrudRepository<ChangeLogRecord, Long> {
}
