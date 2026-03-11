package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

/**
 * 项目表记录类
 * 映射到数据库中的t_project表，存储项目信息
 */
@Table("t_project")
data class ProjectRecord(

    /**
     * 项目名称
     */
    val name: String,

    /**
     * 项目描述
     */
    val description: String?,

    /**
     * 所属团队ID，关联t_teams表
     */
    val teamId: Long,

    /**
     * 项目开始日期
     */
    val startDate: OffsetDateTime?,

    /**
     * 项目创建者ID，关联t_users表
     */
    val creatorId: Long,

    /**
     * 是否已归档
     */
    val archived: Boolean = false

    ) : BaseRecord()
