package com.task.domain.model.team

import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 团队成员领域模型
 * 代表团队中的一个成员
 */
data class TeamMember(
    /**
     * 团队成员唯一标识
     */
    val id: Long,

    /**
     * 所属团队ID
     */
    val teamId: Long,

    /**
     * 所属团队
     */
    val team: Team? = null,

    /**
     * 用户ID
     */
    val userId: Long,

    /**
     * 用户
     */
    val user: User? = null,

    /**
     * 团队角色ID
     */
    val roleId: Long,

    /**
     * 团队角色
     */
    val role: TeamRole? = null,

    /**
     * 加入时间
     */
    val joinedAt: OffsetDateTime,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null
)
