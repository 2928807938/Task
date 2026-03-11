package com.task.application.request

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

/**
 * 发送邮箱验证码请求
 */
data class SendEmailVerificationCodeRequest(
    /**
     * 邮箱地址
     */
    @field:NotBlank(message = "邮箱不能为空")
    @field:Email(message = "邮箱格式不正确")
    val email: String,
    
    /**
     * 验证码类型
     * 如：注册、找回密码、修改密码等
     * 注册：register
     * 修改密码：change_password
     */
    @field:NotBlank(message = "验证码类型不能为空")
    val type: String
)
