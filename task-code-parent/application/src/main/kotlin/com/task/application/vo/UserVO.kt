package com.task.application.vo

/**
 * 登录响应视图对象
 */
data class LoginVo(

    /**
     * 认证令牌
     */
    val token: String,
    
    /**
     * 令牌过期时间（秒）
     */
    val expiresIn: Long
)