package com.task.domain.model.user

import java.time.OffsetDateTime

/**
 * 用户角色关联领域模型
 * 表示用户与角色之间的多对多关系
 */
data class UserRole(
    /**
     * 唯一标识
     */
    val id: Long?,

    /**
     * 用户ID
     */
    val userId: Long,

    /**
     * 角色ID
     */
    val roleId: Long,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null
)