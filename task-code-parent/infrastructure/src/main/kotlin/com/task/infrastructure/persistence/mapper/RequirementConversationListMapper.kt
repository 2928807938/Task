package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RequirementConversationListRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 需求对话列表基础记录数据访问接口
 */
@Repository
interface RequirementConversationListMapper : ReactiveCrudRepository<RequirementConversationListRecord, Long>
