package com.task.application.request

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegisterRequest(

    /**
     * 用户名
     */
    @field:NotBlank(message = "用户名不能为空")
    @field:Size(min = 2, max = 10, message = "用户名长度必须在2-10个字符之间")
    val username: String,

    /**
     * 邮箱
     */
    @field:NotBlank(message = "邮箱不能为空")
    @field:Email(message = "邮箱格式不正确")
    @field:Size(max = 100, message = "邮箱长度不能超过100个字符")
    val email: String,

    /**
     * 密码
     */
    @field:NotBlank(message = "密码不能为空")
    val password: String,
    
    /**
     * 邮箱验证码
     */
    @field:NotBlank(message = "验证码不能为空")
    val verificationCode: String
)

data class SimpleRegisterRequest(

    @field:NotBlank(message = "用户名不能为空")
    @field:Size(min = 2, max = 10, message = "用户名长度必须在2-10个字符之间")
    val username: String,

    @field:NotBlank(message = "密码不能为空")
    val password: String,

    @field:NotBlank(message = "确认密码不能为空")
    val confirmPassword: String
)

/**
 * 登录请求
 */
data class LoginRequest(

    /**
     * 用户名或邮箱
     */
    @field:NotBlank(message = "用户名或邮箱不能为空")
    val username: String,
    
    /**
     * 密码
     */
    @field:NotBlank(message = "密码不能为空")
    val password: String
)
