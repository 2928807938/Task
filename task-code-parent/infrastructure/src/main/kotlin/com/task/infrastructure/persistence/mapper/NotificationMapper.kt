package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.NotificationRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 通知数据访问接口
 * 提供对通知表的响应式CRUD操作
 */
@Repository
interface NotificationMapper : ReactiveCrudRepository<NotificationRecord, Long> {
}
