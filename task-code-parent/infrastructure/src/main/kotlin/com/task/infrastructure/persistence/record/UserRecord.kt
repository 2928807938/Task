package com.task.infrastructure.persistence.record

import com.task.domain.model.user.UserStatusEnum
import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 系统用户表记录类
 * 映射到数据库中的t_user表，存储所有用户的基本信息和认证信息
 */
@Table("t_user")
data class UserRecord(
    /**
     * 用户名，登录时使用，不可重复
     */
    val username: String,

    /**
     * 密码的哈希值，不存储明文密码
     */
    val passwordHash: String,

    /**
     * 用户电子邮箱，用于通知和找回密码，不可重复
     */
    val email: String,

    /**
     * 用户最后登录时间
     */
    val lastLogin: OffsetDateTime,

    /**
     * 用户状态编码：1表示活跃可用，0表示已停用
     * @see UserStatusEnum 用于在代码中使用枚举表示状态
     */
    val status: Int,
) : BaseRecord() {
    companion object {
        fun create(
            username: String,
            passwordHash: String,
            email: String,
            lastLogin: OffsetDateTime,
            status: Int,
            version: Int = 0
        ): UserRecord = UserRecord(
            username = username,
            passwordHash = passwordHash,
            email = email,
            lastLogin = lastLogin,
            status = status
        ).apply {
            this.version = version
        }
    }
}