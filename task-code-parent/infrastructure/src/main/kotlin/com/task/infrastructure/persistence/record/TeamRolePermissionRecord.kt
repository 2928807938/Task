package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 团队角色-权限关联表记录类
 * 映射到数据库中的t_team_role_permission表，实现团队角色与权限的多对多关联
 */
@Table("t_team_role_permission")
data class TeamRolePermissionRecord(
    
    /**
     * 关联的团队角色ID
     */
    val teamRoleId: Long,
    
    /**
     * 关联的权限ID
     */
    val permissionId: Long,

) : BaseRecord()
