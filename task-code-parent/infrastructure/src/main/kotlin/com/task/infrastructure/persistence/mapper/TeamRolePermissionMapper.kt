package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TeamRolePermissionRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 团队角色-权限关联数据访问接口
 * 提供对团队角色-权限关联表的响应式CRUD操作
 */
@Repository
interface TeamRolePermissionMapper : ReactiveCrudRepository<TeamRolePermissionRecord, Long> {
}
