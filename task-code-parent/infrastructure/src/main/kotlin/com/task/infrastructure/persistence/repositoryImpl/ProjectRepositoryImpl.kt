package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.project.Project
import com.task.domain.repository.ProjectRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.ProjectMapper
import com.task.infrastructure.persistence.record.ProjectRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * ProjectRepository接口的实现类
 * 实现项目相关的数据访问操作
 */
@Repository
class ProjectRepositoryImpl(
    override val mapper: ProjectMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<Project, ProjectRecord, ProjectMapper>(), ProjectRepository {

    override val entityClass: KClass<ProjectRecord> = ProjectRecord::class

    override fun getId(entity: Project): Long? {
        return entity.id
    }

    override fun toEntity(record: ProjectRecord): Project {
        return Project(
            id = record.id ?: 0,
            name = record.name,
            description = record.description,
            teamId = record.teamId,
            team = null, // 需要通过关联查询获取
            archived = record.archived,
            startDate = record.startDate,
            creatorId = record.creatorId,
            creator = null, // 需要通过关联查询获取
            members = emptyList(), // 需要通过关联查询获取
            roles = emptyList(), // 需要通过关联查询获取
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    override fun toRecord(entity: Project): ProjectRecord {
        return ProjectRecord(
            name = entity.name,
            description = entity.description,
            teamId = entity.teamId,
            archived = entity.archived,
            startDate = entity.startDate,
            creatorId = entity.creatorId,
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
