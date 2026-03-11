package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 团队角色表记录类
 * 映射到数据库中的t_team_role表，存储团队角色信息
 */
@Table("t_team_role")
data class TeamRoleRecord(

    /**
     * 角色名称
     */
    val name: String,

    /**
     * 角色描述
     */
    val description: String?,

    /**
     * 所属团队ID，关联t_team表
     */
    val teamId: Long

) : BaseRecord()
