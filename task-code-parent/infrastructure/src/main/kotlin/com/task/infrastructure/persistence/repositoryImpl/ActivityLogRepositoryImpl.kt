package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.activity.ActivityLog
import com.task.domain.model.activity.ActivityTypeEnum
import com.task.domain.model.activity.ResourceTypeEnum
import com.task.domain.repository.ActivityLogRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.ActivityLogMapper
import com.task.infrastructure.persistence.record.ActivityLogRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * ActivityLogRepository接口的实现类
 * 实现活动日志相关的数据访问操作
 */
@Repository
class ActivityLogRepositoryImpl(
    override val mapper: ActivityLogMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<ActivityLog, ActivityLogRecord, ActivityLogMapper>(), ActivityLogRepository {

    override val entityClass: KClass<ActivityLogRecord> = ActivityLogRecord::class

    override fun getId(entity: ActivityLog): Long {
        return entity.id
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 活动日志领域模型
     * @return 活动日志记录类
     */
    override fun toRecord(entity: ActivityLog): ActivityLogRecord {
        return ActivityLogRecord(
            activityType = entity.activityType.code,
            description = entity.description,
            actorId = entity.actorId,
            objectType = entity.objectType.code,
            objectId = entity.objectId,
            relatedObjectType = entity.relatedObjectType?.code,
            relatedObjectId = entity.relatedObjectId,
            metadata = entity.metadata
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
        }
    }

    /**
     * 从记录类到领域模型的转换
     *
     * @param record 活动日志记录类
     * @return 活动日志领域模型
     */
    override fun toEntity(record: ActivityLogRecord): ActivityLog {
        return ActivityLog(
            id = record.id!!,
            activityType = ActivityTypeEnum.fromCode(record.activityType)
                ?: throw IllegalStateException("无效的活动类型编码: ${record.activityType}"),
            description = record.description,
            actorId = record.actorId,
            objectType = ResourceTypeEnum.fromCode(record.objectType)
                ?: throw IllegalStateException("无效的资源类型编码: ${record.objectType}"),
            objectId = record.objectId,
            relatedObjectType = record.relatedObjectType?.let {
                ResourceTypeEnum.fromCode(it)
                    ?: throw IllegalStateException("无效的相关资源类型编码: $it")
            },
            relatedObjectId = record.relatedObjectId,
            metadata = record.metadata,
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
}
