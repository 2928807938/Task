package com.task.domain.model.task.requirementconversationlist

import java.time.OffsetDateTime

/**
 * 需求会话回合领域模型
 * 每次用户输入产出一条回合快照记录
 */
data class RequirementConversationTurn(
    val id: Long?,
    val conversationListId: Long,
    val turnNo: Int,
    val userInput: String,
    val analysisStartStatus: String? = null,
    val analysisCompleteStatus: String? = null,
    val snapshotJson: String,
    val deleted: Int = 0,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime?,
    val version: Int = 0
) {
    companion object {
        fun create(
            conversationListId: Long,
            turnNo: Int,
            userInput: String,
            analysisStartStatus: String?,
            analysisCompleteStatus: String?,
            snapshotJson: String
        ): RequirementConversationTurn {
            val now = OffsetDateTime.now()
            return RequirementConversationTurn(
                id = null,
                conversationListId = conversationListId,
                turnNo = turnNo,
                userInput = userInput,
                analysisStartStatus = analysisStartStatus,
                analysisCompleteStatus = analysisCompleteStatus,
                snapshotJson = snapshotJson,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
}
