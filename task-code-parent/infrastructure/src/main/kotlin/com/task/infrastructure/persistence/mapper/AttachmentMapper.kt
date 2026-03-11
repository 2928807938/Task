package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.AttachmentRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 附件数据访问接口
 * 提供对附件表的响应式CRUD操作
 */
@Repository
interface AttachmentMapper : ReactiveCrudRepository<AttachmentRecord, Long> {
}
