package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 项目成员表记录类
 * 映射到数据库中的t_project_member表，存储项目成员关系
 */
@Table("t_project_member")
data class ProjectMemberRecord(

    /**
     * 项目ID，关联t_projects表
     */
    val projectId: Long,

    /**
     * 用户ID，关联t_users表
     */
    val userId: Long,

    /**
     * 项目角色ID，关联t_project_roles表
     */
    val projectRoleId: Long,

    /**
     * 加入时间
     */
    val joinedAt: OffsetDateTime = OffsetDateTime.now(),

) : BaseRecord()
