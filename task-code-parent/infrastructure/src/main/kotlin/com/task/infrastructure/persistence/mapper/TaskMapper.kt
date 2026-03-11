package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TaskRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 任务数据访问接口
 * 提供对任务表的响应式CRUD操作
 */
@Repository
interface TaskMapper : ReactiveCrudRepository<TaskRecord, Long> {
}
