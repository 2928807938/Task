package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TagCategoryRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 标签分类数据访问接口
 * 提供对标签分类表的响应式CRUD操作
 */
@Repository
interface TagCategoryMapper : ReactiveCrudRepository<TagCategoryRecord, Long> {
}
