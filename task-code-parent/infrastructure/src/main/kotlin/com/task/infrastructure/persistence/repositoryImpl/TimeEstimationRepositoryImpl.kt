package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.BaselineTypeEnum
import com.task.domain.model.task.TimeEstimation
import com.task.domain.repository.TimeEstimationRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TimeEstimationMapper
import com.task.infrastructure.persistence.record.TimeEstimationRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TimeEstimationRepository接口的实现类
 * 实现时间估计相关的数据访问操作
 */
@Repository
class TimeEstimationRepositoryImpl(
    override val mapper: TimeEstimationMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<TimeEstimation, TimeEstimationRecord, TimeEstimationMapper>(), TimeEstimationRepository {

    override val entityClass: KClass<TimeEstimationRecord> = TimeEstimationRecord::class

    override fun getId(entity: TimeEstimation): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     */
    override fun toEntity(record: TimeEstimationRecord): TimeEstimation {
        return TimeEstimation(
            id = record.id ?: throw IllegalArgumentException("时间估计ID不能为空"),
            taskId = record.taskId,
            estimatedHours = record.estimatedHours,
            createdById = record.createdById,
            baselineType = BaselineTypeEnum.fromCode(record.baselineType),
            justification = record.justification,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     */
    override fun toRecord(entity: TimeEstimation): TimeEstimationRecord {
        return TimeEstimationRecord(
            taskId = entity.taskId,
            estimatedHours = entity.estimatedHours,
            createdById = entity.createdById,
            baselineType = entity.baselineType.code,
            justification = entity.justification
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
