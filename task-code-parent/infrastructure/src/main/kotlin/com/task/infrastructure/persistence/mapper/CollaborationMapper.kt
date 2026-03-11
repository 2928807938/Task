package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.CollaborationRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 协作记录数据访问接口
 * 提供对协作记录表的响应式CRUD操作
 */
@Repository
interface CollaborationMapper : ReactiveCrudRepository<CollaborationRecord, Long> {

} 