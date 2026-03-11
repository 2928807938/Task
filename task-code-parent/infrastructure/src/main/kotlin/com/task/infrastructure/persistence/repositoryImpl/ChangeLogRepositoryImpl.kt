package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.attachment.EntityTypeEnum
import com.task.domain.model.audit.ChangeLog
import com.task.domain.model.audit.ChangeTypeEnum
import com.task.domain.repository.ChangeLogRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.ChangeLogMapper
import com.task.infrastructure.persistence.record.ChangeLogRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * ChangeLogRepository接口的实现类
 * 实现变更日志相关的数据访问操作
 */
@Repository
class ChangeLogRepositoryImpl(
    override val mapper: ChangeLogMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<ChangeLog, ChangeLogRecord, ChangeLogMapper>(), ChangeLogRepository {

    override val entityClass: KClass<ChangeLogRecord> = ChangeLogRecord::class

    override fun getId(entity: ChangeLog): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 变更历史记录
     * @return 变更历史领域模型
     */
    override fun toEntity(record: ChangeLogRecord): ChangeLog {
        return ChangeLog(
            id = record.id ?: 0,
            entityType = EntityTypeEnum.fromCodeOrThrow(record.entityType),
            entityId = record.entityId,
            changeType = ChangeTypeEnum.fromCodeOrThrow(record.changeType),
            fieldName = record.fieldName,
            oldValue = record.oldValue,
            newValue = record.newValue,
            description = record.description,
            userId = record.userId,
            createdAt = record.createdAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 变更历史领域模型
     * @return 变更历史记录
     */
    override fun toRecord(entity: ChangeLog): ChangeLogRecord {
        return ChangeLogRecord(
            entityType = entity.entityType.code,
            entityId = entity.entityId,
            changeType = entity.changeType.code,
            fieldName = entity.fieldName,
            oldValue = entity.oldValue,
            newValue = entity.newValue,
            description = entity.description,
            userId = entity.userId
        ).apply {
            id = if (entity.id > 0) entity.id else null
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = null // 变更历史通常不会更新
        }
    }
}
