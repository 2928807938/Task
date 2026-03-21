package com.task.domain.model.llm.prompt

import java.time.OffsetDateTime

/**
 * LLM提示词命中日志。
 * 记录一次场景分析过程中命中的提示词及最终提示词预览。
 *
 * @property id 命中日志ID
 * @property analysisRequestId 分析请求ID
 * @property sceneKey 场景标识
 * @property projectId 项目ID
 * @property userId 用户ID
 * @property hitPromptIds 命中的提示词ID列表
 * @property finalPromptPreview 最终提示词预览
 * @property deleted 逻辑删除标记，1表示已删除，0表示未删除
 * @property createdAt 创建时间
 * @property updatedAt 更新时间
 * @property version 乐观锁版本号
 */
data class LlmPromptHitLog(
    val id: Long?,
    val analysisRequestId: String,
    val sceneKey: String,
    val projectId: Long?,
    val userId: Long?,
    val hitPromptIds: List<Long> = emptyList(),
    val finalPromptPreview: String?,
    val deleted: Int = 0,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime?,
    val version: Int = 0
) {
    companion object {
        /**
         * 创建新的提示词命中日志。
         *
         * @param analysisRequestId 分析请求ID
         * @param sceneKey 场景标识
         * @param projectId 项目ID
         * @param userId 用户ID
         * @param hitPromptIds 命中的提示词ID列表
         * @param finalPromptPreview 最终提示词预览
         * @return 新创建的提示词命中日志
         */
        fun create(
            analysisRequestId: String,
            sceneKey: String,
            projectId: Long?,
            userId: Long?,
            hitPromptIds: List<Long>,
            finalPromptPreview: String?
        ): LlmPromptHitLog {
            val now = OffsetDateTime.now()
            return LlmPromptHitLog(
                id = null,
                analysisRequestId = analysisRequestId,
                sceneKey = sceneKey,
                projectId = projectId,
                userId = userId,
                hitPromptIds = hitPromptIds,
                finalPromptPreview = finalPromptPreview,
                deleted = 0,
                createdAt = now,
                updatedAt = now,
                version = 0
            )
        }
    }
}
