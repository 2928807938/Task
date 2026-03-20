package com.task.application.vo

import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.model.task.requirementconversationlist.RequirementConversationList
import com.task.domain.model.task.requirementconversationlist.RequirementConversationTurn
import java.time.OffsetDateTime

/**
 * 项目下需求会话历史简要信息
 */
data class RequirementConversationHistoryBriefVO(
    val conversationListId: Long,
    val projectId: Long?,
    val conversationId: Long?,
    val title: String,
    val rootMainTask: String?,
    val currentTurnNo: Int,
    val analysisStartStatus: String?,
    val analysisCompleteStatus: String?,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime?
) {
    companion object {
        fun fromDomain(
            conversationList: RequirementConversationList,
            conversation: RequirementConversation?
        ): RequirementConversationHistoryBriefVO {
            return RequirementConversationHistoryBriefVO(
                conversationListId = requireNotNull(conversationList.id) { "conversationListId不能为空" },
                projectId = conversationList.projectId,
                conversationId = conversation?.id,
                title = conversation?.title ?: "未命名需求会话",
                rootMainTask = conversation?.rootMainTask,
                currentTurnNo = conversation?.currentTurnNo ?: 0,
                analysisStartStatus = conversation?.analysisStartStatus,
                analysisCompleteStatus = conversation?.analysisCompleteStatus,
                createdAt = conversationList.createdAt,
                updatedAt = conversation?.updatedAt ?: conversationList.updatedAt
            )
        }
    }
}

/**
 * 当前会话快照视图
 */
data class RequirementConversationSnapshotVO(
    val id: Long,
    val conversationListId: Long?,
    val title: String,
    val startStatus: String?,
    val analysisStartStatus: String?,
    val analysisCompleteStatus: String?,
    val rootMainTask: String?,
    val currentTurnNo: Int,
    val latestTaskBreakdownJson: String?,
    val requirementTypeJson: String?,
    val priorityJson: String?,
    val workloadJson: String?,
    val completenessJson: String?,
    val suggestionJson: String?,
    val analysisSummaryJson: String?,
    val finalSummaryJson: String?,
    val taskPlanningJson: String?,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime?
) {
    companion object {
        fun fromDomain(conversation: RequirementConversation): RequirementConversationSnapshotVO {
            return RequirementConversationSnapshotVO(
                id = requireNotNull(conversation.id) { "conversationId不能为空" },
                conversationListId = conversation.conversationListId,
                title = conversation.title,
                startStatus = conversation.startStatus,
                analysisStartStatus = conversation.analysisStartStatus,
                analysisCompleteStatus = conversation.analysisCompleteStatus,
                rootMainTask = conversation.rootMainTask,
                currentTurnNo = conversation.currentTurnNo,
                latestTaskBreakdownJson = conversation.latestTaskBreakdownJson,
                requirementTypeJson = conversation.requirementTypeJson,
                priorityJson = conversation.priorityJson,
                workloadJson = conversation.workloadJson,
                completenessJson = conversation.completenessJson,
                suggestionJson = conversation.suggestionJson,
                analysisSummaryJson = conversation.analysisSummaryJson,
                finalSummaryJson = conversation.finalSummaryJson,
                taskPlanningJson = conversation.taskPlanningJson,
                createdAt = conversation.createdAt,
                updatedAt = conversation.updatedAt
            )
        }
    }
}

/**
 * 会话单轮记录视图
 */
data class RequirementConversationTurnVO(
    val id: Long,
    val conversationListId: Long,
    val turnNo: Int,
    val userInput: String,
    val analysisStartStatus: String?,
    val analysisCompleteStatus: String?,
    val snapshotJson: String,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime?
) {
    companion object {
        fun fromDomain(turn: RequirementConversationTurn): RequirementConversationTurnVO {
            return RequirementConversationTurnVO(
                id = requireNotNull(turn.id) { "turnId不能为空" },
                conversationListId = turn.conversationListId,
                turnNo = turn.turnNo,
                userInput = turn.userInput,
                analysisStartStatus = turn.analysisStartStatus,
                analysisCompleteStatus = turn.analysisCompleteStatus,
                snapshotJson = turn.snapshotJson,
                createdAt = turn.createdAt,
                updatedAt = turn.updatedAt
            )
        }
    }
}

/**
 * 历史对话详情视图
 */
data class RequirementConversationHistoryDetailVO(
    val conversationListId: Long,
    val projectId: Long?,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime?,
    val conversation: RequirementConversationSnapshotVO?,
    val turns: List<RequirementConversationTurnVO>
) {
    companion object {
        fun fromDomain(
            conversationList: RequirementConversationList,
            conversation: RequirementConversation?,
            turns: List<RequirementConversationTurnVO>
        ): RequirementConversationHistoryDetailVO {
            return RequirementConversationHistoryDetailVO(
                conversationListId = requireNotNull(conversationList.id) { "conversationListId不能为空" },
                projectId = conversationList.projectId,
                createdAt = conversationList.createdAt,
                updatedAt = conversation?.updatedAt ?: conversationList.updatedAt,
                conversation = conversation?.let { RequirementConversationSnapshotVO.fromDomain(it) },
                turns = turns
            )
        }
    }
}
