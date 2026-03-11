package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.DocumentVersionRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 文档版本记录数据访问接口
 * 提供对文档版本记录表的响应式CRUD操作
 */
@Repository
interface DocumentVersionMapper : ReactiveCrudRepository<DocumentVersionRecord, Long> {
}
