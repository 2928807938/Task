package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.task.TimeEntry
import com.task.domain.repository.TimeEntryRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TimeEntryMapper
import com.task.infrastructure.persistence.record.TimeEntryRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TimeEntryRepository接口的实现类
 * 实现时间跟踪相关的数据访问操作
 */
@Repository
class TimeEntryRepositoryImpl(
    override val mapper: TimeEntryMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<TimeEntry, TimeEntryRecord, TimeEntryMapper>(), TimeEntryRepository {

    override val entityClass: KClass<TimeEntryRecord> = TimeEntryRecord::class

    override fun getId(entity: TimeEntry): Long {
        return entity.id
    }

    override fun toEntity(record: TimeEntryRecord): TimeEntry {
        return TimeEntry(
            id = record.id ?: 0L,
            taskId = record.taskId,
            task = null, // 关联对象需要单独查询
            userId = record.userId,
            user = null, // 关联对象需要单独查询
            startTime = record.startTime,
            endTime = record.endTime,
            duration = record.duration,
            description = record.description,
            billingType = record.billingType,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    override fun toRecord(entity: TimeEntry): TimeEntryRecord {
        return TimeEntryRecord(
            taskId = entity.taskId,
            userId = entity.userId,
            startTime = entity.startTime,
            endTime = entity.endTime,
            duration = entity.duration,
            description = entity.description,
            billingType = entity.billingType
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
