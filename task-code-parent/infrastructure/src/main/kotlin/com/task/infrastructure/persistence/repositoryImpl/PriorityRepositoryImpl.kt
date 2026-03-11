package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.Priority
import com.task.domain.repository.PriorityRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.PriorityMapper
import com.task.infrastructure.persistence.record.PriorityRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * PriorityRepository接口的实现类
 * 实现优先级相关的数据访问操作
 */
@Repository
class PriorityRepositoryImpl(
    override val mapper: PriorityMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<Priority, PriorityRecord, PriorityMapper>(), PriorityRepository {

    override val entityClass: KClass<PriorityRecord> = PriorityRecord::class

    override fun getId(entity: Priority): Long {
        return entity.id
    }

    override fun toEntity(record: PriorityRecord): Priority {
        return Priority(
            id = record.id ?: throw IllegalArgumentException("Priority id cannot be null"),
            projectId = record.projectId,
            name = record.name,
            level = record.level,
            score = record.score,
            color = record.color,
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    override fun toRecord(entity: Priority): PriorityRecord {
        return PriorityRecord(
            projectId = entity.projectId,
            name = entity.name,
            level = entity.level,
            score = entity.score,
            color = entity.color,
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
