package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.event.core.EventProcessingLog
import com.task.domain.repository.EventProcessingLogRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.EventProcessingLogMapper
import com.task.infrastructure.persistence.record.EventProcessingLogRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * 领域事件仓储实现
 * 负责将领域事件持久化到数据库，以支持事件溯源和审计
 */
@Repository
class EventProcessingLogRepositoryImpl(
    override val mapper: EventProcessingLogMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<EventProcessingLog, EventProcessingLogRecord, EventProcessingLogMapper>(), EventProcessingLogRepository {

    override val entityClass: KClass<EventProcessingLogRecord> = EventProcessingLogRecord::class

    override fun getId(entity: EventProcessingLog): Long? {
        return entity.id
    }

    override fun toEntity(record: EventProcessingLogRecord): EventProcessingLog {
        return EventProcessingLog(
            id = record.id,
            eventId = record.eventId,
            handlerName = record.handlerName,
            status = EventProcessingLog.Status.valueOf(record.status),
            errorMessage = record.errorMessage,
            retryCount = record.retryCount,
            lastProcessedAt = record.lastProcessedAt
        )
    }

    override fun toRecord(entity: EventProcessingLog): EventProcessingLogRecord {
        return EventProcessingLogRecord(
            eventId = entity.eventId,
            handlerName = entity.handlerName,
            status = entity.status.name,
            errorMessage = entity.errorMessage,
            retryCount = entity.retryCount,
            lastProcessedAt = entity.lastProcessedAt
        ).apply {
            id = entity.id
        }
    }
}