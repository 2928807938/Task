package com.task.application.vo

import com.task.domain.model.team.TeamMember
import java.time.OffsetDateTime

/**
 * 团队成员视图对象
 * 包含团队成员的详细信息
 */
data class TeamMemberVO(

    /**
     * 团队成员ID
     */
    val id: Long,

    /**
     * 所属团队ID
     */
    val teamId: Long,

    /**
     * 用户ID
     */
    val userId: Long,

    /**
     * 用户名
     */
    val username: String,

    /**
     * 用户全名
     */
    val fullName: String?,

    /**
     * 用户邮箱
     */
    val email: String?,

    /**
     * 团队角色ID
     */
    val roleId: Long,

    /**
     * 团队角色名称
     */
    val roleName: String?,

    /**
     * 加入时间
     */
    val joinedAt: OffsetDateTime,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime
) {
    companion object {
        /**
         * 从领域模型创建视图对象
         *
         * @param teamMember 团队成员领域模型
         * @param username 用户名
         * @param fullName 用户全名
         * @param email 用户邮箱
         * @param roleName 角色名称
         * @return 团队成员视图对象
         */
        fun fromDomain(
            teamMember: TeamMember,
            username: String = "未知用户",
            fullName: String? = null,
            email: String? = null,
            roleName: String? = "未知角色"
        ): TeamMemberVO {
            return TeamMemberVO(
                id = teamMember.id,
                teamId = teamMember.teamId,
                userId = teamMember.userId,
                username = username,
                fullName = fullName,
                email = email,
                roleId = teamMember.roleId,
                roleName = roleName,
                joinedAt = teamMember.joinedAt,
                createdAt = teamMember.createdAt
            )
        }
    }
} 