package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.ProjectRoleRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 项目角色数据访问接口
 * 提供对项目角色表的响应式CRUD操作
 */
@Repository
interface ProjectRoleMapper : ReactiveCrudRepository<ProjectRoleRecord, Long> {
}
