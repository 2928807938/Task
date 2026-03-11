package com.task.infrastructure.persistence.record

import com.task.domain.model.user.OAuthProviderEnum
import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 用户第三方登录表记录类
 * 映射到数据库中的t_user_oauth表，存储用户的第三方账号关联信息
 */
@Table("t_user_oauth")
data class UserOauthRecord(
    
    /**
     * 关联的用户id，一对多
     */
    val userId: Long,
    
    /**
     * 提供商类型
     * @see OAuthProviderEnum 用于在代码中使用枚举表示提供商类型
     */
    val provider: Int,
    
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
     * 存储第三方平台的额外数据（JSONB类型，使用String表示）
     */
    val providerData: String? = null,

) : BaseRecord()
