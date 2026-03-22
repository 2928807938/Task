package com.task.application.vo

import com.task.domain.model.llm.prompt.LlmPromptConfig
import com.task.domain.model.llm.prompt.LlmPromptHitLog
import java.time.OffsetDateTime

/**
 * LLM提示词配置视图对象。
 */
data class LlmPromptConfigVO(
    val id: Long,
    val scopeType: String,
    val scopeObjectId: Long,
    val promptName: String,
    val promptContent: String,
    val allSceneEnabled: Boolean,
    val sceneKeys: List<String>,
    val status: String,
    val priority: Int,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime?,
    val version: Int
) {
    companion object {
        fun fromDomain(domain: LlmPromptConfig): LlmPromptConfigVO {
            return LlmPromptConfigVO(
                id = domain.id ?: 0L,
                scopeType = domain.scopeType.name,
                scopeObjectId = domain.scopeObjectId,
                promptName = domain.promptName,
                promptContent = domain.promptContent,
                allSceneEnabled = domain.allSceneEnabled == 1,
                sceneKeys = domain.sceneKeys,
                status = domain.status.name,
                priority = domain.priority,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt,
                version = domain.version
            )
        }
    }
}

/**
 * LLM提示词预览中的命中项。
 */
data class LlmPromptMatchedItemVO(
    val id: Long?,
    val scopeType: String,
    val scopeObjectId: Long,
    val projectId: Long?,
    val promptName: String,
    val originalContent: String,
    val normalizedContent: String,
    val filteredLines: List<String>
)

/**
 * LLM提示词预览结果。
 */
data class LlmPromptPreviewVO(
    val sceneKey: String,
    val projectId: Long?,
    val userId: Long?,
    val analysisRequestId: String,
    val hitPromptIds: List<Long>,
    val projectPrompts: List<LlmPromptMatchedItemVO>,
    val userPrompts: List<LlmPromptMatchedItemVO>,
    val projectPromptContext: String,
    val userPromptContext: String,
    val effectivePromptProfile: String,
    val finalPromptPreview: String?
)

/**
 * LLM提示词冲突检测结果。
 */
data class LlmPromptConflictCheckVO(
    val sceneKey: String,
    val projectId: Long?,
    val userId: Long?,
    val userPromptCount: Int,
    val projectPromptCount: Int,
    val totalConflictCount: Int,
    val userUserConflictCount: Int,
    val userProjectConflictCount: Int,
    val projectProjectConflictCount: Int,
    val conflicts: List<LlmPromptConflictItemVO>
)

/**
 * 单条提示词冲突明细。
 */
data class LlmPromptConflictItemVO(
    val relationType: String,
    val conflictType: String,
    val promptAOpinion: String,
    val promptBOpinion: String,
    val reason: String,
    val resolutionRule: String,
    val winnerPromptId: Long?,
    val loserPromptId: Long?,
    val promptA: LlmPromptMatchedItemVO,
    val promptB: LlmPromptMatchedItemVO
)

/**
 * LLM提示词命中日志视图对象。
 */
data class LlmPromptHitLogVO(
    val id: Long,
    val analysisRequestId: String,
    val sceneKey: String,
    val projectId: Long?,
    val userId: Long?,
    val hitPromptIds: List<Long>,
    val finalPromptPreview: String?,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime?
) {
    companion object {
        fun fromDomain(domain: LlmPromptHitLog): LlmPromptHitLogVO {
            return LlmPromptHitLogVO(
                id = domain.id ?: 0L,
                analysisRequestId = domain.analysisRequestId,
                sceneKey = domain.sceneKey,
                projectId = domain.projectId,
                userId = domain.userId,
                hitPromptIds = domain.hitPromptIds,
                finalPromptPreview = domain.finalPromptPreview,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
}
