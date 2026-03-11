package com.task.domain.model.user

import com.task.domain.model.permission.Role
import java.time.OffsetDateTime

/**
 * 用户领域模型
 * 代表系统中的一个用户账户
 */
data class User(
    /**
     * 用户唯一标识
     */
    val id: Long?,

    /**
     * 用户名，登录时使用
     */
    val username: String,

    /**
     * 密码的哈希值，不存储明文密码
     */
    val passwordHash: String,

    /**
     * 用户电子邮箱
     */
    val email: String,

    /**
     * 用户拥有的所有角色列表
     */
    val roles: List<Role> = emptyList(),

    /**
     * 用户最后登录时间
     */
    val lastLogin: OffsetDateTime,

    /**
     * 用户状态
     */
    val status: UserStatusEnum?,

    /**
     * 用户个人资料
     */
    val profile: UserProfile? = null,

    /**
     * 用户的第三方认证信息列表
     */
    val oauthConnections: List<UserOAuth> = emptyList(),

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
) {
    /**
     * 判断用户是否处于活跃状态
     * @return 如果用户状态为ACTIVE则返回true，否则返回false
     */
    fun isActive(): Boolean = status == UserStatusEnum.ACTIVE
}
