package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RequirementCategoryRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 需求分类记录数据访问接口
 * 提供对需求分类记录表的响应式CRUD操作
 */
@Repository
interface RequirementCategoryMapper : ReactiveCrudRepository<RequirementCategoryRecord, Long> 