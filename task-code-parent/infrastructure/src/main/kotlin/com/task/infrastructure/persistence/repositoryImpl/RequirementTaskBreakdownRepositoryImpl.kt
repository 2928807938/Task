package com.task.infrastructure.persistence.repositoryImpl

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.task.domain.model.task.requirementtaskbreakdown.RequirementTaskBreakdown
import com.task.domain.model.task.requirementtaskbreakdown.SubTask
import com.task.domain.repository.RequirementTaskBreakdownRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RequirementTaskBreakdownMapper
import com.task.infrastructure.persistence.record.RequirementTaskBreakdownRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RequirementTaskBreakdownRepository接口的实现类
 * 实现需求任务拆分相关的数据访问操作
 */
@Repository
class RequirementTaskBreakdownRepositoryImpl(
    override val mapper: RequirementTaskBreakdownMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService,
    private val objectMapper: ObjectMapper
) : BaseRepository<RequirementTaskBreakdown, RequirementTaskBreakdownRecord, RequirementTaskBreakdownMapper>(), RequirementTaskBreakdownRepository {

    override val entityClass: KClass<RequirementTaskBreakdownRecord> = RequirementTaskBreakdownRecord::class

    override fun getId(entity: RequirementTaskBreakdown): Long? {
        return entity.id
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 需求任务拆分领域模型
     * @return 需求任务拆分记录类
     */
    override fun toRecord(entity: RequirementTaskBreakdown): RequirementTaskBreakdownRecord {
        return RequirementTaskBreakdownRecord(
            requirementId = entity.requirementId,
            mainTask = entity.mainTask,
            subTasksJson = objectMapper.writeValueAsString(entity.subTasks),
            parallelismScore = entity.parallelismScore,
            parallelExecutionTips = entity.parallelExecutionTips
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
     * @param record 需求任务拆分记录类
     * @return 需求任务拆分领域模型
     */
    override fun toEntity(record: RequirementTaskBreakdownRecord): RequirementTaskBreakdown {
        val subTasks: List<SubTask> = try {
            objectMapper.readValue(record.subTasksJson)
        } catch (e: Exception) {
            emptyList()
        }
        
        return RequirementTaskBreakdown(
            id = record.id,
            requirementId = record.requirementId,
            mainTask = record.mainTask,
            subTasks = subTasks,
            parallelismScore = record.parallelismScore,
            parallelExecutionTips = record.parallelExecutionTips,
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
} 