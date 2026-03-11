package com.task.domain.model.permission

import java.time.OffsetDateTime

/**
 * 角色领域模型
 * 代表系统中的一个全局角色
 */
data class Role(
    /**
     * 角色唯一标识
     */
    val id: Long,

    /**
     * 角色名称
     */
    val name: String,

    /**
     * 角色描述
     */
    val description: String? = null,

    /**
     * 角色拥有的权限列表
     */
    val permissions: List<Permission> = emptyList(),

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
