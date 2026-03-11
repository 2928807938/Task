package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.ProjectRolePermissionRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 项目角色-权限关联数据访问接口
 * 提供对项目角色-权限关联表的响应式CRUD操作
 */
@Repository
interface ProjectRolePermissionMapper : ReactiveCrudRepository<ProjectRolePermissionRecord, Long> {
}
