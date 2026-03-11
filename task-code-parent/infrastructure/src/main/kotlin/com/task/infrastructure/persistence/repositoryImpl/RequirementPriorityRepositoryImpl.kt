package com.task.infrastructure.persistence.repositoryImpl

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.task.domain.model.task.requirementpriority.Factors
import com.task.domain.model.task.requirementpriority.PriorityDetails
import com.task.domain.model.task.requirementpriority.RequirementPriority
import com.task.domain.model.task.requirementpriority.Scheduling
import com.task.domain.repository.RequirementPriorityRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RequirementPriorityMapper
import com.task.infrastructure.persistence.record.RequirementPriorityRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RequirementPriorityRepository接口的实现类
 * 实现需求优先级相关的数据访问操作
 */
@Repository
class RequirementPriorityRepositoryImpl(
    override val mapper: RequirementPriorityMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService,
    private val objectMapper: ObjectMapper
) : BaseRepository<RequirementPriority, RequirementPriorityRecord, RequirementPriorityMapper>(), RequirementPriorityRepository {

    override val entityClass: KClass<RequirementPriorityRecord> = RequirementPriorityRecord::class

    override fun getId(entity: RequirementPriority): Long? {
        return entity.id
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 需求优先级领域模型
     * @return 需求优先级记录类
     */
    override fun toRecord(entity: RequirementPriority): RequirementPriorityRecord {
        return RequirementPriorityRecord(
            requirementId = entity.requirementId,
            priorityJson = objectMapper.writeValueAsString(entity.priority),
            schedulingJson = objectMapper.writeValueAsString(entity.scheduling),
            factorsJson = objectMapper.writeValueAsString(entity.factors),
            justification = entity.justification
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
     * @param record 需求优先级记录类
     * @return 需求优先级领域模型
     */
    override fun toEntity(record: RequirementPriorityRecord): RequirementPriority {
        val priority: PriorityDetails = if (record.priorityJson != null) {
            objectMapper.readValue(record.priorityJson)
        } else {
            PriorityDetails("Medium", 5, "Default priority")
        }
        
        val scheduling: Scheduling = if (record.schedulingJson != null) {
            objectMapper.readValue(record.schedulingJson)
        } else {
            Scheduling("No recommendation")
        }
        
        val factors: Factors = if (record.factorsJson != null) {
            objectMapper.readValue(record.factorsJson)
        } else {
            throw IllegalStateException("factorsJson不能为空")
        }
        
        return RequirementPriority(
            id = record.id,
            requirementId = record.requirementId,
            priority = priority,
            scheduling = scheduling,
            factors = factors,
            justification = record.justification,
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
}