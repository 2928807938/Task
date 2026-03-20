package com.task.application.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.task.application.request.RequirementAnalysisRequest
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.task.requirementconversationlist.RequirementConversation
import com.task.domain.model.task.requirementconversationlist.RequirementConversationTurn
import com.task.domain.repository.RequirementConversationListRepository
import com.task.domain.repository.RequirementConversationRepository
import com.task.domain.repository.RequirementConversationTurnRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.time.OffsetDateTime
import kotlin.text.ifBlank

/**
 * 需求分析会话状态服务
 */
@Service
class RequirementAnalysisSessionService(
    private val requirementConversationListRepository: RequirementConversationListRepository,
    private val requirementConversationRepository: RequirementConversationRepository,
    private val requirementConversationTurnRepository: RequirementConversationTurnRepository,
    private val objectMapper: ObjectMapper
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    fun startTurn(request: RequirementAnalysisRequest): Mono<RequirementAnalysisGraphState> {
        val conversationListId = request.conversationListId
        if (conversationListId == null) {
            return Mono.just(
                RequirementAnalysisGraphState(
                    threadId = "adhoc-${System.currentTimeMillis()}",
                    conversationListId = null,
                    turnNo = 1,
                    isFirstTurn = true,
                    rootMainTask = request.content,
                    currentUserInput = request.content,
                    previousTaskBreakdownJson = null,
                    previousFinalSummaryJson = null
                )
            )
        }

        return requirementConversationListRepository.findById(conversationListId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("conversationListId=$conversationListId 不存在")))
            .flatMap { conversationList ->
                if (conversationList.projectId != null && conversationList.projectId != request.projectId) {
                    Mono.error(
                        IllegalArgumentException(
                            "conversationListId=$conversationListId 不属于项目ID=${request.projectId}"
                        )
                    )
                } else {
                    Mono.just(conversationList)
                }
            }
            .flatMap { findConversationByConversationListId(conversationListId) }
            .flatMap { existing ->
                val rootMainTask = existing.rootMainTask?.ifBlank { null } ?: request.content
                val nextTurnNo = (existing.currentTurnNo).coerceAtLeast(0) + 1
                val updated = existing.copy(
                    rootMainTask = existing.rootMainTask?.ifBlank { null } ?: request.content,
                    currentTurnNo = nextTurnNo,
                    analysisStartStatus = "STARTED",
                    analysisCompleteStatus = "PROCESSING",
                    updatedAt = OffsetDateTime.now()
                )
                requirementConversationRepository.update(updated)
                    .map {
                        RequirementAnalysisGraphState(
                            threadId = conversationListId.toString(),
                            conversationListId = conversationListId,
                            turnNo = nextTurnNo,
                            isFirstTurn = nextTurnNo == 1,
                            rootMainTask = rootMainTask,
                            currentUserInput = request.content,
                            previousTaskBreakdownJson = existing.latestTaskBreakdownJson,
                            previousFinalSummaryJson = existing.finalSummaryJson,
                            latestTaskBreakdownJson = existing.latestTaskBreakdownJson,
                            requirementTypeJson = existing.requirementTypeJson,
                            priorityJson = existing.priorityJson,
                            workloadJson = existing.workloadJson,
                            completenessJson = existing.completenessJson,
                            suggestionJson = existing.suggestionJson,
                            analysisSummaryJson = existing.analysisSummaryJson,
                            finalSummaryJson = existing.finalSummaryJson,
                            taskPlanningJson = existing.taskPlanningJson
                        )
                    }
            }
            .switchIfEmpty(
                createConversationSnapshot(conversationListId, request.content)
                    .map { saved ->
                        RequirementAnalysisGraphState(
                            threadId = conversationListId.toString(),
                            conversationListId = conversationListId,
                            turnNo = 1,
                            isFirstTurn = true,
                            rootMainTask = saved.rootMainTask ?: request.content,
                            currentUserInput = request.content,
                            previousTaskBreakdownJson = null,
                            previousFinalSummaryJson = null
                        )
                    }
            )
    }

    fun completeTurn(state: RequirementAnalysisGraphState, success: Boolean, errorMessage: String? = null): Mono<Void> {
        val conversationListId = state.conversationListId ?: return Mono.empty()
        state.analysisCompleteStatus = if (success) "SUCCESS" else "FAILED"
        state.updatedAt = OffsetDateTime.now()

        return findConversationByConversationListId(conversationListId)
            .switchIfEmpty(Mono.error(IllegalStateException("conversationListId=$conversationListId 对应会话快照不存在")))
            .flatMap { existing ->
                val updatedConversation = existing.copy(
                    rootMainTask = existing.rootMainTask?.ifBlank { null } ?: state.rootMainTask,
                    currentTurnNo = state.turnNo,
                    latestTaskBreakdownJson = state.latestTaskBreakdownJson ?: existing.latestTaskBreakdownJson,
                    requirementTypeJson = state.requirementTypeJson ?: existing.requirementTypeJson,
                    priorityJson = state.priorityJson ?: existing.priorityJson,
                    workloadJson = state.workloadJson ?: existing.workloadJson,
                    completenessJson = state.completenessJson ?: existing.completenessJson,
                    suggestionJson = state.suggestionJson ?: existing.suggestionJson,
                    analysisSummaryJson = state.analysisSummaryJson ?: existing.analysisSummaryJson,
                    finalSummaryJson = state.finalSummaryJson ?: existing.finalSummaryJson,
                    taskPlanningJson = state.taskPlanningJson ?: existing.taskPlanningJson,
                    analysisStartStatus = "COMPLETED",
                    analysisCompleteStatus = state.analysisCompleteStatus,
                    updatedAt = OffsetDateTime.now()
                )

                val snapshotJson = objectMapper.writeValueAsString(state.toSnapshotMap(success, errorMessage))
                val turn = RequirementConversationTurn.create(
                    conversationListId = conversationListId,
                    turnNo = state.turnNo,
                    userInput = state.currentUserInput,
                    analysisStartStatus = state.analysisStartStatus,
                    analysisCompleteStatus = state.analysisCompleteStatus,
                    snapshotJson = snapshotJson
                )

                requirementConversationRepository.update(updatedConversation)
                    .flatMap { requirementConversationTurnRepository.save(turn) }
                    .then()
            }
            .doOnError { error ->
                log.error("会话回合持久化失败: conversationListId={}, turnNo={}, error={}", conversationListId, state.turnNo, error.message, error)
            }
            .onErrorResume { Mono.empty() }
    }

    private fun createConversationSnapshot(conversationListId: Long, content: String): Mono<RequirementConversation> {
        val title = content.replace("\n", " ").trim().take(30).ifBlank { "需求会话-$conversationListId" }
        val created = RequirementConversation.create(
            title = title,
            startStatus = "STARTED",
            conversationListId = conversationListId
        ).copy(
            rootMainTask = content,
            currentTurnNo = 1,
            analysisStartStatus = "STARTED",
            analysisCompleteStatus = "PROCESSING",
            updatedAt = OffsetDateTime.now()
        )
        return requirementConversationRepository.save(created)
    }

    private fun findConversationByConversationListId(conversationListId: Long): Mono<RequirementConversation> {
        return requirementConversationRepository.findOne<RequirementConversation> {
            fieldOf(RequirementConversation::conversationListId, ComparisonOperator.EQUALS, conversationListId)
        }
    }
}
