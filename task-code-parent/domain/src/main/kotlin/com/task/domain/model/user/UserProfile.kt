package com.task.domain.model.user

import java.time.OffsetDateTime

/**
 * 用户个人资料领域模型
 * 包含用户的扩展信息
 */
data class UserProfile(
    /**
     * 唯一标识
     */
    val id: Long,

    /**
     * 关联的用户ID
     */
    val userId: Long,

    /**
     * 用户全名
     */
    val fullName: String? = null,

    /**
     * 用户电话号码
     */
    val phone: String? = null,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null
)
