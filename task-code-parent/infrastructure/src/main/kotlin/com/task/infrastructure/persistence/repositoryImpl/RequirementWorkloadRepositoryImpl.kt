package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.requirementworkload.RequirementWorkload
import com.task.domain.repository.RequirementWorkloadRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RequirementWorkloadMapper
import com.task.infrastructure.persistence.record.RequirementWorkloadRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RequirementWorkloadRepository接口的实现类
 * 实现需求工作量相关的数据访问操作
 */
@Repository
class RequirementWorkloadRepositoryImpl(
    override val mapper: RequirementWorkloadMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<RequirementWorkload, RequirementWorkloadRecord, RequirementWorkloadMapper>(), RequirementWorkloadRepository {

    override val entityClass: KClass<RequirementWorkloadRecord> = RequirementWorkloadRecord::class

    override fun getId(entity: RequirementWorkload): Long? {
        return entity.id
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 需求工作量领域模型
     * @return 需求工作量记录类
     */
    override fun toRecord(entity: RequirementWorkload): RequirementWorkloadRecord {
        return RequirementWorkloadRecord(
            requirementId = entity.requirementId,
            optimisticJson = entity.optimistic,
            mostLikelyJson = entity.mostLikely,
            pessimisticJson = entity.pessimistic,
            expectedJson = entity.expected,
            standardDeviationJson = entity.standardDeviation
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
     * @param record 需求工作量记录类
     * @return 需求工作量领域模型
     */
    override fun toEntity(record: RequirementWorkloadRecord): RequirementWorkload {
        return RequirementWorkload(
            id = record.id,
            requirementId = record.requirementId,
            optimistic = record.optimisticJson,
            mostLikely = record.mostLikelyJson,
            pessimistic = record.pessimisticJson,
            expected = record.expectedJson,
            standardDeviation = record.standardDeviationJson,
            deleted = record.deleted,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
} 