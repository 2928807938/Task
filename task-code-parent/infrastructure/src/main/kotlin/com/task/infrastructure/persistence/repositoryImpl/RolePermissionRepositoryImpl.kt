package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.permission.RolePermission
import com.task.domain.repository.RolePermissionRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RolePermissionMapper
import com.task.infrastructure.persistence.record.RolePermissionRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RolePermissionRepository接口的实现类
 * 实现角色权限相关的数据访问操作
 */
@Repository
class RolePermissionRepositoryImpl(
    override val mapper: RolePermissionMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<RolePermission, RolePermissionRecord, RolePermissionMapper>(), RolePermissionRepository {

    override val entityClass: KClass<RolePermissionRecord> = RolePermissionRecord::class

    override fun getId(entity: RolePermission): Long {
        return entity.id
    }

    // 将 RolePermissionRecord 转换为 RolePermission
    override fun toEntity(record: RolePermissionRecord): RolePermission {
        return RolePermission(
            id = record.id ?: 0,
            roleId = record.roleId,
            permissionId = record.permissionId,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    // 将 RolePermission 转换为 RolePermissionRecord
    override fun toRecord(entity: RolePermission): RolePermissionRecord {
        return RolePermissionRecord(
            roleId = entity.roleId,
            permissionId = entity.permissionId
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }

}
