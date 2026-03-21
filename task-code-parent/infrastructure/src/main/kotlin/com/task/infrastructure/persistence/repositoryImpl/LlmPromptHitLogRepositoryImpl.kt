package com.task.infrastructure.persistence.repositoryImpl

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.task.domain.model.llm.prompt.LlmPromptHitLog
import com.task.domain.repository.LlmPromptHitLogRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.LlmPromptHitLogMapper
import com.task.infrastructure.persistence.record.LlmPromptHitLogRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * LLM提示词命中日志仓储实现。
 */
@Repository
class LlmPromptHitLogRepositoryImpl(
    override val mapper: LlmPromptHitLogMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService,
    private val objectMapper: ObjectMapper
) : BaseRepository<LlmPromptHitLog, LlmPromptHitLogRecord, LlmPromptHitLogMapper>(), LlmPromptHitLogRepository {

    override val entityClass: KClass<LlmPromptHitLogRecord> = LlmPromptHitLogRecord::class

    override fun getId(entity: LlmPromptHitLog): Long? = entity.id

    override fun toRecord(entity: LlmPromptHitLog): LlmPromptHitLogRecord {
        return LlmPromptHitLogRecord(
            analysisRequestId = entity.analysisRequestId,
            sceneKey = entity.sceneKey,
            projectId = entity.projectId,
            userId = entity.userId,
            hitPromptIdsJson = objectMapper.writeValueAsString(entity.hitPromptIds),
            finalPromptPreview = entity.finalPromptPreview
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
            version = entity.version
            deleted = entity.deleted
        }
    }

    override fun toEntity(record: LlmPromptHitLogRecord): LlmPromptHitLog {
        return LlmPromptHitLog(
            id = record.id,
            analysisRequestId = record.analysisRequestId,
            sceneKey = record.sceneKey,
            projectId = record.projectId,
            userId = record.userId,
            hitPromptIds = parseHitPromptIds(record.hitPromptIdsJson),
            finalPromptPreview = record.finalPromptPreview,
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    private fun parseHitPromptIds(hitPromptIdsJson: String?): List<Long> {
        if (hitPromptIdsJson.isNullOrBlank()) {
            return emptyList()
        }
        return runCatching {
            objectMapper.readValue(hitPromptIdsJson, object : TypeReference<List<Long>>() {})
        }.getOrDefault(emptyList())
    }
}
