package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TeamMemberRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 团队成员数据访问接口
 * 提供对团队成员表的响应式CRUD操作
 */
@Repository
interface TeamMemberMapper : ReactiveCrudRepository<TeamMemberRecord, Long> {
}
