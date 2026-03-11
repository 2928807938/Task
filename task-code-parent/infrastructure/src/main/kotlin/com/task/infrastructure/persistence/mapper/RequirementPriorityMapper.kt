package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RequirementPriorityRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 需求优先级记录数据访问接口
 * 提供对需求优先级记录表的响应式CRUD操作
 */
@Repository
interface RequirementPriorityMapper : ReactiveCrudRepository<RequirementPriorityRecord, Long> 