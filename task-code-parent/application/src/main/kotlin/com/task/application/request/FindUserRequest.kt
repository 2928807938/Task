package com.task.application.request

import jakarta.validation.constraints.NotBlank

/**
 * 查询用户请求参数
 */
data class FindUserRequest(
    /**
     * 查询参数，可以是邮箱或用户名
     */
    @field:NotBlank(message = "查询参数不能为空")
    val param: String,
    
    /**
     * 项目ID，如果提供则会额外返回用户是否在此项目中
     */
    val projectId: Long? = null
)
