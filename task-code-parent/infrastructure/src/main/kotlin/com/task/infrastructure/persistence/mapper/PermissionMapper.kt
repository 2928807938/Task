package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.PermissionRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 权限数据访问接口
 * 提供对权限表的响应式CRUD操作
 */
@Repository
interface PermissionMapper : ReactiveCrudRepository<PermissionRecord, Long> {
}
