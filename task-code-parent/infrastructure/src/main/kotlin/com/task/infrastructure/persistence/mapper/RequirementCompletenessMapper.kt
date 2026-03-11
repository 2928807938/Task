package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RequirementCompletenessRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 需求完整性记录数据访问接口
 * 提供对需求完整性记录表的响应式CRUD操作
 */
@Repository
interface RequirementCompletenessMapper : ReactiveCrudRepository<RequirementCompletenessRecord, Long> 