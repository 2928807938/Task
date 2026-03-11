package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.user.User
import com.task.domain.model.user.UserStatusEnum
import com.task.domain.repository.UserRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.UserMapper
import com.task.infrastructure.persistence.record.UserRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * UserRepository接口的实现类
 * 实现用户相关的数据访问操作
 */
@Repository
class UserRepositoryImpl(
    override val mapper: UserMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<User, UserRecord, UserMapper>(), UserRepository {

    override val entityClass: KClass<UserRecord> = UserRecord::class

    override fun getId(entity: User): Long? {
        return entity.id
    }

    override fun toEntity(record: UserRecord): User {
        return User(
            id = record.id,
            username = record.username,
            passwordHash = record.passwordHash,
            email = record.email,
            roles = emptyList(), // 需要通过关联查询获取，这里先设为空列表
            lastLogin = record.lastLogin,
            status = UserStatusEnum.fromCode(record.status), // 假设有一个 fromCode 方法将 Int 转换为枚举
            profile = null, // 需要通过关联查询获取，这里先设为 null
            oauthConnections = emptyList(), // 需要通过关联查询获取，这里先设为空列表
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    override fun toRecord(entity: User): UserRecord {
        return UserRecord(
            username = entity.username,
            passwordHash = entity.passwordHash,
            email = entity.email,
            lastLogin = entity.lastLogin,
            status = entity.status?.code ?: UserStatusEnum.INACTIVE.code // 假设枚举有一个 code 属性
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
            version = entity.version
        }
    }
}
