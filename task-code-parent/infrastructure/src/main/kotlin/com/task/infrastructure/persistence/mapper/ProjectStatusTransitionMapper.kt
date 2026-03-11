package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.ProjectStatusTransitionRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 项目状态转换数据访问接口
 * 提供对项目状态转换表的响应式CRUD操作
 */
@Repository
interface ProjectStatusTransitionMapper : ReactiveCrudRepository<ProjectStatusTransitionRecord, Long> {
}
