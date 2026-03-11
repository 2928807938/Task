package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 项目角色-权限关联表记录类
 * 映射到数据库中的t_project_role_permission表，实现项目角色与权限的多对多关联
 */
@Table("t_project_role_permission")
data class ProjectRolePermissionRecord(

    /**
     * 关联的项目角色ID
     */
    val projectRoleId: Long,

    /**
     * 关联的权限ID
     */
    val permissionId: Long,

) : BaseRecord()
