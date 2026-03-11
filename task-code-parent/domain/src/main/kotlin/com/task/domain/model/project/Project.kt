package com.task.domain.model.project

import com.task.domain.model.team.Team
import com.task.domain.model.user.User
import java.time.OffsetDateTime

/**
 * 项目领域模型
 * 代表系统中的一个项目
 */
data class Project(
    /**
     * 项目唯一标识
     */
    val id: Long? = null,

    /**
     * 项目名称
     */
    val name: String,

    /**
     * 项目描述
     */
    val description: String? = null,

    /**
     * 所属团队ID
     */
    val teamId: Long,

    /**
     * 所属团队
     */
    val team: Team? = null,

    /**
     * 项目开始日期
     */
    val startDate: OffsetDateTime? = null,

    /**
     * 项目创建者ID
     */
    val creatorId: Long,

    /**
     * 项目创建者
     */
    val creator: User? = null,

    /**
     * 是否已归档
     */
    val archived: Boolean = false,

    /**
     * 项目成员列表
     */
    val members: List<ProjectMember> = emptyList(),

    /**
     * 项目角色列表
     */
    val roles: List<ProjectRole> = emptyList(),

    /**
     * 项目归档记录列表
     */
    val archiveRecords: List<ProjectArchiveRecord> = emptyList(),

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime? = null,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)
