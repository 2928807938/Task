package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RequirementSuggestionRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 需求建议记录数据访问接口
 * 提供对需求建议记录表的响应式CRUD操作
 */
@Repository
interface RequirementSuggestionMapper : ReactiveCrudRepository<RequirementSuggestionRecord, Long> 