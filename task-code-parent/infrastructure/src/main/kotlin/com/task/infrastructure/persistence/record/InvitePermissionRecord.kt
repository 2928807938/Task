package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 邀请权限记录类
 * 映射到数据库中的t_invite_permission表，存储邀请权限信息
 */
@Table("t_invite_permission")
data class InvitePermissionRecord(
    /**
     * 邀请链接ID
     */
    val inviteLinkId: Long,
    
    /**
     * 系统或项目ID
     */
    val targetId: Long,
    
    /**
     * 目标类型：SYSTEM(系统), PROJECT(项目)
     */
    val targetType: String,
    
    /**
     * 角色ID
     */
    val roleId: Long,
    
    /**
     * 角色名称
     */
    val roleName: String

) : BaseRecord()