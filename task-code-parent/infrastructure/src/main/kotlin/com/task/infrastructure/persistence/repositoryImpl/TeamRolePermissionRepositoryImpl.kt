package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.team.TeamRolePermission
import com.task.domain.repository.TeamRolePermissionRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TeamRolePermissionMapper
import com.task.infrastructure.persistence.record.TeamRolePermissionRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TeamRolePermissionRepository接口的实现类
 * 实现团队角色权限相关的数据访问操作
 */
@Repository
class TeamRolePermissionRepositoryImpl(
    override val mapper: TeamRolePermissionMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<TeamRolePermission, TeamRolePermissionRecord, TeamRolePermissionMapper>(), TeamRolePermissionRepository {

    override val entityClass: KClass<TeamRolePermissionRecord> = TeamRolePermissionRecord::class

    override fun getId(entity: TeamRolePermission): Long {
        return entity.id
    }

    override fun toEntity(record: TeamRolePermissionRecord): TeamRolePermission {
        return TeamRolePermission(
            id = record.id ?: throw IllegalArgumentException("团队角色权限关联ID不能为空"),
            teamRoleId = record.teamRoleId,
            permissionId = record.permissionId,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt
        )
    }

    override fun toRecord(entity: TeamRolePermission): TeamRolePermissionRecord {
        return TeamRolePermissionRecord(
            teamRoleId = entity.teamRoleId,
            permissionId = entity.permissionId
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }

}
