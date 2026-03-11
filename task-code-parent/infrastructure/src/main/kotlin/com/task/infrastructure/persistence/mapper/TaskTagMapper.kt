package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TaskTagRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 任务标签关联数据访问接口
 * 提供对任务标签关联表的响应式CRUD操作
 */
@Repository
interface TaskTagMapper : ReactiveCrudRepository<TaskTagRecord, Long> {
}
