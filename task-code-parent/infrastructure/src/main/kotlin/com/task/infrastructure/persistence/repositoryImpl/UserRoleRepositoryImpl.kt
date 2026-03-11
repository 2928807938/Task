package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.user.UserRole
import com.task.domain.repository.UserRoleRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.UserRoleMapper
import com.task.infrastructure.persistence.record.UserRoleRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * UserRoleRepository接口的实现类
 * 实现用户角色关联相关的数据访问操作
 */
@Repository
class UserRoleRepositoryImpl(
    override val mapper: UserRoleMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<UserRole, UserRoleRecord, UserRoleMapper>(), UserRoleRepository {

    override val entityClass: KClass<UserRoleRecord> = UserRoleRecord::class

    override fun getId(entity: UserRole): Long? {
        return entity.id
    }

    override fun toEntity(record: UserRoleRecord): UserRole {
        return UserRole(
            id = record.id,
            userId = record.userId,
            roleId = record.roleId,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt
        )
    }

    override fun toRecord(entity: UserRole): UserRoleRecord {
        return UserRoleRecord(
            userId = entity.userId,
            roleId = entity.roleId
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }
}