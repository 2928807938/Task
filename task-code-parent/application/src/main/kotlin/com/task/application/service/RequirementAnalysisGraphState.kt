package com.task.application.service

import java.time.OffsetDateTime

/**
 * 需求多轮分析图状态（会话级）
 */
data class RequirementAnalysisGraphState(
    val threadId: String,
    val conversationListId: Long?,
    val turnNo: Int,
    val isFirstTurn: Boolean,
    val rootMainTask: String,
    val currentUserInput: String,
    val previousTaskBreakdownJson: String?,
    val previousFinalSummaryJson: String?,
    var latestTaskBreakdownJson: String? = null,
    var requirementTypeJson: String? = null,
    var priorityJson: String? = null,
    var workloadJson: String? = null,
    var completenessJson: String? = null,
    var suggestionJson: String? = null,
    var analysisSummaryJson: String? = null,
    var finalSummaryJson: String? = null,
    var taskPlanningJson: String? = null,
    var analysisStartStatus: String = "STARTED",
    var analysisCompleteStatus: String = "PROCESSING",
    var updatedAt: OffsetDateTime = OffsetDateTime.now()
) {
    fun toSnapshotMap(success: Boolean, errorMessage: String?): Map<String, Any?> {
        return linkedMapOf(
            "threadId" to threadId,
            "conversationListId" to conversationListId,
            "turnNo" to turnNo,
            "isFirstTurn" to isFirstTurn,
            "rootMainTask" to rootMainTask,
            "currentUserInput" to currentUserInput,
            "previousTaskBreakdownJson" to previousTaskBreakdownJson,
            "previousFinalSummaryJson" to previousFinalSummaryJson,
            "latestTaskBreakdownJson" to latestTaskBreakdownJson,
            "requirementTypeJson" to requirementTypeJson,
            "priorityJson" to priorityJson,
            "workloadJson" to workloadJson,
            "completenessJson" to completenessJson,
            "suggestionJson" to suggestionJson,
            "analysisSummaryJson" to analysisSummaryJson,
            "finalSummaryJson" to finalSummaryJson,
            "taskPlanningJson" to taskPlanningJson,
            "analysisStartStatus" to analysisStartStatus,
            "analysisCompleteStatus" to analysisCompleteStatus,
            "success" to success,
            "errorMessage" to errorMessage,
            "updatedAt" to OffsetDateTime.now().toString()
        )
    }

    fun streamDisplayInfo(resultType: Int): Map<String, Any> {
        val info = linkedMapOf<String, Any>(
            "turnNo" to turnNo,
            "isFirstTurn" to isFirstTurn,
            "rootMainTask" to rootMainTask,
            "resultType" to resultType
        )
        conversationListId?.let { info["conversationListId"] = it }
        return info
    }
}
