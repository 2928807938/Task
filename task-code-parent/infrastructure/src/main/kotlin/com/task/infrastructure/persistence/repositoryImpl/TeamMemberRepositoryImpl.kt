package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.team.TeamMember
import com.task.domain.repository.TeamMemberRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TeamMemberMapper
import com.task.infrastructure.persistence.record.TeamMemberRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TeamMemberRepository接口的实现类
 * 实现团队成员相关的数据访问操作
 */
@Repository
class TeamMemberRepositoryImpl(
    override val mapper: TeamMemberMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<TeamMember, TeamMemberRecord, TeamMemberMapper>(), TeamMemberRepository {

    override val entityClass: KClass<TeamMemberRecord> = TeamMemberRecord::class

    override fun getId(entity: TeamMember): Long {
        return entity.id
    }

    override fun toEntity(record: TeamMemberRecord): TeamMember {
        return TeamMember(
            id = record.id ?: throw IllegalArgumentException("团队成员ID不能为空"),
            teamId = record.teamId,
            team = null,  // 需要通过关联查询获取，这里先设为null
            userId = record.userId,
            user = null,  // 需要通过关联查询获取，这里先设为null
            roleId = record.roleId,
            role = null,  // 需要通过关联查询获取，这里先设为null
            joinedAt = record.joinedAt,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt
        )
    }

    override fun toRecord(entity: TeamMember): TeamMemberRecord {
        return TeamMemberRecord(
            teamId = entity.teamId,
            userId = entity.userId,
            roleId = entity.roleId,
            joinedAt = entity.joinedAt
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
