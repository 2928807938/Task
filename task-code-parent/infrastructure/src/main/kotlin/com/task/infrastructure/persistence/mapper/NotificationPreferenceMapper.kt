package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.NotificationPreferenceRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 通知设置数据访问接口
 * 提供对通知设置表的响应式CRUD操作
 */
@Repository
interface NotificationPreferenceMapper : ReactiveCrudRepository<NotificationPreferenceRecord, Long> {
}
