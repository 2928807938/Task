package com.task.infrastructure.persistence.repositoryImpl

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.task.domain.model.task.requirementcompleteness.Aspect
import com.task.domain.model.task.requirementcompleteness.OptimizationSuggestion
import com.task.domain.model.task.requirementcompleteness.RequirementCompleteness
import com.task.domain.repository.RequirementCompletenessRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RequirementCompletenessMapper
import com.task.infrastructure.persistence.record.RequirementCompletenessRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RequirementCompletenessRepository接口的实现类
 * 实现需求完整度检查相关的数据访问操作
 */
@Repository
class RequirementCompletenessRepositoryImpl(
    override val mapper: RequirementCompletenessMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService,
    private val objectMapper: ObjectMapper
) : BaseRepository<RequirementCompleteness, RequirementCompletenessRecord, RequirementCompletenessMapper>(), RequirementCompletenessRepository {

    override val entityClass: KClass<RequirementCompletenessRecord> = RequirementCompletenessRecord::class

    override fun getId(entity: RequirementCompleteness): Long? {
        return entity.id
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 需求完整度检查领域模型
     * @return 需求完整度检查记录类
     */
    override fun toRecord(entity: RequirementCompleteness): RequirementCompletenessRecord {
        return RequirementCompletenessRecord(
            requirementId = entity.requirementId,
            overallCompleteness = entity.overallCompleteness,
            aspectsJson = entity.aspects?.let { objectMapper.writeValueAsString(it) },
            optimizationSuggestionsJson = entity.optimizationSuggestions?.let { objectMapper.writeValueAsString(it) }
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
     * @param record 需求完整度检查记录类
     * @return 需求完整度检查领域模型
     */
    override fun toEntity(record: RequirementCompletenessRecord): RequirementCompleteness {
        return RequirementCompleteness(
            id = record.id,
            requirementId = record.requirementId,
            overallCompleteness = record.overallCompleteness,
            aspects = record.aspectsJson?.let { objectMapper.readValue<List<Aspect>>(it) },
            optimizationSuggestions = record.optimizationSuggestionsJson?.let { objectMapper.readValue<List<OptimizationSuggestion>>(it) },
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
} 