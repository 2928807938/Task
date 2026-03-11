package com.task.domain.model.team

import java.time.OffsetDateTime

/**
 * 团队角色-权限关联领域模型
 * 表示团队角色与权限之间的多对多关系
 */
data class TeamRolePermission(
    /**
     * 唯一标识
     */
    val id: Long,

    /**
     * 团队角色ID
     */
    val teamRoleId: Long,

    /**
     * 权限ID
     */
    val permissionId: Long,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null
)
