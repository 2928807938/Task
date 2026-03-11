package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.permission.Permission
import com.task.domain.repository.PermissionRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.PermissionMapper
import com.task.infrastructure.persistence.record.PermissionRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * PermissionRepository接口的实现类
 * 实现权限相关的数据访问操作
 */
@Repository
class PermissionRepositoryImpl(
    override val mapper: PermissionMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<Permission, PermissionRecord, PermissionMapper>(), PermissionRepository {

    override val entityClass: KClass<PermissionRecord> = PermissionRecord::class

    override fun getId(entity: Permission): Long {
        return entity.id
    }

    // 将 PermissionRecord 转换为 Permission
    override fun toEntity(record: PermissionRecord): Permission {
        return Permission(
            id = record.id ?: 0,
            name = record.name,
            code = record.code,
            description = record.description,
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    // 将 Permission 转换为 PermissionRecord
    override fun toRecord(entity: Permission): PermissionRecord {
        return PermissionRecord(
            name = entity.name,
            code = entity.code,
            description = entity.description
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }

}
