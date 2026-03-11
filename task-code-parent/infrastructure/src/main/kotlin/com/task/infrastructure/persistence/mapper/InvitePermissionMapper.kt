package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.InvitePermissionRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 邀请权限记录数据访问接口
 */
@Repository
interface InvitePermissionMapper : ReactiveCrudRepository<InvitePermissionRecord, Long> {
}