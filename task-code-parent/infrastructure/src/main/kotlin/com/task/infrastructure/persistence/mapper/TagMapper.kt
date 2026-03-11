package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.TagRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 标签数据访问接口
 * 提供对标签表的响应式CRUD操作
 */
@Repository
interface TagMapper : ReactiveCrudRepository<TagRecord, Long> {
}
