package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RolePermissionRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 角色-权限关联数据访问接口
 * 提供对角色-权限关联表的响应式CRUD操作
 */
@Repository
interface RolePermissionMapper : ReactiveCrudRepository<RolePermissionRecord, Long> {
}
