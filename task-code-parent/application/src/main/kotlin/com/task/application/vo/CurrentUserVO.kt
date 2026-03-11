package com.task.application.vo

/**
 * 当前用户信息视图对象
 * 用于返回当前登录用户的基本信息和权限列表
 */
data class CurrentUserVO(
    
    /**
     * 用户名
     */
    val username: String,
    
    /**
     * 用户权限列表
     * 包含用户所拥有的所有权限编码，用于前端权限控制
     * 例如：["TASK_CREATE", "TASK_UPDATE", "PROJECT_VIEW"]
     */
    val authorities: List<String>
)
