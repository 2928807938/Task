package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.project.ProjectRolePermission
import com.task.domain.repository.ProjectRolePermissionRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.ProjectRolePermissionMapper
import com.task.infrastructure.persistence.record.ProjectRolePermissionRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * ProjectRolePermissionRepository接口的实现类
 * 实现项目角色权限相关的数据访问操作
 */
@Repository
class ProjectRolePermissionRepositoryImpl(
    override val mapper: ProjectRolePermissionMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<ProjectRolePermission, ProjectRolePermissionRecord, ProjectRolePermissionMapper>(), ProjectRolePermissionRepository {

    override val entityClass: KClass<ProjectRolePermissionRecord> = ProjectRolePermissionRecord::class

    override fun getId(entity: ProjectRolePermission): Long {
        return entity.id
    }

    /**
     * 将数据库记录转换为领域模型
     *
     * @param record 项目角色-权限关联数据库记录
     * @return 项目角色-权限关联领域模型
     * @throws IllegalArgumentException 如果记录ID为空
     */
    override fun toEntity(record: ProjectRolePermissionRecord): ProjectRolePermission {
        return ProjectRolePermission(
            id = record.id ?: throw IllegalArgumentException("Record ID cannot be null"),
            projectRoleId = record.projectRoleId,
            permissionId = record.permissionId,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    /**
     * 将领域模型转换为数据库记录
     *
     * @param entity 项目角色-权限关联领域模型
     * @return 项目角色-权限关联数据库记录
     */
    override fun toRecord(entity: ProjectRolePermission): ProjectRolePermissionRecord {
        return ProjectRolePermissionRecord(
            projectRoleId = entity.projectRoleId,
            permissionId = entity.permissionId
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}
