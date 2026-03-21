package com.task.infrastructure.persistence.repositoryImpl

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.task.domain.model.llm.prompt.LlmPromptConfig
import com.task.domain.model.llm.prompt.LlmPromptScopeTypeEnum
import com.task.domain.model.llm.prompt.LlmPromptStatusEnum
import com.task.domain.repository.LlmPromptConfigRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.LlmPromptConfigMapper
import com.task.infrastructure.persistence.record.LlmPromptConfigRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * LLM提示词配置仓储实现。
 */
@Repository
class LlmPromptConfigRepositoryImpl(
    override val mapper: LlmPromptConfigMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService,
    private val objectMapper: ObjectMapper
) : BaseRepository<LlmPromptConfig, LlmPromptConfigRecord, LlmPromptConfigMapper>(), LlmPromptConfigRepository {

    override val entityClass: KClass<LlmPromptConfigRecord> = LlmPromptConfigRecord::class

    override fun getId(entity: LlmPromptConfig): Long? = entity.id

    override fun toRecord(entity: LlmPromptConfig): LlmPromptConfigRecord {
        return LlmPromptConfigRecord(
            scopeType = entity.scopeType.name,
            scopeObjectId = entity.scopeObjectId,
            promptName = entity.promptName,
            promptContent = entity.promptContent,
            allSceneEnabled = entity.allSceneEnabled,
            sceneKeysJson = objectMapper.writeValueAsString(entity.sceneKeys),
            status = entity.status.name,
            priority = entity.priority
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
            version = entity.version
            deleted = entity.deleted
        }
    }

    override fun toEntity(record: LlmPromptConfigRecord): LlmPromptConfig {
        return LlmPromptConfig(
            id = record.id,
            scopeType = runCatching { LlmPromptScopeTypeEnum.valueOf(record.scopeType) }
                .getOrDefault(LlmPromptScopeTypeEnum.USER),
            scopeObjectId = record.scopeObjectId,
            promptName = record.promptName,
            promptContent = record.promptContent,
            allSceneEnabled = record.allSceneEnabled,
            sceneKeys = parseSceneKeys(record.sceneKeysJson),
            status = runCatching { LlmPromptStatusEnum.valueOf(record.status) }
                .getOrDefault(LlmPromptStatusEnum.DISABLED),
            priority = record.priority,
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    private fun parseSceneKeys(sceneKeysJson: String?): List<String> {
        if (sceneKeysJson.isNullOrBlank()) {
            return emptyList()
        }
        return runCatching {
            objectMapper.readValue(sceneKeysJson, object : TypeReference<List<String>>() {})
        }.getOrDefault(emptyList())
    }
}
