package com.task.domain.model.project

import com.task.domain.model.permission.Permission
import java.time.OffsetDateTime

/**
 * 项目角色领域模型
 * 代表项目内的一个角色
 */
data class ProjectRole(
    /**
     * 项目角色唯一标识
     */
    val id: Long,

    /**
     * 项目ID
     */
    val projectId: Long,

    /**
     * 角色名称
     */
    val name: String,

    /**
     * 角色编码，用于系统内部标识
     */
    val code: String? = null,

    /**
     * 角色描述
     */
    val description: String? = null,

    /**
     * 角色拥有的权限列表
     */
    val permissions: List<Permission> = emptyList(),

    /**
     * 角色排序值，用于在界面上展示的顺序
     */
    val sortOrder: Int = 0,

    /**
     * 是否为系统预设角色，系统预设角色不可删除
     */
    val isSystem: Boolean = false,

    /**
     * 创建时间
     */
    val createdAt: OffsetDateTime? = null,

    /**
     * 更新时间
     */
    val updatedAt: OffsetDateTime? = null,

    /**
     * 乐观锁版本号，用于并发控制
     */
    var version: Int
)
