package com.task.application.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

/**
 * 创建项目角色请求
 */
data class CreateProjectRoleRequest(
    /**
     * 角色名称
     */
    @field:NotBlank(message = "角色名称不能为空")
    @field:Size(max = 50, message = "角色名称长度不能超过50个字符")
    val name: String,
    
    /**
     * 角色描述
     */
    @field:Size(max = 255, message = "角色描述长度不能超过255个字符")
    val description: String? = null
)
