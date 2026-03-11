package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.common.EnableStatusEnum
import com.task.domain.model.notification.NotificationPreference
import com.task.domain.model.notification.NotificationTypeEnum
import com.task.domain.repository.NotificationPreferenceRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.NotificationPreferenceMapper
import com.task.infrastructure.persistence.record.NotificationPreferenceRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * NotificationPreferenceRepository接口的实现类
 * 实现通知设置相关的数据访问操作
 */
@Repository
class NotificationPreferenceRepositoryImpl(
    override val mapper: NotificationPreferenceMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<NotificationPreference, NotificationPreferenceRecord, NotificationPreferenceMapper>(), NotificationPreferenceRepository {

    override val entityClass: KClass<NotificationPreferenceRecord> = NotificationPreferenceRecord::class

    override fun getId(entity: NotificationPreference): Long {
        return entity.userId
    }

    /**
     * 将数据库记录转换为领域实体
     *
     * @param record 通知首选项记录
     * @return 通知首选项领域实体
     */
    override fun toEntity(record: NotificationPreferenceRecord): NotificationPreference {
        return NotificationPreference(
            id = record.id,
            userId = record.userId,
            notificationType = NotificationTypeEnum.fromName(record.notificationType)
                ?: throw IllegalArgumentException("Invalid notification type: ${record.notificationType}"),
            emailEnabled = EnableStatusEnum.fromCode(record.emailEnabled, EnableStatusEnum.ENABLED),
            inAppEnabled = EnableStatusEnum.fromCode(record.inAppEnabled, EnableStatusEnum.ENABLED),
            pushEnabled = EnableStatusEnum.fromCode(record.pushEnabled, EnableStatusEnum.ENABLED),
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域实体转换为数据库记录
     *
     * @param entity 通知首选项领域实体
     * @return 通知首选项记录
     */
    override fun toRecord(entity: NotificationPreference): NotificationPreferenceRecord {
        val record = NotificationPreferenceRecord(
            userId = entity.userId,
            notificationType = entity.notificationType.name,
            emailEnabled = entity.emailEnabled.code,
            inAppEnabled = entity.inAppEnabled.code,
            pushEnabled = entity.pushEnabled.code
        )

        // 设置基础字段
        record.id = entity.id
        record.version = entity.version
        record.createdAt = entity.createdAt
        record.updatedAt = entity.updatedAt

        return record
    }
}
