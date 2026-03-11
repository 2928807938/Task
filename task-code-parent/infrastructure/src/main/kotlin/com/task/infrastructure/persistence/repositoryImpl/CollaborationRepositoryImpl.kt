package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.team.Collaboration
import com.task.domain.repository.CollaborationRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.CollaborationMapper
import com.task.infrastructure.persistence.record.CollaborationRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import kotlin.reflect.KClass

/**
 * CollaborationRepository接口的实现类
 * 实现协作记录相关的数据访问操作
 */
@Repository
class CollaborationRepositoryImpl(
    override val mapper: CollaborationMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<Collaboration, CollaborationRecord, CollaborationMapper>(), CollaborationRepository {

    override val entityClass: KClass<CollaborationRecord> = CollaborationRecord::class

    override fun getId(entity: Collaboration): Long {
        return entity.id ?: throw IllegalArgumentException("协作记录ID不能为空")
    }

    /**
     * 从领域模型到记录类的转换
     *
     * @param entity 协作记录领域模型
     * @return 协作记录记录类
     */
    override fun toRecord(entity: Collaboration): CollaborationRecord {
        return CollaborationRecord(
            taskId = entity.taskId,
            senderId = entity.senderId,
            mentionedUserId = entity.mentionedUserId,
            content = entity.content,
            type = entity.type
        ).apply {
            id = entity.id
            deleted = entity.deleted
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt ?: OffsetDateTime.now()
            version = entity.version
        }
    }

    /**
     * 从记录类到领域模型的转换
     *
     * @param record 协作记录记录类
     * @return 协作记录领域模型
     */
    override fun toEntity(record: CollaborationRecord): Collaboration {
        return Collaboration(
            id = record.id,
            taskId = record.taskId,
            senderId = record.senderId,
            mentionedUserId = record.mentionedUserId,
            content = record.content,
            type = record.type,
            deleted = record.deleted,
            createdAt = record.createdAt ?: OffsetDateTime.now(),
            updatedAt = record.updatedAt,
            version = record.version
        )
    }
} 