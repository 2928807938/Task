package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 用户角色关联记录
 * 映射到数据库中的t_user_role表，实现用户与角色的多对多关联
 */
@Table("t_user_role")
data class UserRoleRecord(

    /**
     * 用户ID
     */
    val userId: Long,

    /**
     * 角色ID
     */
    val roleId: Long,

): BaseRecord()