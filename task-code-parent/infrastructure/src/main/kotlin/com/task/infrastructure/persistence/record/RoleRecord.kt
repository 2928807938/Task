package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 系统全局角色表记录类
 * 映射到数据库中的t_role表，存储系统中所有可用的角色定义
 */
@Table("t_role")
data class RoleRecord(
    
    /**
     * 角色名称，不可重复
     */
    val name: String,
    
    /**
     * 角色描述，说明角色的用途和权限范围
     */
    val description: String? = null

) : BaseRecord()