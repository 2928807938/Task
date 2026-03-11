package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.team.TeamRole
import com.task.domain.repository.TeamRoleRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TeamRoleMapper
import com.task.infrastructure.persistence.record.TeamRoleRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TeamRoleRepository接口的实现类
 * 实现团队角色相关的数据访问操作
 */
@Repository
class TeamRoleRepositoryImpl(
    override val mapper: TeamRoleMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
)  : BaseRepository<TeamRole, TeamRoleRecord, TeamRoleMapper>(), TeamRoleRepository {

    override val entityClass: KClass<TeamRoleRecord> = TeamRoleRecord::class

    override fun getId(entity: TeamRole): Long {
        return entity.id
    }

    override fun toEntity(record: TeamRoleRecord): TeamRole {
        return TeamRole(
            id = record.id ?: throw IllegalArgumentException("团队角色ID不能为空"),
            teamId = record.teamId,
            name = record.name,
            description = record.description,
            permissions = emptyList(), // 需要通过关联查询获取，这里先设为空列表
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt
        )
    }

    override fun toRecord(entity: TeamRole): TeamRoleRecord {
        return TeamRoleRecord(
            name = entity.name,
            description = entity.description,
            teamId = entity.teamId
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }

}
