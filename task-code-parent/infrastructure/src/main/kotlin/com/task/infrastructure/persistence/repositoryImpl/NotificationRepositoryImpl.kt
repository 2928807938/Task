package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.activity.ResourceTypeEnum
import com.task.domain.model.notification.Notification
import com.task.domain.model.notification.NotificationStatusEnum
import com.task.domain.model.notification.NotificationTypeEnum
import com.task.domain.repository.NotificationRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.NotificationMapper
import com.task.infrastructure.persistence.record.NotificationRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * NotificationRepository接口的实现类
 * 实现通知相关的数据访问操作
 */
@Repository
class NotificationRepositoryImpl(
    override val mapper: NotificationMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<Notification, NotificationRecord, NotificationMapper>(), NotificationRepository {

    override val entityClass: KClass<NotificationRecord> = NotificationRecord::class

    override fun getId(entity: Notification): Long {
        return entity.id
    }

    // 领域模型转记录类
    override fun toRecord(entity: Notification): NotificationRecord {
        return NotificationRecord(
            userId = entity.userId,
            type = entity.type.code,
            title = entity.title,
            content = entity.content,
            status = entity.status!!.code,
            entityType = entity.entityType!!.code,
            entityId = entity.entityId,
            triggeredById = entity.triggeredById,
            actionUrl = entity.actionUrl,
            readAt = entity.readAt,
        )
    }

    // 记录类转领域模型
    override fun toEntity(record: NotificationRecord): Notification {
        return Notification(
            id = record.id!!,
            userId = record.userId,
            user = null, // 这里需要根据实际情况处理，可能需要通过userRepository查询
            type = NotificationTypeEnum.fromCodeOrThrow(record.type),
            title = record.title,
            content = record.content,
            status = NotificationStatusEnum.fromCode(record.status),
            entityType = ResourceTypeEnum.fromCode(record.entityType),
            entityId = record.entityId,
            triggeredById = record.triggeredById,
            actionUrl = record.actionUrl,
            createdAt = record.createdAt,
            readAt = record.readAt,
            version = record.version
        )
    }
}
