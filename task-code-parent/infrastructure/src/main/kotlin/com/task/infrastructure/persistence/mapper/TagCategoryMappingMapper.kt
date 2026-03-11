package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TagCategoryMappingRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 标签与分类关联Mapper接口
 */
@Repository
interface TagCategoryMappingMapper : ReactiveCrudRepository<TagCategoryMappingRecord, Long> {
}