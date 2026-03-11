package com.task.infrastructure.persistence.repositoryImpl

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.task.domain.model.task.requirementsuggestion.RequirementSuggestion
import com.task.domain.model.task.requirementsuggestion.Suggestion
import com.task.domain.repository.RequirementSuggestionRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RequirementSuggestionMapper
import com.task.infrastructure.persistence.record.RequirementSuggestionRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RequirementSuggestionRepository接口的实现类
 * 实现需求智能建议相关的数据访问操作
 */
@Repository
class RequirementSuggestionRepositoryImpl(
    override val mapper: RequirementSuggestionMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService,
    private val objectMapper: ObjectMapper
) : BaseRepository<RequirementSuggestion, RequirementSuggestionRecord, RequirementSuggestionMapper>(), RequirementSuggestionRepository {

    override val entityClass: KClass<RequirementSuggestionRecord> = RequirementSuggestionRecord::class

    override fun getId(entity: RequirementSuggestion): Long? {
        return entity.id
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 需求智能建议领域模型
     * @return 需求智能建议记录类
     */
    override fun toRecord(entity: RequirementSuggestion): RequirementSuggestionRecord {
        return RequirementSuggestionRecord(
            requirementId = entity.requirementId,
            suggestionsJson = objectMapper.writeValueAsString(entity.suggestions)
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
            version = entity.version
            deleted = entity.deleted
        }
    }

    /**
     * 从记录类到领域模型的转换
     *
     * @param record 需求智能建议记录类
     * @return 需求智能建议领域模型
     */
    override fun toEntity(record: RequirementSuggestionRecord): RequirementSuggestion {
        val suggestions: List<Suggestion> = if (record.suggestionsJson != null) {
            objectMapper.readValue(record.suggestionsJson)
        } else {
            emptyList()
        }
        
        return RequirementSuggestion(
            id = record.id,
            requirementId = record.requirementId,
            suggestions = suggestions,
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
} 