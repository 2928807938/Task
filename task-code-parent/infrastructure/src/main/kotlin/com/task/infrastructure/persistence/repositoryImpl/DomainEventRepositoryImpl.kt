package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.event.core.DomainEvent
import com.task.domain.repository.DomainEventRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.DomainEventMapper
import com.task.infrastructure.persistence.record.DomainEventRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * 领域事件仓储实现
 * 负责将领域事件持久化到数据库，以支持事件溯源和审计
 */
@Repository
class DomainEventRepositoryImpl(
    override val mapper: DomainEventMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<DomainEvent, DomainEventRecord, DomainEventMapper>(), DomainEventRepository {
    override val entityClass: KClass<DomainEventRecord> = DomainEventRecord::class

    override fun getId(entity: DomainEvent): Long? {
        return entity.id;
    }

    override fun toEntity(record: DomainEventRecord): DomainEvent {
        // 创建匿名实现，包含所有必要字段
        val event = object : DomainEvent() {
            override val aggregateId: Any = record.aggregateId
            override val aggregateType: String = record.aggregateType
            override fun getEventData(): Any = record.eventData
            
            // 重写默认属性以使用记录中的值
            override val eventType: String = record.eventType
            override val version: String = "1.0" // 版本信息可能需要从eventData中提取
            override val traceId: String? = record.traceId
            override val tenantId: String? = record.tenantId
        }
        
        // 设置ID
        event.id = record.id
        
        return event
    }

    override fun toRecord(entity: DomainEvent): DomainEventRecord {
        // 将领域事件转换为数据库记录
        val record = DomainEventRecord(
            eventId = entity.id?.toString() ?: idGenerator.generateId().toString(),
            eventType = entity.eventType,
            aggregateId = entity.aggregateId.toString(),
            aggregateType = entity.aggregateType,
            timestamp = entity.timestamp,
            eventData = entity.getEventData().toString(), // 实际应用中可能需要序列化为JSON
            traceId = entity.traceId,
            tenantId = entity.tenantId,
            userId = null, // 这里可以从RequestContextHolder获取当前用户ID
            processed = false // 新事件默认未处理
        )
        
        // 设置BaseRecord的ID
        record.id = entity.id
        
        return record
    }
}