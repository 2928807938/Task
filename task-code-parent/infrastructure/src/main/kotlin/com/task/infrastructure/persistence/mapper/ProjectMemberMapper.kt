package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.ProjectMemberRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 项目成员数据访问接口
 * 提供对项目成员表的响应式CRUD操作
 */
@Repository
interface ProjectMemberMapper : ReactiveCrudRepository<ProjectMemberRecord, Long> {
}
