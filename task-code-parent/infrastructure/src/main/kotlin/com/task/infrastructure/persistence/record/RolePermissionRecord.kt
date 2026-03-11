package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 角色-权限关联表记录类
 * 映射到数据库中的t_role_permission表，实现全局角色与权限的多对多关联
 */
@Table("t_role_permission")
data class RolePermissionRecord(
    
    /**
     * 关联的角色ID
     */
    val roleId: Long,
    
    /**
     * 关联的权限ID
     */
    val permissionId: Long,

) : BaseRecord()
