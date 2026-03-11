package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.ProjectStatusMappingRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 项目状态映射数据访问接口
 * 提供对项目状态映射表的响应式CRUD操作
 */
@Repository
interface ProjectStatusMappingMapper : ReactiveCrudRepository<ProjectStatusMappingRecord, Long> {
}
