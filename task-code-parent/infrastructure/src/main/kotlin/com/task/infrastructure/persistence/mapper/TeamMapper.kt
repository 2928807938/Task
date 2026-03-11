package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TeamRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 团队数据访问接口
 * 提供对团队表的响应式CRUD操作
 */
@Repository
interface TeamMapper : ReactiveCrudRepository<TeamRecord, Long> {
}
