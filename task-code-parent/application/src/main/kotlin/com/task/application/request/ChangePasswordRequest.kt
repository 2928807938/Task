package com.task.application.request

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

/**
 * 修改密码请求
 */
data class ChangePasswordRequest(
    /**
     * 用户邮箱
     */
    @field:NotBlank(message = "邮箱不能为空")
    @field:Email(message = "邮箱格式不正确")
    val email: String,
    
    /**
     * 验证码
     */
    @field:NotBlank(message = "验证码不能为空")
    val verificationCode: String,
    
    /**
     * 新密码
     */
    @field:NotBlank(message = "新密码不能为空")
    val newPassword: String
)
