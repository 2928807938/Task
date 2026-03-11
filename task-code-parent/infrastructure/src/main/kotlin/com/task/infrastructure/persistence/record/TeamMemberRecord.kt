package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 团队成员表记录类
 * 映射到数据库中的t_team_member表，存储团队成员关系
 */
@Table("t_team_member")
data class TeamMemberRecord(

    /**
     * 团队ID，关联t_team表
     */
    val teamId: Long,

    /**
     * 用户ID，关联t_users表
     */
    val userId: Long,

    /**
     * 团队角色ID，关联t_team_role表
     */
    val roleId: Long,

    /**
     * 加入时间
     */
    val joinedAt: OffsetDateTime = OffsetDateTime.now(),

    ) : BaseRecord()
