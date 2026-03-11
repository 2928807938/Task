package com.task.domain.model.permission

import java.time.OffsetDateTime

/**
 * 权限领域模型
 * 代表系统中的一个权限项
 */
data class Permission(
    /**
     * 权限唯一标识
     */
    val id: Long,

    /**
     * 权限名称
     */
    val name: String,

    /**
     * 权限编码，如 'task:create'
     */
    val code: String,

    /**
     * 权限描述
     */
    val description: String? = null,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime?,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)
