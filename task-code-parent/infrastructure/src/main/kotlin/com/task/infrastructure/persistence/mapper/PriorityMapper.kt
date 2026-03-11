package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.PriorityRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 优先级数据访问接口
 * 提供对优先级表的响应式CRUD操作
 */
@Repository
interface PriorityMapper : ReactiveCrudRepository<PriorityRecord, Long> {
}
