package com.task.infrastructure.persistence.repositoryImpl

import com.task.domain.model.user.UserProfile
import com.task.domain.repository.UserProfileRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.UserProfileMapper
import com.task.infrastructure.persistence.record.UserProfileRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * UserProfileRepository接口的实现类
 * 实现用户配置相关的数据访问操作
 */
@Repository
class UserProfileRepositoryImpl(
    override val mapper: UserProfileMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<UserProfile, UserProfileRecord, UserProfileMapper>(), UserProfileRepository {

    override val entityClass: KClass<UserProfileRecord> = UserProfileRecord::class

    override fun getId(entity: UserProfile): Long {
        return entity.id
    }

    override fun toEntity(record: UserProfileRecord): UserProfile {
        return UserProfile(
            id = record.id ?: throw IllegalArgumentException("用户个人资料ID不能为空"),
            userId = record.userId,
            fullName = record.fullName,
            phone = record.phone,
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt
        )
    }

    override fun toRecord(entity: UserProfile): UserProfileRecord {
        return UserProfileRecord(
            userId = entity.userId,
            fullName = entity.fullName,
            phone = entity.phone
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
        }
    }

}
