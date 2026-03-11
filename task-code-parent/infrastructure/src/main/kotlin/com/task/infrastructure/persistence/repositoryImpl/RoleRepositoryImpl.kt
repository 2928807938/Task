package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.permission.Role
import com.task.domain.repository.RoleRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.RoleMapper
import com.task.infrastructure.persistence.record.RoleRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * RoleRepository接口的实现类
 * 实现角色相关的数据访问操作
 */
@Repository
class RoleRepositoryImpl(
    override val mapper: RoleMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<Role, RoleRecord, RoleMapper>(), RoleRepository {

    override val entityClass: KClass<RoleRecord> = RoleRecord::class

    override fun getId(entity: Role): Long {
        return entity.id
    }

    override fun toEntity(record: RoleRecord): Role {
        return Role(
            id = record.id ?: 0,
            name = record.name,
            description = record.description,
            permissions = emptyList(), // 权限列表需要通过其他查询获取，此处默认为空
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    override fun toRecord(entity: Role): RoleRecord {
        return RoleRecord(
            name = entity.name,
            description = entity.description
        ).apply {
            id = entity.id
            version = entity.version
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }

}
