package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TeamRoleRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 团队角色数据访问接口
 * 提供对团队角色表的响应式CRUD操作
 */
@Repository
interface TeamRoleMapper : ReactiveCrudRepository<TeamRoleRecord, Long> {
}
