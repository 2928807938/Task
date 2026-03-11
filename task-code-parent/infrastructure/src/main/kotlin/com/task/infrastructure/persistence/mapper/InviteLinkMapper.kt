package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.InviteLinkRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 邀请链接记录数据访问接口
 */
@Repository
interface InviteLinkMapper : ReactiveCrudRepository<InviteLinkRecord, Long> {
}