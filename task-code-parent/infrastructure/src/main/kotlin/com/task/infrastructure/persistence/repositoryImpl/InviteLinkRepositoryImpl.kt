package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.invite.InviteLink
import com.task.domain.repository.InviteLinkRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.InviteLinkMapper
import com.task.infrastructure.persistence.record.InviteLinkRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import kotlin.reflect.KClass

/**
 * InviteLinkRepository接口的实现类
 * 实现邀请链接相关的数据访问操作
 */
@Repository
class InviteLinkRepositoryImpl(
    override val mapper: InviteLinkMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService,
) : BaseRepository<InviteLink, InviteLinkRecord, InviteLinkMapper>(), InviteLinkRepository {

    override val entityClass: KClass<InviteLinkRecord> = InviteLinkRecord::class

    override fun getId(entity: InviteLink): Long {
        return entity.id ?: 0L
    }

    /**
     * 将数据库记录转换为领域实体
     *
     * @param record 邀请链接数据库记录
     * @return 邀请链接领域实体
     */
    override fun toEntity(record: InviteLinkRecord): InviteLink {
        return InviteLink(
            id = record.id,
            code = record.code,
            creatorId = record.creatorId,
            projectId = record.projectId,
            expireAt = record.expireAt,
            maxUsageCount = record.maxUsageCount,
            usedCount = record.usedCount,
            permissions = emptyList(),
            deleted = record.deleted,
            createdAt = record.createdAt ?: OffsetDateTime.now(),
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域实体转换为数据库记录
     *
     * @param entity 邀请链接领域实体
     * @return 邀请链接数据库记录
     */
    override fun toRecord(entity: InviteLink): InviteLinkRecord {
        return InviteLinkRecord(
            code = entity.code,
            creatorId = entity.creatorId,
            projectId = entity.projectId,
            expireAt = entity.expireAt,
            maxUsageCount = entity.maxUsageCount,
            usedCount = entity.usedCount
        )
    }
}