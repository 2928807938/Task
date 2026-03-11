package com.task.infrastructure.persistence.repositoryImpl

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.task.domain.model.task.requirementcategory.RequirementCategory
import com.task.domain.repository.RequirementCategoryRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RequirementCategoryMapper
import com.task.infrastructure.persistence.record.RequirementCategoryRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RequirementCategoryRepository接口的实现类
 * 实现需求分类相关的数据访问操作
 */
@Repository
class RequirementCategoryRepositoryImpl(
    override val mapper: RequirementCategoryMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService,
    private val objectMapper: ObjectMapper
) : BaseRepository<RequirementCategory, RequirementCategoryRecord, RequirementCategoryMapper>(), RequirementCategoryRepository {

    override val entityClass: KClass<RequirementCategoryRecord> = RequirementCategoryRecord::class

    override fun getId(entity: RequirementCategory): Long? {
        return entity.id
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 需求分类领域模型
     * @return 需求分类记录类
     */
    override fun toRecord(entity: RequirementCategory): RequirementCategoryRecord {
        return RequirementCategoryRecord(
            tagsJson = objectMapper.writeValueAsString(entity.tags),
            colorsJson = objectMapper.writeValueAsString(entity.colors)
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
     * @param record 需求分类记录类
     * @return 需求分类领域模型
     */
    override fun toEntity(record: RequirementCategoryRecord): RequirementCategory {
        return RequirementCategory(
            id = record.id,
            tags = objectMapper.readValue(record.tagsJson),
            colors = objectMapper.readValue(record.colorsJson),
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
} 