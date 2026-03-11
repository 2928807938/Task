package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RoleRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 角色数据访问接口
 * 提供对角色表的响应式CRUD操作
 */
@Repository
interface RoleMapper : ReactiveCrudRepository<RoleRecord, Long> {
}
