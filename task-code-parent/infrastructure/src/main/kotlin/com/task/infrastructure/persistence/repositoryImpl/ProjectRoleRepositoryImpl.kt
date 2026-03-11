package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.project.ProjectRole
import com.task.domain.repository.ProjectRoleRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.ProjectRoleMapper
import com.task.infrastructure.persistence.record.ProjectRoleRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * ProjectRoleRepository接口的实现类
 * 实现项目角色相关的数据访问操作
 */
@Repository
class ProjectRoleRepositoryImpl(
    override val mapper: ProjectRoleMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<ProjectRole, ProjectRoleRecord, ProjectRoleMapper>(), ProjectRoleRepository {

    override val entityClass: KClass<ProjectRoleRecord> = ProjectRoleRecord::class

    override fun getId(entity: ProjectRole): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 项目角色数据库记录
     * @return 项目角色领域模型
     * @throws IllegalArgumentException 如果记录ID为空
     */
    override fun toEntity(record: ProjectRoleRecord): ProjectRole {
        return ProjectRole(
            id = record.id ?: throw IllegalArgumentException("Record ID cannot be null"),
            projectId = record.projectId,
            name = record.name,
            code = record.code,
            description = record.description,
            permissions = emptyList(), // 权限需要通过关联查询获取，这里默认为空列表
            sortOrder = record.sortOrder,
            isSystem = record.isSystem,
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 项目角色领域模型
     * @return 项目角色数据库记录
     */
    override fun toRecord(entity: ProjectRole): ProjectRoleRecord {
        return ProjectRoleRecord(
            id = entity.id,
            name = entity.name,
            projectId = entity.projectId,
            description = entity.description,
            code = entity.code,
            sortOrder = entity.sortOrder,
            isSystem = entity.isSystem,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            version = 1,  // 新记录版本号初始为0
            deleted = 0  // 新记录未删除
        )
    }
}
