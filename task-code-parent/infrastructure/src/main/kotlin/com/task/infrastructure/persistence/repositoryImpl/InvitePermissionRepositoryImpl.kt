package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.invite.InvitePermission
import com.task.domain.model.invite.TargetType
import com.task.domain.repository.InvitePermissionRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.InvitePermissionMapper
import com.task.infrastructure.persistence.record.InvitePermissionRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * InvitePermissionRepository接口的实现类
 * 实现邀请权限相关的数据访问操作
 */
@Repository
class InvitePermissionRepositoryImpl(
    override val mapper: InvitePermissionMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<InvitePermission, InvitePermissionRecord, InvitePermissionMapper>(), InvitePermissionRepository {

    override val entityClass: KClass<InvitePermissionRecord> = InvitePermissionRecord::class

    override fun getId(entity: InvitePermission): Long {
        return entity.id ?: 0L
    }

    /**
     * 将数据库记录转换为领域实体
     *
     * @param record 邀请权限数据库记录
     * @return 邀请权限领域实体
     */
    override fun toEntity(record: InvitePermissionRecord): InvitePermission {
        return InvitePermission(
            id = record.id,
            inviteLinkId = record.inviteLinkId,
            targetId = record.targetId,
            targetType = TargetType.valueOf(record.targetType),
            roleId = record.roleId,
            roleName = record.roleName
        )
    }

    /**
     * 将领域实体转换为数据库记录
     *
     * @param entity 邀请权限领域实体
     * @return 邀请权限数据库记录
     */
    override fun toRecord(entity: InvitePermission): InvitePermissionRecord {
        return InvitePermissionRecord(
            inviteLinkId = entity.inviteLinkId ?: 0,
            targetId = entity.targetId,
            targetType = entity.targetType.name,
            roleId = entity.roleId,
            roleName = entity.roleName
        )
    }
}