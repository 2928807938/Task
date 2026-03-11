package com.task.infrastructure.persistence.repositoryImpl

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.task.domain.model.user.OAuthProviderEnum
import com.task.domain.model.user.UserOAuth
import com.task.domain.repository.UserOauthRepository
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.persistence.base.BaseRepository
import com.task.infrastructure.persistence.mapper.UserOauthMapper
import com.task.infrastructure.persistence.record.UserOauthRecord
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.stereotype.Repository
import kotlin.reflect.KClass

/**
 * UserOauthRepository接口的实现类
 * 实现用户OAuth认证相关的数据访问操作
 */
@Repository
class UserOauthRepositoryImpl(
    private val objectMapper: ObjectMapper,
    override val mapper: UserOauthMapper,
    override val template: R2dbcEntityTemplate,
    override val idGenerator: IdGeneratorService
) : BaseRepository<UserOAuth, UserOauthRecord, UserOauthMapper>(), UserOauthRepository {

    override val entityClass: KClass<UserOauthRecord> = UserOauthRecord::class

    override fun getId(entity: UserOAuth): Long {
        return entity.id
    }

    override fun toEntity(record: UserOauthRecord): UserOAuth {
        return UserOAuth(
            id = record.id ?: throw IllegalArgumentException("用户第三方认证ID不能为空"),
            userId = record.userId,
            provider = OAuthProviderEnum.fromCode(record.provider), // 假设有一个 fromCode 方法将 Int 转换为枚举
            providerUid = record.providerUid,
            accessToken = record.accessToken,
            refreshToken = record.refreshToken,
            tokenExpires = record.tokenExpires,
            providerData = record.providerData?.let {
                try {
                    objectMapper.readValue(it, object : TypeReference<Map<String, Any>>() {})
                } catch (e: Exception) {
                    emptyMap()
                }
            },
            createdAt = record.createdAt!!,
            updatedAt = record.updatedAt,
            version = record.version
        )
    }

    override fun toRecord(entity: UserOAuth): UserOauthRecord {
        return UserOauthRecord(
            userId = entity.userId,
            provider = entity.provider!!.code,
            providerUid = entity.providerUid,
            accessToken = entity.accessToken,
            refreshToken = entity.refreshToken,
            tokenExpires = entity.tokenExpires,
            providerData = entity.providerData?.let {
                try {
                    objectMapper.writeValueAsString(it)
                } catch (e: Exception) {
                    null
                }
            }
        ).apply {
            id = entity.id
            createdAt = entity.createdAt
            updatedAt = entity.updatedAt
            version = entity.version
        }
    }
}
