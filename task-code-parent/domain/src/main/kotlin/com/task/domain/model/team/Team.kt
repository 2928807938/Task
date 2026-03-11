package com.task.domain.model.team

import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 团队领域模型
 * 代表系统中的一个团队
 */
data class Team(
    /**
     * 团队唯一标识
     */
    val id: Long,

    /**
     * 团队名称
     */
    val name: String,

    /**
     * 团队描述
     */
    val description: String? = null,

    /**
     * 团队创建者ID
     */
    val creatorId: Long,

    /**
     * 团队创建者
     */
    val creator: User? = null,

    /**
     * 团队成员列表
     */
    val members: List<TeamMember> = emptyList(),

    /**
     * 团队角色列表
     */
    val roles: List<TeamRole> = emptyList(),

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null
)
