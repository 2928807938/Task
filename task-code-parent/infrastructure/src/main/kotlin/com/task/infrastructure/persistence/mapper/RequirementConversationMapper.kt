package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RequirementConversationRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 需求对话列表记录数据访问接口
 * 提供对需求对话列表记录表的响应式CRUD操作
 */
@Repository
interface RequirementConversationMapper : ReactiveCrudRepository<RequirementConversationRecord, Long>