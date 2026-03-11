package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 团队表记录类
 * 映射到数据库中的t_team表，存储所有团队的基本信息
 */
@Table("t_team")
data class TeamRecord(

    /**
     * 团队名称，不可重复
     */
    val name: String,

    /**
     * 团队描述
     */
    val description: String?,

    /**
     * 团队创建者ID，关联t_users表
     */
    val creatorId: Long

) : BaseRecord()
