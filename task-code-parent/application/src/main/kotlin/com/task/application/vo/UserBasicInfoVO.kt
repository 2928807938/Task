package com.task.application.vo

/**
 * 用户基本信息视图对象
 * 用于返回用户的基本信息（ID、名称和邮箱）
 */
data class UserBasicInfoVO(
    
    /**
     * 用户ID
     */
    val id: Long,
    
    /**
     * 用户名称
     * 如果有全名则返回全名，否则返回用户名
     */
    val name: String,
    
    /**
     * 用户邮箱
     */
    val email: String,
    
    /**
     * 是否是当前登录用户自己
     */
    val isSelf: Boolean = false,
    
    /**
     * 是否已加入当前项目
     * 只有在提供projectId参数时才有效
     */
    val isInProject: Boolean = false
)
