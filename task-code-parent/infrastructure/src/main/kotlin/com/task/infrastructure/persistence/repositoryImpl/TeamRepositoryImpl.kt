package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.team.Team
import com.task.domain.repository.TeamRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.TeamMapper
import com.task.infrastructure.persistence.record.TeamRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * TeamRepository接口的实现类
 * 实现团队相关的数据访问操作
 */
@Repository
class TeamRepositoryImpl(
    override val mapper: TeamMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<Team, TeamRecord, TeamMapper>(), TeamRepository {

    override val entityClass: KClass<TeamRecord> = TeamRecord::class

    override fun getId(entity: Team): Long {
        return entity.id
    }

    override fun toEntity(record: TeamRecord): Team {
        return Team(
            id = record.id ?: throw IllegalArgumentException("团队ID不能为空"),
            name = record.name,
            description = record.description,
            creatorId = record.creatorId,
            creator = null, // 需要通过关联查询获取，这里先设为null
            members = emptyList(), // 需要通过关联查询获取，这里先设为空列表
            roles = emptyList(), // 需要通过关联查询获取，这里先设为空列表
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt
        )
    }

    override fun toRecord(entity: Team): TeamRecord {
        return TeamRecord(
            name = entity.name,
            description = entity.description,
            creatorId = entity.creatorId
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
