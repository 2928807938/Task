package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 需求会话回合记录
 */
@Table("t_requirement_conversation_turn")
data class RequirementConversationTurnRecord(
    val conversationListId: Long,
    val turnNo: Int,
    val userInput: String,
    val analysisStartStatus: String? = null,
    val analysisCompleteStatus: String? = null,
    val snapshotJson: String
) : BaseRecord()
