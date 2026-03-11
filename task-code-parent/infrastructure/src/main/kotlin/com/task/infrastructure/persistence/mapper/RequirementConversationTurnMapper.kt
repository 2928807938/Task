package com.task.infrastructure.persistence.mapper

import com.task.infrastructure.persistence.record.RequirementConversationTurnRecord
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

/**
 * 需求会话回合记录Mapper
 */
@Repository
interface RequirementConversationTurnMapper : ReactiveCrudRepository<RequirementConversationTurnRecord, Long>
