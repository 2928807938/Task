package com.task.domain.model.project

import java.time.OffsetDateTime

/**
 * 项目角色-权限关联领域模型
 * 表示项目角色与权限之间的多对多关系
 */
data class ProjectRolePermission(
    /**
     * 唯一标识
     */
    val id: Long,

    /**
     * 项目角色ID
     */
    val projectRoleId: Long,

    /**
     * 权限ID
     */
    val permissionId: Long,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)
