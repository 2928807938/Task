package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TimeEstimationRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 时间估计数据访问接口
 * 提供对时间估计表的响应式CRUD操作
 */
@Repository
interface TimeEstimationMapper : ReactiveCrudRepository<TimeEstimationRecord, Long> {
}
