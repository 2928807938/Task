package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 权限表记录类
 * 映射到数据库中的t_permission表，定义系统中所有可用的权限项
 */
@Table("t_permission")
data class PermissionRecord(

    /**
     * 权限名称，用于显示
     */
    val name: String,

    /**
     * 权限编码，如"task:create"，用于权限检查
     */
    val code: String,

    /**
     * 权限说明，描述权限的作用和范围
     */
    val description: String? = null,

) : BaseRecord()