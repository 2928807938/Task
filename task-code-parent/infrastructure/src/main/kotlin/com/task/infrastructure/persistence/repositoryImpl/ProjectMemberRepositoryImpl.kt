package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.project.ProjectMember
import com.task.domain.repository.ProjectMemberRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.ProjectMemberMapper
import com.task.infrastructure.persistence.record.ProjectMemberRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * ProjectMemberRepository接口的实现类
 * 实现项目成员相关的数据访问操作
 */
@Repository
class ProjectMemberRepositoryImpl(
    override val mapper: ProjectMemberMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<ProjectMember, ProjectMemberRecord, ProjectMemberMapper>(), ProjectMemberRepository {

    override val entityClass: KClass<ProjectMemberRecord> = ProjectMemberRecord::class

    override fun getId(entity: ProjectMember): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     * @param record 数据库记录
     * @return 领域模型
     */
    override fun toEntity(record: ProjectMemberRecord): ProjectMember {
        return ProjectMember(
            id = record.id ?: throw IllegalStateException("ProjectMemberRecord id cannot be null"),
            projectId = record.projectId,
            project = null, // 关联对象需要单独查询
            userId = record.userId,
            user = null, // 关联对象需要单独查询
            roleId = record.projectRoleId,
            role = null, // 关联对象需要单独查询
            joinedAt = record.joinedAt,
            deleted = record.deleted, // 添加逻辑删除标志
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     * @param entity 领域模型
     * @return 数据库记录
     */
    override fun toRecord(entity: ProjectMember): ProjectMemberRecord {
        return ProjectMemberRecord(
            projectId = entity.projectId,
            userId = entity.userId,
            projectRoleId = entity.roleId,
            joinedAt = entity.joinedAt
        ).apply {
            id = entity.id
            deleted = entity.deleted // 添加逻辑删除标志
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
