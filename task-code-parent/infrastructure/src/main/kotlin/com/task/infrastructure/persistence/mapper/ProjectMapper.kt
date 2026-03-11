package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.ProjectRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 项目数据访问接口
 * 提供对项目表的响应式CRUD操作
 */
@Repository
interface ProjectMapper : ReactiveCrudRepository<ProjectRecord, Long> {
}
