package com.task.application.vo

/**
 * 项目角色视图对象
 * 用于前端展示项目角色信息
 */
data class ProjectRoleVO(
    /**
     * 角色ID
     */
    val id: Long,
    
    /**
     * 角色名称
     */
    val name: String,
    
    /**
     * 角色描述
     */
    val description: String?,

    /**
     * 是否为系统预设角色，系统预设角色不可删除
     */
    var isSystem: Boolean
)
