package com.task.domain.model.team

import com.task.domain.model.permission.Permission
import java.time.OffsetDateTime

/**
 * 团队角色领域模型
 * 代表团队内的一个角色
 */
data class TeamRole(
    /**
     * 团队角色唯一标识
     */
    val id: Long,

    /**
     * 团队ID
     */
    val teamId: Long,

    /**
     * 角色名称
     */
    val name: String,

    /**
     * 角色描述
     */
    val description: String? = null,

    /**
     * 角色拥有的权限列表
     */
    val permissions: List<Permission> = emptyList(),

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null
)
