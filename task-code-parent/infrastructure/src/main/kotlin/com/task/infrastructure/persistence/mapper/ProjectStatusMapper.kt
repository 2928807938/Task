package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.ProjectStatusRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 项目状态数据访问接口
 * 提供对项目状态表的响应式CRUD操作
 */
@Repository
interface ProjectStatusMapper : ReactiveCrudRepository<ProjectStatusRecord, Long> {
}
