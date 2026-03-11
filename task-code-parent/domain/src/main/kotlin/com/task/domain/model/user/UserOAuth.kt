package com.task.domain.model.user

import java.time.OffsetDateTime

/**
 * 用户第三方认证信息领域模型
 * 存储用户的第三方平台认证信息
 */
data class UserOAuth(
    /**
     * 唯一标识
     */
    val id: Long,

    /**
     * 关联的用户ID
     */
    val userId: Long,

    /**
     * 第三方认证提供商
     */
    val provider: OAuthProviderEnum?,

    /**
     * 第三方平台的用户ID
     */
    val providerUid: String,

    /**
     * 访问令牌
     */
    val accessToken: String? = null,

    /**
     * 刷新令牌
     */
    val refreshToken: String? = null,

    /**
     * 令牌过期时间
     */
    val tokenExpires: OffsetDateTime? = null,

    /**
     * 第三方平台的额外数据
     */
    val providerData: Map<String, Any>? = null,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号
     */
    val version: Int = 0
)
